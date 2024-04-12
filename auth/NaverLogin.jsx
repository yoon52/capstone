// NaverLogin.jsx

import React from 'react';

function NaverLogin() {
  const handleNaverLogin = () => {
    window.location.href = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=r59ZbtMFYtVGcCmLsGj5&redirect_uri=https%3A%2F%2FSEUNGH00N.github.io%2FMain&state=?';
  };

  return (
    <button onClick={handleNaverLogin}>네이버 로그인</button>
  );
}

export default NaverLogin;