import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import naverLogo from '../image/naver.png';
import kakaoLogo from '../image/kakao.png';

function Login() {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  const [loginSuccess, setLoginSuccess] = useState(true);
  const navigation = useNavigation();

  const handleChange = (value, name) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.password) {
      console.log('Please enter both id and password');
      return;
    }

    try {
      const response = await fetch('http://192.168.45.46:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const { message, id, isAdmin } = await response.json();
        console.log(message); // 로그인 메시지 출력
        console.log('User ID:', id); // 사용자 ID 출력
        console.log('Is Admin:', isAdmin); // 관리자 여부 출력

        // 사용자 ID를 AsyncStorage에 저장
        await AsyncStorage.setItem('userId', id);

        // 로그인 성공 시 필요한 작업 수행
        navigation.navigate('Main');
      } else {
        console.error('Login failed:', response.status);
        setLoginSuccess(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginSuccess(false);
    }
  };


  const handleNaverLogin = () => {
    // Handle Naver login
  };

  const handleKakaoLogin = () => {
    // Handle Kakao login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>L O G I N</Text>
      <TextInput
        style={styles.input}
        placeholder="아이디"
        onChangeText={text => handleChange(text, 'id')}
        value={formData.id}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        onChangeText={text => handleChange(text, 'password')}
        value={formData.password}
        secureTextEntry
      />
      {!loginSuccess && (
        <Text style={styles.errorMessage}>아이디 또는 비밀번호가 올바르지 않습니다.</Text>
      )}
      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('FindId')}>
          <Text style={styles.buttonText}>아이디 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('FindPw')}>
          <Text style={styles.buttonText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.restButtonGroup}>
        <TouchableOpacity style={styles.restButton} onPress={handleNaverLogin}>
          <Image source={naverLogo} style={styles.restButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.restButton} onPress={handleKakaoLogin}>
          <Image source={kakaoLogo} style={styles.restButtonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  additionalButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  restButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  restButton: {
    width: '30%',
    alignItems: 'center',
  },
  restButtonIcon: {
    width: 50,
    height: 50,
  },
});

export default Login;