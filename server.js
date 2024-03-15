const { app, pool, PORT } = require('./db');
const bcrypt = require('bcrypt');

// 사용자 등록 엔드포인트
app.post('/Signup', async (req, res) => {
    const { id, password, email, department, grade, name } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 추가 쿼리 실행
    const addUserQuery = `INSERT INTO users (id, password, email, department, grade, name) VALUES (?, ?, ?, ?, ?, ?)`;
    try {
        await pool.execute(addUserQuery, [id, hashedPassword, email, department, grade, name]);
        // 사용자 등록 성공 응답
        res.status(201).json({ message: '사용자 등록 성공' });
    } catch (error) {
        console.error('사용자 등록 오류:', error);
        res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
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

// 사용자 로그인 엔드포인트
app.post('/login', async (req, res) => {
    const { id, password } = req.body; // 클라이언트로부터 요청 본문에서 사용자 ID를 가져옵니다.

    try {
        // 사용자 조회 쿼리 실행
        const findUserQuery = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await pool.execute(findUserQuery, [id]); // 사용자 ID를 쿼리 매개변수로 전달합니다.

        if (rows.length > 0) {
            // 사용자가 존재할 경우 비밀번호 확인
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.status(200).json({ message: '로그인 성공', id: user.id });
                console.log(`사용자 ${user.id}가 로그인하였습니다.`);
            } else {
                // 비밀번호가 일치하지 않으면 로그인 실패 응답
                res.status(401).json({ error: '비밀번호가 잘못되었습니다.' });
            }
        } else {
            // 사용자가 존재하지 않으면 로그인 실패 응답
            res.status(401).json({ error: '사용자가 존재하지 않습니다.' });
        }
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

// 상품 검색 및 검색어 저장 엔드포인트
app.get('/products', async (req, res) => {
    const searchTerm = req.query.search;
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    try {
        if (!searchTerm) {
            // 검색어가 없는 경우 모든 상품을 반환
            const [rows] = await pool.execute('SELECT * FROM products');
            res.json(rows);
        } else {
            // 검색어가 있는 경우 해당 검색어를 포함하는 상품을 반환
            const [rows] = await pool.execute('SELECT * FROM products WHERE name LIKE ?', [`%${searchTerm}%`]);

            // 검색어 저장
            if (userId) {
                await saveSearchTerm(searchTerm, userId);
            }

            res.json(rows);
        }
    } catch (error) {
        console.error('Error fetching products from database:', error);
        res.status(500).json({ error: 'Failed to fetch products from database' });
    }
});

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

// 새 상품 추가 엔드포인트
app.post('/addProduct', async (req, res) => {
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.
    const { name, description, price } = req.body;

    // 요청 본문의 데이터가 올바르게 전달되는지 확인합니다.
    if (!name || !price || isNaN(price)) {
        return res.status(400).send('상품 이름과 가격을 올바르게 입력해주세요.');
    }

    const INSERT_PRODUCT_QUERY = `INSERT INTO products (user_id, name, description, price) VALUES (?, ?, ?, ?)`;
    try {
        const [result] = await pool.execute(INSERT_PRODUCT_QUERY, [userId, name, description, price]);
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


// 최근 검색된 검색어를 기반으로 상품 검색하는 엔드포인트
app.get('/products/searchByRecent', async (req, res) => {
    const userId = req.headers.user_id; // 로그인된 사용자의 ID를 헤더에서 가져옵니다.

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

        // 검색어를 포함하는 상품을 검색하는 쿼리
        const productsQuery = `
      SELECT *,
      CASE WHEN name LIKE CONCAT('%', ?, '%') THEN 1 ELSE 0 END AS relevance
      FROM products
      ORDER BY relevance DESC;
    `;

        // 검색어를 적용하여 상품 검색
        const [productRows] = await pool.execute(productsQuery, [recentSearchTerm]);

        res.json(productRows);
    } catch (error) {
        console.error('Error searching products by recent search term:', error);
        res.status(500).json({ error: '최근 검색어를 기반으로 상품을 검색하는 중에 오류가 발생했습니다.' });
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
            res.status(200).json({ message: `임시 비밀번호는 ${temporaryPassword} 입니다. 로그인 후에 비밀번호를 변경해주세요.` });
        } else {
            res.status(404).json({ error: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 비밀번호를 재설정할 수 없습니다.' });
    }
});

// 서버 시작
function startServer() {
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
}

startServer();