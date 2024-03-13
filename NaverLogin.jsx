// NaverLogin.jsx

import React, { useEffect } from 'react';

function NaverLogin() {
  useEffect(() => {
    let naverIdLogin = new window.naver.LoginWithNaverId({
      clientId: 'r59ZbtMFYtVGcCmLsGj5',
      callbackUrl: 'http://SEUNGH00N.github.io/Main', // 수정된 콜백 URL
      isPopup: true,
      loginButton: { color: 'green', type: 2, height: 40 }
    });

    naverIdLogin.init();
  }, []);

  return (
    <div id="naverIdLogin"></div>
  );
}

export default NaverLogin;
