import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';
import naver from '../../image/naver.png';
import kakao from '../../image/kakao.png';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';

// Login 컴포넌트 정의
function Login() {
  // formData 상태 관리(state) 초기화
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  // 로그인 상태 관리
  const [loginSuccess, setLoginSuccess] = useState(true);
  // 승인 대기 상태 관리
  const [, setPendingUser] = useState(false);

  // 페이지 이동 기능을 위한 navigate 함수 사용
  const navigate = useNavigate();

  // 입력 필드 값이 변경될 때마다 formData 객체 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 로그인 폼 제출 시 수행되는 비동기 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 백엔드 서버로 로그인 요청 전송
      const response = await fetch(`${serverHost}:4000/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userId', data.id);

        // 여기서 관리자 여부 확인
        if (data.isAdmin) {
          navigate('/AdminPage'); // 관리자 페이지로 이동
        } else {
          navigate('/Main/*'); // 일반 사용자 페이지로 이동
        }
      } else {
        console.error('로그인 실패:', response.status);
        setLoginSuccess(false);
        // 반려된 사용자일 경우
        if (response.status === 403) {
          // 승인 대기 중인 사용자인 경우
          const responseData = await response.json();
          if (responseData.error === '승인 대기 중입니다. 관리자의 승인을 기다려주세요.') {
            setPendingUser(true);
            alert('승인 대기 중입니다. 관리자의 승인을 기다려주세요.');
          } else {
            // 반려된 사용자일 경우
            const rejectionReason = responseData.rejectionReason || '관리자에게 문의하세요.';
            alert(`승인이 거절되었습니다. 사유: ${rejectionReason}`);
          }
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginSuccess(false);
    }
  };

  // 네이버 로그인 버튼 클릭 시 수행되는 함수
  const handleNaverLogin = () => {
    const state = generateRandomState();

    // 세션 스토리지에 state 값 저장
    sessionStorage.setItem('oauthState', state);

    // 네이버 OAuth 인증 요청 URL 생성
    const naverOAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=r59ZbtMFYtVGcCmLsGj5&redirect_uri=${serverHost}:4000/oauth/naver/callback&state=${state}`;

    // OAuth 인증 요청
    window.location.href = naverOAuthUrl;
  };

  // 랜덤 state 값 생성 함수
  const generateRandomState = () => {
    return Math.random().toString(36).substring(7);
  };


  const handleKakaoLogin = () => {
    const clientId = '0bee6abe1a644025c9faedffda0ddd04';
    const redirectUri = `${serverHost}:4000/oauth/kakao/callback`;
    const responseType = 'code';

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}`;

    // 리다이렉트하여 카카오 OAuth 인증 요청을 시작
    window.location.href = kakaoAuthUrl;
  };


  // 회원가입 버튼 클릭 시 호출되는 함수
  const handleSignup = () => {
    navigate('/Signup');
  };

  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  const handleFindId = () => {
    navigate('/FindId');
  };

  // 비밀번호 찾기 버튼 클릭 시 호출되는 함수
  const handleFindPassword = () => {
    navigate('/FindPw');
  };

  // 로그인 폼을 렌더링하는 JSX
  return (
    <div className="container-login">
      <img src={logo} id='login-logo' alt="로고" />
      <div className="login-container">
        <h1 className="login-header">L O G I N</h1>
        <form onSubmit={handleSubmit}>
          {/* 사용자 ID 입력 필드 */}
          <div className="form-group">
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="학번"
              required />
          </div>
          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              required />
          </div>
          {/* 로그인 실패 메시지 */}
          {!loginSuccess && (
            <p className="login-failure-message">아이디 또는 비밀번호가 올바르지 않습니다.</p>
          )}
          {/* 로그인 버튼 */}
          <button type="submit" className="login-button">로그인</button>
          {/* 회원가입/아이디/비밀번호 찾기 버튼 */}
          <div className="all-group">
            <button type="button" className="signup" onClick={handleSignup}>회원가입</button>
            <button type="button" className="find-id" onClick={handleFindId}>아이디 찾기</button>
            <button type="button" className="find-pw" onClick={handleFindPassword}>비밀번호 찾기</button>
          </div>
          {/* Rest 로그인 버튼 */}
          <div className="rest-group">
            <button type="button" src={naver} alt="naver" className="naver-login" onClick={handleNaverLogin}></button>
            <button type="button" src={kakao} alt="kakao" className="kakao-login" onClick={handleKakaoLogin}></button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;