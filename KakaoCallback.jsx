import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function NaverCallback() {
  const [accessToken, setAccessToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [tokenType, setTokenType] = useState('');
  const [state, setState] = useState('');
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.hash.substring(1));
    setAccessToken(searchParams.get('access_token') || '');
    setExpiresIn(parseInt(searchParams.get('expires_in')) || 0);
    setTokenType(searchParams.get('token_type') || '');
    setState(searchParams.get('state') || '');
  }, [location]);

  return (
    <div>
      <h1>Naver Callback</h1>
      <p>Access Token: {accessToken}</p>
      <p>Expires In: {expiresIn}</p>
      <p>Token Type: {tokenType}</p>
      <p>State: {state}</p>
    </div>
  );
}

export default NaverCallback;
