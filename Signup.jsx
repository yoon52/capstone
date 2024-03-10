import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import SignupForm from './SignupForm.jsx';

function Signup() {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    setErrorMessage('');
    navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
  };

  const handleSignupError = (error) => {
    setSignupSuccess(false);
    setErrorMessage(error);
  };

  return (
    <div className="signup-container">
      {signupSuccess && <p className="success-message">회원가입 성공</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <SignupForm
        onSignupSuccess={handleSignupSuccess}
        onSignupError={handleSignupError}
      />
      <p>이미 계정이 있으신가요?&nbsp;&nbsp;<Link to="/Login">로그인</Link></p>
    </div>
  );
}

export default Signup;