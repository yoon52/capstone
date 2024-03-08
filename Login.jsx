import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import naver from '../../image/naver.png';
import kakao from '../../image/kakao.png';
import '../../styles/main.css';

// Login 컴포넌트 정의
function Login() {
  // formData 상태 관리(state) 초기화
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  // 로그인 상태 관리
  const [loginSuccess, setLoginSuccess] = useState(true);

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
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // 요청 처리 성공 시, 사용자 ID 세션에 저장 및 메인 페이지로 이동
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userId', data.id);
        setLoginSuccess(true);
        navigate('/main');
      } else {
        // 요청 처리 실패 시, 로그인 성공 상태를 false로 설정
        console.error('로그인 실패:', response.status);
        setLoginSuccess(false);
      }
    } catch (error) {
      // 네트워크 오류 또는 기타 오류 발생 시 콘솔에 오류 로그 출력 및 상태 변경
      console.error('로그인 오류:', error);
      setLoginSuccess(false);
    }
  };

  // 네이버 로그인 버튼 클릭 시 수행되는 함수
  const handleNaverLogin = () => {
    window.location.href = 'http://localhost:3000/NaverLogin';
  };

  // 회원가입 버튼 클릭 시 호출되는 함수
  const handleSignup = () => {
    navigate('/signup');
  };

  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  const handleFindId = () => {
    console.log('아이디 찾기 로직을 구현하세요.');
  };

  // 비밀번호 찾기 버튼 클릭 시 호출되는 함수
  const handleFindPassword = () => {
    console.log('비밀번호 찾기 로직을 구현하세요.');
  };

  // 로그인 폼을 렌더링하는 JSX
  return (
    <div className="login-container">
      <h1>L O G I N</h1>
      <form onSubmit={handleSubmit}>

        {/* 사용자 ID 입력 필드 */}
        <div className="form-group">
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="아이디"
            required
          />
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            required
          />
        </div>

        {/* 로그인 실패 메시지 */}
        {!loginSuccess && (
          <p style={{ color: 'red', textAlign: 'center' }}>아이디 또는 비밀번호가 올바르지 않습니다.</p>
        )}

        {/* 로그인 버튼 */}
        <button type="submit" className="login-button">로그인</button>

        {/* 회원가입/아이디/비밀번호 찾기 버튼 */}
        <div className="all-group">
          <button type="button" className="signup-button" onClick={handleSignup}>회원가입</button>
          <button type="button" className="find-id" onClick={handleFindId}>아이디 찾기</button>
          <button type="button" className="find-pw" onClick={handleFindPassword}>비밀번호 찾기</button>
        </div>

        {/* Rest 로그인 버튼 */}
        <div className="rest-group">
          <button type="button" src={naver} alt="naver" className="naver-login" onClick={handleNaverLogin}></button>
          <button type="button" src={kakao} alt="kakao" className="kakao-login" onClick={handleNaverLogin}></button>
        </div>
        
      </form>
    </div>
  );
}

export default Login;
