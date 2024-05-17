import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

import UserEdit from './UserEdit'; // Assuming this component exists

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve userId from AsyncStorage
      const response = await fetch('http://172.30.1.80:4000/myinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password }) // Pass userId from AsyncStorage
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsPasswordConfirmed(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      alert('내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Main')}>

      </TouchableOpacity>
      <Text style={styles.header}>내 정보</Text>
      <View style={styles.myInfoContainer}>
        {!isPasswordConfirmed ? (
          <>
            <Text style={styles.inputPassword}>비밀번호를 입력해주세요</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
            />
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </>
        ) : (
          userInfo && <UserEdit userInfo={userInfo} />
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  logo: {
    width: 150,
    height: 150,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  myInfoContainer: {
    alignItems: 'center',
  },
  inputPassword: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#103260',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MyInfo;
