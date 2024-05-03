const { app, pool, PORT, upload, uploadId } = require('./db');

const fetch = require('node-fetch');
const qs = require('querystring');


async function handleNaverCallback(code, state) {
  const naverTokenParams = {
    grant_type: 'authorization_code',
    client_id: 'r59ZbtMFYtVGcCmLsGj5',
    client_secret: 'G2TwhvX4SF',
    code,
    state
  };

  try {
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(naverTokenParams)
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain access token from Naver');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to obtain user information from Naver');
    }

    const profileData = await profileResponse.json();
    const userId = profileData.response.id;

    return { userId, accessToken };
  } catch (error) {
    console.error('Naver OAuth Error:', error);
    throw new Error('Naver OAuth Error');
  }
}

module.exports = { handleNaverCallback };