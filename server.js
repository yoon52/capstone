const { app, pool, PORT, upload, uploadId } = require('./db');

const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const got = require("got");

const { performOCR, calculateSimilarity } = require('./ocr');
const { handleNaverCallback } = require('./NaverOAuth.js');
const { handleKakaoCallback } = require('./kakaoOAuth');

require('./chat.js')
// CORS 처리를 위한 미들웨어 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// 이미지를 제공할 디렉토리 설정
app.use('/uploads', express.static('uploads'));
app.use('/uploads_id', express.static('uploads_id'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// OCR 및 유사도 검증을 위한 POST 엔드포인트 정의
app.post('/api/verify', async (req, res) => {
  try {
    console.log('클라이언트 요청 수신: OCR 및 유사도 검증 시작');

    const { imageUrl, userId } = req.body;

    console.log('이미지 URL:', imageUrl);
    console.log('사용자 ID(학번):', userId);

    // OCR 수행
    console.log('Cloud Vision API를 사용하여 OCR 수행');
    const ocrResult = await performOCR(imageUrl);
    console.log('OCR 결과:', ocrResult);

    // 유사도 계산
    console.log('유사도 검증 시작');
    const similarity = calculateSimilarity(userId, ocrResult);
    console.log('유사도:', similarity);

    // 클라이언트 응답
    console.log('클라이언트에게 응답: OCR 결과와 유사도 전송');
    res.status(200).json({ ocrResult, similarity });
  } catch (error) {
    console.error('OCR 및 유사도 검증 오류:', error);
    res.status(500).json({ error: 'OCR 및 유사도 검증 중에 오류가 발생했습니다.' });
  }
});

// 랜덤 시크릿 키 생성 함수
const generateRandomSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 세션 설정
app.use(
  session({
    secret: generateRandomSecret(32), // 랜덤 시크릿 키 적용
    resave: false,
    saveUninitialized: true
  })
);

//로그인, 회원가입 관련
// 사용자 등록 엔드포인트
app.post('/signup', uploadId.single('studentIdImage'), async (req, res) => {
  const { id, password, email, department, grade, name } = req.body;

  // 비밀번호 확인
  if (password !== req.body.confirmPassword) {
    return res.status(400).json({ error: '비밀번호와 비밀번호 재입력이 일치하지 않습니다.' });
  }

  // 비밀번호 유효성 검사
  const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
  if (!isValidPassword) {
    return res.status(400).json({ error: '비밀번호는 영문, 숫자, 특수문자를 조합하여 10~16자로 입력해주세요.' });
  }

  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 이미지 URL 처리
    const studentIdImageUrl = req.file ? req.file.filename : null;

    // 사용자 추가 쿼리 실행
    const addUserQuery = `
      INSERT INTO users (id, password, email, department, grade, name, student_id_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 사용자 등록
    await pool.execute(addUserQuery, [id, hashedPassword, email, department, grade, name, studentIdImageUrl]);

    // 사용자 등록 성공 응답
    res.status(201).json({ message: '사용자 등록 성공' });
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
  }
});

// 사용자 로그인 엔드포인트
app.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    // 사용자 조회
    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const user = userRows[0];

    if (!user) {
      // 사용자가 존재하지 않는 경우
      return res.status(401).json({ error: '사용자가 존재하지 않습니다.' });
    }

    if (user.admin === 'pending') {
      // 승인 대기 중인 사용자인 경우
      return res.status(403).json({ error: '승인 대기 중입니다. 관리자의 승인을 기다려주세요.' });
    }

    // 비밀번호 비교
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // 비밀번호 불일치
      return res.status(401).json({ error: '비밀번호가 잘못되었습니다.' });
    }

    if (user.admin === 'rejected') {
      // 반려된 사용자인 경우
      const rejectionReason = user.rejection_reason || '관리자에게 문의하세요.';
      return res.status(403).json({ error: '승인이 거절되었습니다.', rejectionReason });
    }

    // 로그인 성공
    const isAdmin = user.admin === 'admin';
    const message = isAdmin ? '관리자로 로그인 되었습니다.' : '로그인 성공';
    res.status(200).json({ message, id: user.id, isAdmin });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '로그인에 실패했습니다.' });
  }
});


// 아이디 찾기 엔드포인트
app.post('/find-id', async (req, res) => {
  try {
    const { email, department, grade } = req.body;

    // MySQL 쿼리 실행
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND department = ? AND grade = ?',
      [email, department, grade]
    );
    connection.release();

    // 결과가 있는 경우
    if (rows.length > 0) {
      res.status(200).json({ id: rows[0].id });
    } else {
      res.status(404).json({ error: '아이디를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 비밀번호 해싱 함수
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// 비밀번호 재설정 엔드포인트
app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 임시 비밀번호 생성 (예시로 랜덤 문자열 생성)
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(temporaryPassword);

    // 데이터베이스에 새로운 비밀번호 저장
    const [result] = await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // 데이터베이스에 새로운 비밀번호가 업데이트되었는지 확인
    if (result.affectedRows > 0) {
      // 임시 비밀번호와 함께 성공 메시지 응답 전송
      res.status(200).json({ message: `임시 비밀번호는'${temporaryPassword}'입니다. 로그인 후 비밀번호 변경해주세요.` });
    } else {
      res.status(404).json({ error: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({ error: '서버 오류로 인해 비밀번호를 재설정할 수 없습니다.' });
  }
});

// 사용자의 승인 상태를 업데이트하는 API 엔드포인트
app.put('/users/:userId/approval', async (req, res) => {
  const { userId } = req.params;
  const { approvalStatus, rejectionReason } = req.body;

  try {
    // 사용자의 승인 상태 업데이트
    await pool.query('UPDATE users SET admin = ?, rejection_reason = ? WHERE id = ?', [approvalStatus, rejectionReason, userId]);
    res.status(200).json({ message: '사용자 승인 상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 상태 업데이트 오류:', error);
    res.status(500).json({ error: '사용자 승인 상태를 업데이트하는 중에 오류가 발생했습니다.' });
  }
});


// 승인 완료된 사용자 정보 가져오는 엔드포인트
app.get('/users/approved', async (req, res) => {
  try {
    // 승인 완료된 사용자 정보를 가져오는 쿼리 실행
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin = 'approved'`;
    const [rows] = await pool.query(query);

    res.status(200).json(rows);
  } catch (error) {
    console.error('승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});


// 중복 확인 엔드포인트
app.get('/checkUser', async (req, res) => {
  const userId = req.query.id; // 클라이언트로부터 요청된 아이디를 가져옵니다.

  try {
    // 사용자 조회 쿼리 실행
    const findUserQuery = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await pool.execute(findUserQuery, [userId]); // 사용자 ID를 쿼리 매개변수로 전달합니다.

    if (rows.length > 0) {
      // 사용자가 이미 존재할 경우
      res.status(200).json({ available: false });
    } else {
      // 사용자가 존재하지 않을 경우
      res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
  }
});
//내정보 엔드포인트
app.post('/myinfo', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 사용자 정보 응답
        res.status(200).json({
          id: user.id,
          name: user.name,
          grade: user.grade,
          department: user.department,
          email: user.email
        });
      } else {
        // 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('내 정보 확인 오류:', error);
    res.status(500).json({ error: '내 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 회원 탈퇴 엔드포인트
app.post('/deleteaccount', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 사용자 삭제
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
      } else {
        // 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 수정 엔드포인트
app.post('/edituserinfo', async (req, res) => {
  const { userId, editedUserInfo } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 사용자 정보 업데이트
      const user = rows[0];
      const updatedUserInfo = { ...user, ...editedUserInfo };

      // 사용자 정보 업데이트 쿼리 실행
      await pool.execute(
        'UPDATE users SET name = ?, grade = ?, department = ?, email = ? WHERE id = ?',
        [updatedUserInfo.name, updatedUserInfo.grade, updatedUserInfo.department, updatedUserInfo.email, userId]
      );

      res.status(200).json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    res.status(500).json({ error: '사용자 정보를 수정하는 중 오류가 발생했습니다.' });
  }
});
// 비밀번호 변경 엔드포인트
app.post('/changepassword', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 현재 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 새로운 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 새로운 비밀번호로 사용자 정보 업데이트
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
      } else {
        // 현재 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ error: '비밀번호를 변경하는 중 오류가 발생했습니다.' });
  }
});


app.get('/users', async (req, res) => {
  try {
    // 모든 승인되지 않은 사용자 정보를 가져오는 쿼리 실행
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin != 'admin' AND admin != 'approved'`;
    const [rows] = await pool.query(query);

    // 반환된 사용자 목록이 비어있는지 확인
    if (rows.length === 0) {
      // 비어있는 경우 204 No Content 상태 코드 반환
      res.status(204).send();
    } else {
      // 사용자 정보가 있는 경우 200 OK 상태 코드와 함께 데이터 반환
      res.status(200).json(rows);
    }
  } catch (error) {
    // 오류 발생 시 500 Internal Server Error 상태 코드 반환
    console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});


// DELETE 엔드포인트 - /deletefromadmin/:userId
app.delete('/deletefromadmin/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const connection = await pool.getConnection();
    const [results, fields] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();

    if (results.affectedRows > 0) {
      res.status(200).json({ message: '사용자 삭제 성공' });
    } else {
      res.status(404).json({ error: '해당 사용자를 찾을 수 없음' });
    }
  } catch (error) {
    console.error('사용자 삭제 중 오류 발생:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 세션에 저장된 사용자 ID를 기반으로 사용자 정보를 반환하는 엔드포인트
app.get('/getUserInfo', async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    // 사용자 ID가 없으면 권한 없음(401) 응답 보내기
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    // 데이터베이스에서 해당 사용자 정보 가져오기
    const query = `SELECT id, name, department, grade, rates FROM users WHERE id = ?`;
    const [rows] = await pool.query(query, [userId]);

    // 사용자 정보가 없으면 사용자를 찾을 수 없음(404) 응답 보내기
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    // 사용자 정보 반환
    let userInfo = rows[0];
    // 학과명을 매핑하기 위한 객체
    const departmentMap = {
      'software_engineering': '소프트웨어학과',
      'computer_science': '컴퓨터공학과',
      'design': '디자인학과',
      'business-administration': '경영학과'
      // 필요에 따라 추가적인 부서를 매핑할 수 있습니다.
    };

    // 매핑된 학과명으로 변경
    userInfo.department = departmentMap[userInfo.department];

    // 사용자의 결제 내역을 가져와서 총 판매액을 계산
    const [sales] = await pool.execute('SELECT IFNULL(SUM(p.amount), 0) AS total_sales FROM products pr JOIN payments p ON pr.id = p.product_id WHERE pr.user_id = ?', [userId]);
    const totalSales = sales[0].total_sales;

    // 사용자 정보에 총 판매액 정보를 추가하여 클라이언트에 응답
    const userInfoWithSales = {
      ...userInfo,
      total_sales: totalSales
    };
    res.json(userInfoWithSales);
  } catch (error) {
    console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});

//네이버 로그인 엔드포인트
app.get('/oauth/naver/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    // 네이버 OAuth 모듈을 통해 사용자 정보 및 액세스 토큰을 가져옵니다.
    const { userId, accessToken } = await handleNaverCallback(code, state);

    // 여기서부터는 데이터베이스 처리 로직입니다.
    // 사용자 정보를 데이터베이스에서 조회하거나 저장하는 작업을 수행합니다.
    const sqlFindUser = 'SELECT * FROM social_logins WHERE user_id = ?';
    const [rows] = await pool.query(sqlFindUser, [userId]);

    if (rows.length > 0) {
      // 이미 존재하는 사용자인 경우 로그인 처리 등을 수행
      console.log('User already exists. Perform login actions...');
      // 여기에서 로그인 처리 로직을 추가할 수 있습니다.
      // 예: 세션 설정 등

      // 성공 시 클라이언트로 리다이렉트
      return res.redirect('http://localhost:3000/Main');
    } else {
      // 새로운 사용자인 경우 데이터베이스에 저장
      const userData = {
        user_id: userId,
        social_token: accessToken,
        token_type: 'naver',
        expires_at: null, // Optional: Set token expiration datetime if needed
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // 변환된 DATETIME 형식
      };

      // MySQL에 삽입 쿼리 실행
      const sqlInsertUser = 'INSERT INTO social_logins SET ?';
      await pool.query(sqlInsertUser, userData);

      console.log('New Naver User Profile saved to database:', userData);

      // 성공 시 클라이언트로 리다이렉트
      return res.redirect('http://localhost:3000/Main');
    }
  } catch (error) {
    console.error('Naver OAuth Error:', error);
    res.status(500).send('Naver OAuth Error');
  }
});
//카카오 로그인 엔드포인트
app.get('/oauth/kakao/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // 카카오 OAuth 모듈을 통해 사용자 정보 및 액세스 토큰을 가져옵니다.
    const { userId, accessToken } = await handleKakaoCallback(code);

    // 여기서부터는 데이터베이스 처리 로직입니다.
    // 사용자 정보를 데이터베이스에서 조회하거나 저장하는 작업을 수행합니다.
    const sqlFindUser = 'SELECT * FROM social_logins WHERE user_id = ?';
    const [rows] = await pool.query(sqlFindUser, [userId]);

    if (rows.length > 0) {
      // 이미 존재하는 사용자인 경우 로그인 처리 등을 수행
      console.log('User already exists. Perform login actions...');
      // 여기에서 로그인 처리 로직을 추가할 수 있습니다.
      // 예: 세션 설정 등

      // 성공 시 클라이언트로 리다이렉트
      return res.redirect('http://localhost:3000/Main');
    } else {
      // 새로운 사용자인 경우 데이터베이스에 저장
      const userData = {
        user_id: userId,
        social_token: accessToken,
        token_type: 'kakao',
        expires_at: null, // Optional: Set token expiration datetime if needed
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // 변환된 DATETIME 형식
      };

      // MySQL에 삽입 쿼리 실행
      const sqlInsertUser = 'INSERT INTO social_logins SET ?';
      await pool.query(sqlInsertUser, userData);

      console.log('New Kakao User Profile saved to database:', userData);

      // 성공 시 클라이언트로 리다이렉트
      return res.redirect('http://localhost:3000/Main');
    }
  } catch (error) {
    console.error('Kakao OAuth Error:', error);
    res.status(500).send('Kakao OAuth Error');
  }
});

//상품 관련



// 결제 완료 후 요청 처리 엔드포인트
app.post("/confirm", async function (req, res) {
  const { paymentKey, orderId, amount, userId, productId } = req.body;

  const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
  const encryptedSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

  try {
    // 토스페이먼츠 API를 사용하여 결제 승인 요청
    const response = await got.post("https://api.tosspayments.com/v1/payments/confirm", {
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      json: {
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,

      },
      responseType: "json",
    });

    // 결제 성공 시 데이터베이스에 결제 정보 저장
    const { statusCode, body } = response;
    await savePaymentInfo(orderId, amount, paymentKey, userId, productId);

    // 클라이언트에 응답 반환
    res.status(statusCode).json(body);
  } catch (error) {
    // 결제 실패 시 에러 처리
    console.error('Payment confirmation failed:', error);
    res.status(error.response?.statusCode || 500).json(error.response?.body || { error: 'Payment failed' });
  }
});

// 결제 엔드포인트 수정
app.get('/payments/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // 해당 사용자의 결제 내역을 가져옵니다.
    const [rows] = await pool.query('SELECT * FROM payments WHERE user_id = ?', [userId]);

    // 각 결제 항목에 대한 상품 이름을 가져옵니다.
    const paymentsWithProductNames = await Promise.all(
      rows.map(async (payment) => {
        const productName = await getProductNameByPaymentId(payment.id);
        return { ...payment, productName }; // 각 결제 항목에 상품 이름을 추가하여 반환
      })
    );

    res.json(paymentsWithProductNames); // 해당 사용자의 결제 내역과 각 결제 항목에 대한 상품 이름을 JSON 형태로 응답합니다.
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});


// Get product name by payment ID
const getProductNameByPaymentId = async (paymentId) => {
  try {
    const [rows] = await pool.query('SELECT p.name AS productName FROM payments py JOIN products p ON py.product_id = p.id WHERE py.id = ?', [paymentId]);
    if (rows.length > 0) {
      return rows[0].productName;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching product name by payment ID:', error);
    throw error;
  }
};

// 결제 정보를 데이터베이스에 저장하는 함수
const savePaymentInfo = async (orderId, amount, paymentKey, userId, productId) => {
  const connection = await pool.getConnection();

  try {
    // 결제 정보 삽입 쿼리
    const insertQuery = `
  INSERT INTO payments (orderId, amount, paymentKey, createdAt, user_id, product_id)
  VALUES (?, ?, ?, NOW(), ?, ?)
`;
    const [result] = await connection.execute(insertQuery, [orderId, amount, paymentKey, userId, productId]);
    connection.release(); // 연결 해제
    return result.insertId; // 삽입된 레코드의 ID 반환
  } catch (error) {
    console.error('Error saving payment information:', error);
    throw error;
  }
};

// 클라이언트가 보낸 상품 ID를 이용하여 상품 정보를 반환하는 엔드포인트
app.get('/payedcon/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const connection = await pool.getConnection();
    const [product] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    connection.release();

    if (product.length > 0) {
      res.json(product[0]); // 상품 정보 반환
    } else {
      res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 상품 검색 및 검색어 저장 엔드포인트
app.get('/products', async (req, res) => {
  const searchTerm = req.query.search;
  const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

  try {
    if (!searchTerm) {
      // 검색어가 없는 경우 모든 상품을 반환
      const [rows] = await pool.execute('SELECT * FROM products');

      // 각 상품의 이미지 파일 경로를 클라이언트로 전달
      const productsWithImagePath = rows.map(product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          createdAt: product.createdAt,
          user_id: product.user_id,
          views: product.views,
          status: product.status,
          image: product.image ? `https://${req.get('host')}/uploads/${product.image}` : null
        };
      });

      res.json(productsWithImagePath);
    } else {
      // 검색어가 있는 경우 해당 검색어를 포함하는 상품을 반환
      const [rows] = await pool.execute('SELECT * FROM products WHERE name LIKE ?', [`%${searchTerm}%`]);

      // 각 상품의 이미지 파일 경로를 클라이언트로 전달
      const productsWithImagePath = rows.map(product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          createdAt: product.createdAt,
          user_id: product.user_id,
          views: product.views,
          status: product.status,
          image: product.image ? `https://${req.get('host')}/uploads/${product.image}` : null
        };
      });

      // 검색어 저장
      if (userId) {
        await saveSearchTerm(searchTerm, userId);
      }

      res.json(productsWithImagePath);
    }
  } catch (error) {
    console.error('Error fetching products from database:', error);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});
//상품관리 엔드포인트
app.get('/productsmanage', async (req, res) => {
  const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

  // 사용자 ID가 없는 경우
  if (!userId) {
    return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
  }

  try {
    // 해당 사용자가 작성한 상품 목록 조회 쿼리
    const [rows] = await pool.query('SELECT * FROM products WHERE user_id = ?', [userId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('상품 목록 가져오기 오류:', error);
    return res.status(500).json({ error: '상품 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 상품 삭제 엔드포인트
app.delete('/productsmanage/:productId', async (req, res) => {
  const productId = req.params.productId;
  const userId = req.header('user_id');

  // 사용자 ID가 없는 경우
  if (!userId) {
    return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
  }

  try {
    // 외래 키를 참조하는 다른 테이블의 레코드 삭제
    await pool.query('DELETE FROM messages WHERE productId = ?', [productId]);

    // 상품과 사용자의 일치 여부 확인 쿼리
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId]);

    // 상품이 존재하지 않는 경우
    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 상품을 찾을 수 없거나 삭제할 권한이 없습니다.' });
    }

    // 상품 삭제 쿼리
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);

    return res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return res.status(500).json({ error: '상품 삭제 중 오류가 발생했습니다.' });
  }
});

// AddProduct 엔드포인트에서 이미지 파일의 이름만을 데이터베이스에 저장
app.post('/addProduct', upload.single('image'), async (req, res) => {
  const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.
  const { name, description, price } = req.body;
  let imageUrl;

  // 요청 본문의 데이터가 올바르게 전달되는지 확인합니다.
  if (!name || !price || isNaN(price)) {
    return res.status(400).send('상품 이름, 가격을 올바르게 입력해주세요.');
  }

  // 이미지 파일이 있는 경우에만 이미지 URL을 생성합니다.
  if (req.file) {
    // 이미지 파일의 이름만을 imageUrl로 설정
    imageUrl = req.file.filename;
  }

  const INSERT_PRODUCT_QUERY = `INSERT INTO products (user_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.execute(INSERT_PRODUCT_QUERY, [userId, name, description, price, imageUrl]);
    console.log('상품이 성공적으로 추가되었습니다.');
    res.status(200).send('상품이 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('상품 추가 오류:', error);
    res.status(500).send('상품 추가에 실패했습니다.');
  }
});

// 검색어 저장 함수
async function saveSearchTerm(searchTerm, userId) {
  try {
    // 검색어와 사용자 ID가 모두 유효한 경우에만 처리
    if (searchTerm !== undefined && userId !== undefined) {
      const [result] = await pool.execute('INSERT INTO search_history (search_term, user_id) VALUES (?, ?)', [searchTerm, userId]);
      console.log(`검색어 로그: 검색어 "${searchTerm}"가 사용자 ID "${userId}"에 의해 저장되었습니다.`);
      console.log('검색어가 성공적으로 저장되었습니다.');
    } else {
      console.error('검색어 또는 사용자 ID가 유효하지 않습니다.');
    }
  } catch (error) {
    console.error('검색어 저장 오류:', error);
  }
}

// 검색어 저장 엔드포인트
app.post('/searchHistory', async (req, res) => {
  const { searchTerm, userId } = req.body; // 클라이언트에서 userId도 함께 전송합니다.
  if (searchTerm && userId) {
    try {
      const [result] = await pool.execute('INSERT INTO search_history (search_term, user_id) VALUES (?, ?)', [searchTerm, userId]);
      console.log('검색어가 성공적으로 저장되었습니다.');
      res.sendStatus(200);
    } catch (error) {
      console.error('검색어 저장 오류:', error);
      res.sendStatus(500);
    }
  } else {
    res.status(400).send('검색어 또는 사용자 ID가 제공되지 않았습니다.');
  }
});

// 저장된 검색어 기록을 반환하는 엔드포인트
app.get('/searchHistory', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT * FROM search_history ORDER BY search_date DESC LIMIT 1');
    if (result.length > 0) {
      res.json({ searchTerm: result[0].search_term });
    } else {
      res.json({ searchTerm: '' });
    }
  } catch (error) {
    console.error('저장된 검색어 불러오기 오류:', error);
    res.sendStatus(500);
  }
});

// products/latest 엔드포인트를 만듭니다.
app.get('/products/latest', async (req, res) => {
  try {
    // 최신순으로 상품을 조회하는 쿼리를 실행합니다.
    const latestProductsQuery = `
        SELECT *
        FROM products
        ORDER BY createdAt desc
      `;
    // 쿼리를 실행하여 최신순으로 정렬된 상품 목록을 가져옵니다.
    const [latestProductsRows] = await pool.execute(latestProductsQuery);

    // 최신순으로 정렬된 상품 목록을 클라이언트에 응답합니다.
    res.json(latestProductsRows);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    // 오류가 발생한 경우 500 상태 코드와 오류 메시지를 클라이언트에 응답합니다.
    res.status(500).json({ error: 'Failed to fetch latest products' });
  }
});


// products/detail/:productId 엔드포인트
app.get('/products/detail/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // 데이터베이스에서 상품을 조회합니다.
    const productDetailQuery = `
      SELECT *
      FROM products
      WHERE id = ?
    `;

    const [productDetailRows] = await pool.execute(productDetailQuery, [productId]);

    // 조회된 상품이 존재하지 않는 경우 404 상태 코드를 반환합니다.
    if (!productDetailRows || productDetailRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 상세 정보를 클라이언트에 응답합니다.
    res.json(productDetailRows[0]);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.status(500).json({ error: 'Failed to fetch product detail' });
  }
});

// 저장된 검색어 목록을 반환하는 엔드포인트
app.get('/searchKeywords/:userId', async (req, res) => {
  const userId = req.params.userId; // 사용자 ID는 URL 파라미터로부터 가져옵니다.

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT * FROM search_history WHERE user_id = ? ORDER BY search_date DESC', [userId]);
    connection.release();
    res.json(result);
  } catch (error) {
    console.error('저장된 검색어 목록을 불러오는 중 오류 발생:', error);
    res.sendStatus(500);
  }
});

// 검색어 삭제 엔드포인트
app.delete('/searchKeywords/delete/:id', async (req, res) => {
  const keywordId = req.params.id;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM search_history WHERE id = ?', [keywordId]);
    connection.release();
    console.log('검색어가 성공적으로 삭제되었습니다.');
    res.sendStatus(200);
  } catch (error) {
    console.error('검색어 삭제 오류:', error);
    res.sendStatus(500);
  }
});



// 조회수 저장 엔드포인트
app.post('/updateViews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Update views count
    await pool.execute('UPDATE products SET views = views + 1 WHERE id = ?', [productId]);

    res.json({ message: 'Views updated successfully' });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//조회수 기반 아이템 정렬 엔드포인트
app.get('/products/views', async (req, res) => {
  try {
    // 조회수로 정렬된 제품 목록을 가져옴
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY views DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products sorted by views:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 상품 판매완료 엔드포인트
app.put('/productsmanage/sold/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const connection = await pool.getConnection();
    // 상품 상태를 '판매완료'로 업데이트하는 쿼리 실행
    const [result] = await connection.query(
      'UPDATE products SET status = ? WHERE id = ?',
      ['판매완료', productId]
    );
    connection.release();

    if (result.affectedRows > 0) {
      // 업데이트가 성공하면 업데이트된 상품 정보 응답
      res.json({ message: '상품 판매완료 처리 완료' });
    } else {
      // 해당 상품이 없을 경우 404 에러 응답
      res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('상품 판매완료 처리 오류:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 상품 수정 엔드포인트
app.put('/productsmanage/:productId', async (req, res) => {
  const productId = req.params.productId;
  const userId = req.headers.user_id;
  const { name, description, price } = req.body;

  // 사용자 ID가 없는 경우
  if (!userId) {
    return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
  }

  try {
    // 상품과 사용자의 일치 여부 확인 쿼리
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId]);

    // 상품이 존재하지 않는 경우 또는 권한이 없는 경우
    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 상품을 찾을 수 없거나 수정할 권한이 없습니다.' });
    }

    // 상품 수정 쿼리
    await pool.query('UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?', [name, description, price, productId]);

    return res.status(200).json({ message: '상품이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('상품 수정 오류:', error);
    return res.status(500).json({ error: '상품 수정 중 오류가 발생했습니다.' });
  }
});

// 찜 상태 확인 엔드포인트
app.get('/products/checkFavorite/:productId', async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.query;

  try {
    // 사용자가 해당 상품을 찜했는지 확인
    const [favoriteRows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    const isFavorite = favoriteRows.length > 0;

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error('찜 상태 확인 오류:', error);
    res.status(500).json({ error: '서버 오류로 인해 찜 상태를 확인할 수 없습니다.' });
  }
});


// 찜 상태 토글 엔드포인트
app.put('/products/toggleFavorite/:productId', async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    // 상품 조회
    const [productRows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    const product = productRows[0];

    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }

    const productOwnerId = product.user_id;

    // 상품 작성자와 요청 사용자 비교
    if (productOwnerId === userId) {
      return res.status(403).json({ error: '본인의 게시물에는 찜을 할 수 없습니다.', isOwner: true });
    }

    // 사용자가 이미 찜한 상태인지 확인
    const [existingFavoriteRows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    let isFavorite = false;

    if (existingFavoriteRows.length > 0) {
      // 이미 찜한 경우 찜 취소
      await pool.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
      isFavorite = false; // 찜 취소 후 상태 변경
    } else {
      // 찜 추가
      await pool.execute('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
      isFavorite = true; // 찜 추가 후 상태 변경
    }

    // 상품의 찜 개수 업데이트
    const [favoritesCountRows] = await pool.execute('SELECT COUNT(*) AS count FROM favorites WHERE product_id = ?', [productId]);
    const favoritesCount = favoritesCountRows[0].count;

    await pool.execute('UPDATE products SET favorites_count = ? WHERE id = ?', [favoritesCount, productId]);

    // 성공 응답 반환
    res.status(200).json({ success: true, isFavorite, isOwner: false, favoritesCount });
  } catch (error) {
    console.error('찜 상태 토글 오류:', error);
    res.status(500).json({ error: '서버 오류로 인해 찜 상태를 변경할 수 없습니다.' });
  }
});

app.post('/favorites/deleteSelectedItems', async (req, res) => {
  const { selectedItems } = req.body;

  try {
    const connection = await pool.getConnection();

    await Promise.all(selectedItems.map(async (productId) => {
      await connection.execute('DELETE FROM favorites WHERE id = ?', [productId]);
    }));

    connection.release();

    res.status(200).json({ success: true, message: '선택된 상품들이 삭제되었습니다.' });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    res.status(500).json({ error: '상품 삭제 중 오류가 발생했습니다.' });
  }
});


  


// 즐겨찾기 목록 조회 API 엔드포인트
app.get('/favorites', async (req, res) => {
  try {
    // favorites 테이블과 products 테이블을 조인하여 즐겨찾기 목록과 해당 제품 정보를 가져옴
    const [rows] = await pool.query(`
        SELECT f.id, f.user_id, f.product_id, f.created_at,
               p.name AS product_name, p.description, p.price, p.createdAt AS product_created_at,
               p.image
        FROM favorites f
        JOIN products p ON f.product_id = p.id
      `);

    // 쿼리 결과를 클라이언트에 반환
    res.json(rows);
  } catch (error) {
    console.error('Error querying favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// 사용자의 rates 업데이트 함수
async function updateRates(userId) {
  try {
    // 해당 사용자가 등록한 상품들의 평균 평점을 계산
    const query = `SELECT AVG(rating) AS averageRating FROM product_ratings WHERE user_id = ?`;
    const [rows] = await pool.query(query, [userId]);
    const averageRating = rows[0].averageRating || 0; // 만약 등록된 상품이 없다면 기본값으로 0을 사용

    // 계산된 평균 평점을 사용자의 rates 열에 업데이트
    const updateQuery = `UPDATE users SET rates = ? WHERE id = ?`;
    await pool.query(updateQuery, [averageRating, userId]);

    console.log(`Updated rates for user ${userId} to ${averageRating}`);
  } catch (error) {
    console.error(`Error updating rates for user ${userId}:`, error);
  }
}

// ratings 엔드포인트 처리
app.post('/ratings', async (req, res) => {
  try {
    // 클라이언트에서 전송한 데이터 가져오기
    const { sellerId, productId, rating } = req.body;

    // 판매자 평점을 데이터베이스에 저장
    const query = `INSERT INTO product_ratings (user_id, product_id, rating) VALUES (?, ?, ?)`;
    await pool.query(query, [sellerId, productId, rating]);

    console.log('Seller rating inserted successfully.');

    // 해당 사용자의 rates 업데이트
    await updateRates(sellerId);

    res.status(200).json({ success: true, message: 'Seller rating inserted successfully.' });
  } catch (error) {
    // 오류 처리
    console.error('Error handling seller rating:', error);
    res.status(500).json({ success: false, message: 'Failed to handle seller rating.' });
  }
});



// 사용자가 즐겨찾기한 상품을 가져오는 함수
async function getFavoriteProducts(userId, pool) {
  try {
    const favoriteProductsQuery = `
            SELECT p.*
            FROM products p
            JOIN favorites f ON p.id = f.product_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            LIMIT 10
        `;

    const [favoriteProductsRows] = await pool.execute(favoriteProductsQuery, [userId]);
    return favoriteProductsRows;
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    throw new Error('즐겨찾기한 상품을 가져오는 중에 오류가 발생했습니다.');
  }
}

async function getPurchasedProducts(userId, pool) {
  try {
    const purchasedProductsQuery = `
            SELECT p.*
            FROM products p
            JOIN payments pm ON p.id = pm.product_id
            WHERE pm.user_id = ?
            ORDER BY pm.createdAt DESC
            LIMIT 10
        `;

    const [purchasedProductsRows] = await pool.execute(purchasedProductsQuery, [userId]);
    return purchasedProductsRows;
  } catch (error) {
    console.error('Error fetching purchased products:', error);
    throw new Error('구매한 상품을 가져오는 중에 오류가 발생했습니다.');
  }
}



async function getRecommendedProducts(userId, pool) {
  try {
    // 최근에 로그인된 사용자가 검색한 검색어를 가져오는 쿼리
    const recentSearchQuery = `
            SELECT search_term
            FROM search_history
            WHERE user_id = ?
            ORDER BY search_date DESC
            LIMIT 1
        `;

    // 최근 검색된 검색어 가져오기
    const [searchRows] = await pool.execute(recentSearchQuery, [userId]);

    let recentSearchTerm = ''; // 최근 검색어를 초기화합니다.

    if (searchRows.length > 0) {
      recentSearchTerm = searchRows[0].search_term; // 최근 검색어를 설정합니다.
    }

    // 최근에 등록된 상품을 가져오는 쿼리
    const recentProductsQuery = `
            SELECT *
            FROM products
            ORDER BY createdAt DESC
            LIMIT 10
        `;

    // 최근 등록된 상품 가져오기
    const [recentProductsRows] = await pool.execute(recentProductsQuery);

    // 사용자가 즐겨찾기한 상품 가져오기
    const favoriteProducts = await getFavoriteProducts(userId, pool);

    // 사용자가 구매한 상품 가져오기
    const purchasedProducts = await getPurchasedProducts(userId, pool);

    // 검색어를 포함하는 상품을 검색하는 쿼리
    const productsQuery = `
            SELECT p.*, 
            CASE WHEN sh.search_term IS NOT NULL THEN 1 ELSE 0 END AS recent_search_weight,
            p.views AS view_count,
            ((CASE WHEN sh.search_term IS NOT NULL THEN 1 ELSE 0 END * 0.5) + (p.views * 0.1) + (rp.recent_product_weight * 0.2)) AS relevance
            FROM products p
            LEFT JOIN (
            SELECT search_term
            FROM search_history
            WHERE user_id = ?
            ORDER BY search_date DESC
            LIMIT 1
            ) sh ON p.name LIKE CONCAT('%', sh.search_term, '%')
            LEFT JOIN (
            SELECT id, 1 AS recent_product_weight
            FROM products
            ORDER BY createdAt DESC
            LIMIT 10
            ) rp ON p.id = rp.id
            ORDER BY relevance DESC;
        `;

    // 검색어를 적용하여 상품 검색
    const [productRows] = await pool.execute(productsQuery, [userId, userId]);

    // 로그로 추천 상품 결과 출력
    console.log('Recommended Products:');
    productRows.forEach(product => {
      console.log(`Product ID: ${product.id}, Relevance: ${product.relevance}`);
    });

    return productRows;
  } catch (error) {
    console.error('Error searching products for recommendations:', error);
    throw new Error('상품을 추천하는 중에 오류가 발생했습니다.');
  }
}

// 사용 예시:
app.get('/products/recommendations', async (req, res) => {
  const userId = req.headers.user_id; // 로그인된 사용자의 ID를 헤더에서 가져옵니다.
  try {
    const recommendedProducts = await getRecommendedProducts(userId, pool);
    res.json(recommendedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 등록 엔드포인트
app.post('/signup', uploadId.single('studentIdImage'), async (req, res) => {
  const { id, password, email, department, grade, name } = req.body;

  // 비밀번호 확인
  if (password !== req.body.confirmPassword) {
    return res.status(400).json({ error: '비밀번호와 비밀번호 재입력이 일치하지 않습니다.' });
  }

  // 비밀번호 유효성 검사
  const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
  if (!isValidPassword) {
    return res.status(400).json({ error: '비밀번호는 영문, 숫자, 특수문자를 조합하여 10~16자로 입력해주세요.' });
  }

  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 이미지 URL 처리
    const studentIdImageUrl = req.file ? req.file.filename : null;

    // 사용자 추가 쿼리 실행
    const addUserQuery = `
        INSERT INTO users (id, password, email, department, grade, name, student_id_image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    // 사용자 등록
    await pool.execute(addUserQuery, [id, hashedPassword, email, department, grade, name, studentIdImageUrl]);

    // 사용자 등록 성공 응답
    res.status(201).json({ message: '사용자 등록 성공' });
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
  }
});

// 사용자 로그인 엔드포인트
app.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    // 사용자 조회
    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const user = userRows[0];

    if (!user) {
      // 사용자가 존재하지 않는 경우
      return res.status(401).json({ error: '사용자가 존재하지 않습니다.' });
    }

    if (user.admin === 'pending') {
      // 승인 대기 중인 사용자인 경우
      return res.status(403).json({ error: '승인 대기 중입니다. 관리자의 승인을 기다려주세요.' });
    }

    // 비밀번호 비교
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // 비밀번호 불일치
      return res.status(401).json({ error: '비밀번호가 잘못되었습니다.' });
    }

    if (user.admin === 'rejected') {
      // 반려된 사용자인 경우
      const rejectionReason = user.rejection_reason || '관리자에게 문의하세요.';
      return res.status(403).json({ error: '승인이 거절되었습니다.', rejectionReason });
    }

    // 로그인 성공
    const isAdmin = user.admin === 'admin';
    const message = isAdmin ? '관리자로 로그인 되었습니다.' : '로그인 성공';
    res.status(200).json({ message, id: user.id, isAdmin });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '로그인에 실패했습니다.' });
  }
});


// 아이디 찾기 엔드포인트
app.post('/find-id', async (req, res) => {
  try {
    const { email, department, grade } = req.body;

    // MySQL 쿼리 실행
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND department = ? AND grade = ?',
      [email, department, grade]
    );
    connection.release();

    // 결과가 있는 경우
    if (rows.length > 0) {
      res.status(200).json({ id: rows[0].id });
    } else {
      res.status(404).json({ error: '아이디를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});




// 사용자의 승인 상태를 업데이트하는 API 엔드포인트
app.put('/users/:userId/approval', async (req, res) => {
  const { userId } = req.params;
  const { approvalStatus, rejectionReason } = req.body;

  try {
    // 사용자의 승인 상태 업데이트
    await pool.query('UPDATE users SET admin = ?, rejection_reason = ? WHERE id = ?', [approvalStatus, rejectionReason, userId]);
    res.status(200).json({ message: '사용자 승인 상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 상태 업데이트 오류:', error);
    res.status(500).json({ error: '사용자 승인 상태를 업데이트하는 중에 오류가 발생했습니다.' });
  }
});


// 승인 완료된 사용자 정보 가져오는 엔드포인트
app.get('/users/approved', async (req, res) => {
  try {
    // 승인 완료된 사용자 정보를 가져오는 쿼리 실행
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin = 'approved'`;
    const [rows] = await pool.query(query);

    res.status(200).json(rows);
  } catch (error) {
    console.error('승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});


// 중복 확인 엔드포인트
app.get('/checkUser', async (req, res) => {
  const userId = req.query.id; // 클라이언트로부터 요청된 아이디를 가져옵니다.

  try {
    // 사용자 조회 쿼리 실행
    const findUserQuery = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await pool.execute(findUserQuery, [userId]); // 사용자 ID를 쿼리 매개변수로 전달합니다.

    if (rows.length > 0) {
      // 사용자가 이미 존재할 경우
      res.status(200).json({ available: false });
    } else {
      // 사용자가 존재하지 않을 경우
      res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
  }
});
//내정보 엔드포인트
app.post('/myinfo', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 사용자 정보 응답
        res.status(200).json({
          id: user.id,
          name: user.name,
          grade: user.grade,
          department: user.department,
          email: user.email
        });
      } else {
        // 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('내 정보 확인 오류:', error);
    res.status(500).json({ error: '내 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 회원 탈퇴 엔드포인트
app.post('/deleteaccount', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 사용자 삭제
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
      } else {
        // 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 수정 엔드포인트
app.post('/edituserinfo', async (req, res) => {
  const { userId, editedUserInfo } = req.body;

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 사용자 정보 업데이트
      const user = rows[0];
      const updatedUserInfo = { ...user, ...editedUserInfo };

      // 사용자 정보 업데이트 쿼리 실행
      await pool.execute(
        'UPDATE users SET name = ?, grade = ?, department = ?, email = ? WHERE id = ?',
        [updatedUserInfo.name, updatedUserInfo.grade, updatedUserInfo.department, updatedUserInfo.email, userId]
      );

      res.status(200).json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    res.status(500).json({ error: '사용자 정보를 수정하는 중 오류가 발생했습니다.' });
  }
});
// 비밀번호 변경 엔드포인트
app.post('/changepassword', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    // 사용자 조회 쿼리 실행
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length > 0) {
      // 사용자가 존재할 경우 현재 비밀번호 확인
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (passwordMatch) {
        // 비밀번호가 일치할 경우 새로운 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 새로운 비밀번호로 사용자 정보 업데이트
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
      } else {
        // 현재 비밀번호가 일치하지 않을 경우 에러 응답
        res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
      }
    } else {
      // 사용자가 존재하지 않을 경우 에러 응답
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ error: '비밀번호를 변경하는 중 오류가 발생했습니다.' });
  }
});


app.get('/users', async (req, res) => {
  try {
    // 모든 승인되지 않은 사용자 정보를 가져오는 쿼리 실행
    const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin != 'admin' AND admin != 'approved'`;
    const [rows] = await pool.query(query);

    // 반환된 사용자 목록이 비어있는지 확인
    if (rows.length === 0) {
      // 비어있는 경우 204 No Content 상태 코드 반환
      res.status(204).send();
    } else {
      // 사용자 정보가 있는 경우 200 OK 상태 코드와 함께 데이터 반환
      res.status(200).json(rows);
    }
  } catch (error) {
    // 오류 발생 시 500 Internal Server Error 상태 코드 반환
    console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});


// DELETE 엔드포인트 - /deletefromadmin/:userId
app.delete('/deletefromadmin/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const connection = await pool.getConnection();
    const [results, fields] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();

    if (results.affectedRows > 0) {
      res.status(200).json({ message: '사용자 삭제 성공' });
    } else {
      res.status(404).json({ error: '해당 사용자를 찾을 수 없음' });
    }
  } catch (error) {
    console.error('사용자 삭제 중 오류 발생:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 세션에 저장된 사용자 ID를 기반으로 사용자 정보를 반환하는 엔드포인트
app.get('/getUserInfo', async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    // 사용자 ID가 없으면 권한 없음(401) 응답 보내기
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    // 데이터베이스에서 해당 사용자 정보 가져오기
    const query = `SELECT id, name, department, grade, rates FROM users WHERE id = ?`;
    const [rows] = await pool.query(query, [userId]);

    // 사용자 정보가 없으면 사용자를 찾을 수 없음(404) 응답 보내기
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    // 사용자 정보 반환
    let userInfo = rows[0];
    // 학과명을 매핑하기 위한 객체
    const departmentMap = {
      'software_engineering': '소프트웨어학과',
      'computer_science': '컴퓨터공학과',
      'design': '디자인학과',
      'business-administration': '경영학과'
      // 필요에 따라 추가적인 부서를 매핑할 수 있습니다.
    };

    // 매핑된 학과명으로 변경
    userInfo.department = departmentMap[userInfo.department];

    // 사용자의 결제 내역을 가져와서 총 판매액을 계산
    const [sales] = await pool.execute('SELECT IFNULL(SUM(p.amount), 0) AS total_sales FROM products pr JOIN payments p ON pr.id = p.product_id WHERE pr.user_id = ?', [userId]);
    const totalSales = sales[0].total_sales;

    // 사용자 정보에 총 판매액 정보를 추가하여 클라이언트에 응답
    const userInfoWithSales = {
      ...userInfo,
      total_sales: totalSales
    };
    res.json(userInfoWithSales);
  } catch (error) {
    console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
});

// products/latest 엔드포인트를 만듭니다.
app.get('/products/latest', async (req, res) => {
  try {
      // 최신순으로 상품을 조회하는 쿼리를 실행합니다.
      const latestProductsQuery = `
      SELECT *
      FROM products
      ORDER BY createdAt desc
    `;
      // 쿼리를 실행하여 최신순으로 정렬된 상품 목록을 가져옵니다.
      const [latestProductsRows] = await pool.execute(latestProductsQuery);

      // 최신순으로 정렬된 상품 목록을 클라이언트에 응답합니다.
      res.json(latestProductsRows);
  } catch (error) {
      console.error('Error fetching latest products:', error);
      // 오류가 발생한 경우 500 상태 코드와 오류 메시지를 클라이언트에 응답합니다.
      res.status(500).json({ error: 'Failed to fetch latest products' });
  }
});

app.get('/products/seller/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // 데이터베이스 연결 풀에서 연결을 가져옵니다.
    const connection = await pool.getConnection();

    // 상품의 판매자 정보를 가져오기 위한 쿼리 작성
    const [productRows] = await connection.execute('SELECT p.user_id, u.name, u.rates FROM products p INNER JOIN users u ON p.user_id = u.id WHERE p.id = ?', [productId]);

    // 연결 반환
    connection.release();

    // 결과 확인
    if (productRows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }

    const sellerInfo = {
      sellerId: productRows[0].user_id,
      sellerName: productRows[0].name,
      rates: productRows[0].rates
    };

    res.status(200).json(sellerInfo);
  } catch (error) {
    console.error('상품 정보 조회 오류:', error);
    res.status(500).json({ error: '서버 오류: 상품 정보를 가져올 수 없습니다.' });
  }
});

// 서버 시작
function startServer() {
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}
startServer();