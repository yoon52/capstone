import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Picker } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function Signup() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:4000/checkUser?id=${formData.id}`);
      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          setErrorMessage('이미 존재하는 아이디입니다.');
        } else {
          setErrorMessage('사용 가능한 아이디입니다.');
        }
      } else {
        setErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('http://172.30.1.76:4000/Signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회 원 가 입</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={text => handleChange('name', text)}
        placeholder="이름"
        required
      />
      <TextInput
        style={styles.input}
        value={formData.id}
        onChangeText={text => handleChange('id', text)}
        placeholder="아이디"
        required
      />
      <TouchableOpacity style={styles.checkButton} onPress={handleCheckAvailability}>
        <Text style={styles.checkText}>중복 확인</Text>
      </TouchableOpacity>
      <Text style={styles.message}>{errorMessage}</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={text => handleChange('password', text)}
        placeholder="비밀번호"
        secureTextEntry
        required
      />
      <TextInput
        style={styles.input}
        value={formData.confirmPassword}
        onChangeText={text => handleChange('confirmPassword', text)}
        placeholder="비밀번호 확인"
        secureTextEntry
        required
      />
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={text => handleChange('email', text)}
        placeholder="이메일"
        keyboardType="email-address"
        required
      />
      <Picker
        style={styles.input}
        selectedValue={formData.department}
        onValueChange={(itemValue, itemIndex) => handleChange('department', itemValue)}
        required
      >
        <Picker.Item label="학과를 선택하세요" value="" />
        <Picker.Item label="컴퓨터 공학과" value="computer_science" />
        <Picker.Item label="소프트웨어 공학과" value="software_engineering" />
        <Picker.Item label="디자인학과" value="design" />
        <Picker.Item label="경영학과" value="business-administration" />
      </Picker>
      <Picker
        style={styles.input}
        selectedValue={formData.grade}
        onValueChange={(itemValue, itemIndex) => handleChange('grade', itemValue)}
        required
      >
        <Picker.Item label="학년을 선택하세요" value="" />
        <Picker.Item label="1학년" value="1" />
        <Picker.Item label="2학년" value="2" />
        <Picker.Item label="3학년" value="3" />
        <Picker.Item label="4학년" value="4" />
      </Picker>
      <TouchableOpacity style={styles.signupButton} onPress={handleSubmit}>
        <Text style={styles.signupText}>가입하기</Text>
      </TouchableOpacity>
      <Text>이미 계정이 있으신가요? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>로그인</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  header: {
    fontSize: 24,
    marginBottom: 20
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10
  },
  checkButton: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
    marginBottom: 10
  },
  checkText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  signupButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'lightblue',
    borderRadius: 5
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  message: {
    marginBottom: 10,
    color: 'red'
  },
  loginLink: {
    color: 'blue',
    textDecorationLine: 'underline'
  }
});

export default Signup;
