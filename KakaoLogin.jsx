import React, { useEffect } from 'react';

function KakaoLogin() {
  useEffect(() => {
    // Kakao SDK가 이미 초기화되었는지 확인
    if (!window.Kakao.isInitialized()) {
      // Kakao SDK 초기화
      window.Kakao.init('0bee6abe1a644025c9faedffda0ddd04');
    } else {
      // 이미 초기화된 경우, 로그를 출력
      console.log('Kakao SDK already initialized.');
    }
  }, []);

  useEffect(() => {
    // Kakao SDK가 이미 초기화된 경우에만 로그인 버튼 초기화
    if (window.Kakao.isInitialized()) {
      // Kakao 로그인 버튼 생성 및 초기화
      window.Kakao.Auth.createLoginButton({
        container: '#kakaoIdLogin',
        success: (authObj) => {
          // 로그인 성공 시 처리할 로직을 여기에 작성
          console.log('카카오 로그인 성공:', authObj);
        },
        fail: (err) => {
          // 로그인 실패 시 처리할 로직을 여기에 작성
          console.error('카카오 로그인 실패:', err);
        },
        redirectUri: 'https://SEUNGH00N.github.io/Main' // 리디렉션 URL 수정
      });
    }
  }, []);

  return (
    <div>
      {/* 카카오 로그인 버튼을 나타낼 영역 */}
      <div id="kakaoIdLogin"></div>
      {/* 로그인 버튼을 눌렀을 때 처리할 로직을 작성할 수도 있습니다. */}
      {/* <button onClick={handleKakaoLogin}>카카오 로그인</button> */}
    </div>
  );
}

export default KakaoLogin;
