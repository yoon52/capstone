import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

function KakaoLoginWebView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const clientId = '0bee6abe1a644025c9faedffda0ddd04';
  const redirectUri = `http://172.30.1.19:4000/oauth/kakao/callback/mob`;
  const responseType = 'code';
  const navigation = useNavigation();

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}`;

  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes('http://172.30.1.19:8081/Main')) {
      setIsLoggedIn(true);
    }
  };

  if (isLoggedIn) {
    navigation.navigate('Main');
    return null; // 이후의 WebView를 렌더링하지 않도록 null을 반환
  }

  return (
    <WebView
      source={{ uri: kakaoAuthUrl }}
      onNavigationStateChange={handleNavigationStateChange}
    />
  );
}

export default KakaoLoginWebView;
