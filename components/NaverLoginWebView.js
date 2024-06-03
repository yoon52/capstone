import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';

function NaverLoginWebView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const state = Math.random().toString(36).substring(7);
  const navigation = useNavigation();

  // 세션 스토리지에 state 값 저장
  AsyncStorage.setItem('oauthState', state);

  const naverOAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=r59ZbtMFYtVGcCmLsGj5&redirect_uri=${serverHost}:4000/oauth/naver/callback/mob/&state=${state}`;

  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes(`http://192.168.219.241:8081/Main`)) {
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