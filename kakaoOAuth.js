const { app, pool, PORT, upload, uploadId } = require('./db');

const fetch = require('node-fetch');
const qs = require('querystring');

async function handleKakaoCallback(code) {
  const kakaoTokenParams = {
    grant_type: 'authorization_code',
    client_id: '0bee6abe1a644025c9faedffda0ddd04',
    redirect_uri: 'http://localhost:4000/oauth/kakao/callback',
    code
  };

  try {
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(kakaoTokenParams)
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain access token from Kakao');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const profileResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to obtain user information from Kakao');
    }

    const profileData = await profileResponse.json();
    const userId = profileData.id.toString();

    return { userId, accessToken };
  } catch (error) {
    console.error('Kakao OAuth Error:', error);
    throw new Error('Kakao OAuth Error');
  }
}

module.exports = { handleKakaoCallback };