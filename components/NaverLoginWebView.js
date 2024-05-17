import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function NaverLoginWebView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const state = Math.random().toString(36).substring(7);
  const navigation = useNavigation();

  // 세션 스토리지에 state 값 저장
  AsyncStorage.setItem('oauthState', state);

  const naverOAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=r59ZbtMFYtVGcCmLsGj5&redirect_uri=http://172.30.1.19:4000/oauth/naver/callback/mob/&state=${state}`;

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
      source={{ uri: naverOAuthUrl }}
      onNavigationStateChange={handleNavigationStateChange}
    />
  );
}

export default NaverLoginWebView;
