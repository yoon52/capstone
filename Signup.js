import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

import * as ImagePicker from 'expo-image-picker'; // ImagePicker로 import 변경



function Signup() {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: '',
    studentIdImage: null
  });
  const [idAvailability, setIdAvailability] = useState(null);
  const [isDepartmentModalVisible, setIsDepartmentModalVisible] = useState(false);
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);


  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  // 함수를 사용하여 이미지 파일 이름을 생성합니다.
  const getImageFileName = (userId, file) => {
    // 파일 확장자를 가져옵니다.
    const extension = file.name.split('.').pop();
    // 파일 이름을 사용자 ID와 확장자를 결합하여 반환합니다.
    return `${userId}.${extension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FormData 객체 생성
    const imageFileName = getImageFileName(formData.id, formData.studentIdImage);

    // 이미지를 포함한 FormData 생성
    const formDataWithImage = new FormData();
    formDataWithImage.append('id', formData.id);
    formDataWithImage.append('name', formData.name);
    formDataWithImage.append('password', formData.password);
    formDataWithImage.append('confirmPassword', formData.confirmPassword);
    formDataWithImage.append('email', formData.email);
    formDataWithImage.append('department', formData.department);
    formDataWithImage.append('grade', formData.grade);
    formDataWithImage.append('studentIdImage', formData.studentIdImage, imageFileName); // 이미지 추가 및 파일 이름 설정
    console.log('회원가입 요청 정보:', formData); // 추가된 로그
    try {
        const response = await fetch('http://192.168.45.46:4000/signup', {
          method: 'POST',
          body: formDataWithImage // FormData 전송
        });
  
      if (response.ok) {
        const data = await response.json();
        // 서버로부터 성공 메시지를 받으면 상태를 업데이트합니다.
        setSignupSuccess(true);
      } else {
        const errorData = await response.json();
        // 서버로부터 에러 메시지를 받으면 에러 메시지를 표시합니다.
        setErrorMessage(errorData.error);
      }
    } catch (error) {
      console.error('클라이언트 오류:', error);
      // 네트워크 오류 등 클라이언트 측 오류가 발생하면 에러 메시지를 표시합니다.
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`http://192.168.45.46:4000/checkUser?id=${formData.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setIdAvailability(data.available);
        setErrorMessage(data.available ? '사용 가능한 아이디입니다!' : '이미 존재하는 아이디입니다!');
      } else {
        setErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('클라이언트 오류:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
    }
  };
  

  const handleImageSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); // 갤러리 접근 권한 요청
    if (permissionResult.granted === false) {
      alert('갤러리에 접근할 수 있는 권한이 필요합니다.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync(); // 갤러리에서 이미지 선택
    if (!pickerResult.cancelled) {
      setFormData(prevState => ({
        ...prevState,
        studentIdImage: pickerResult.uri, // 선택된 이미지의 URI를 저장
      }));
    }
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prevState => ({
      ...prevState,
      department: department
    }));
    setIsDepartmentModalVisible(false);
  };

  const handleGradeSelect = (grade) => {
    setFormData(prevState => ({
      ...prevState,
      grade: grade
    }));
    setIsGradeModalVisible(false);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      {signupSuccess && <Text style={styles.successMessage}>회원가입 성공</Text>}
      {errorMessage !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage('')} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        placeholder="이름"
        value={formData.name}
        onChangeText={text => handleChange('name', text)}
        style={styles.input}
      />
      <View style={styles.inputContainer}>
  <TextInput
    placeholder="학번"
    value={formData.id}
    onChangeText={text => handleChange('id', text)}
    style={[styles.input, { flex: 1 }]}
  />
  <TouchableOpacity onPress={handleCheckAvailability} style={styles.checkButton}>
    <Text style={styles.checkButtonText}>중복 확인</Text>
  </TouchableOpacity>
</View>
      <TextInput
        placeholder="비밀번호"
        value={formData.password}
        onChangeText={text => handleChange('password', text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호 확인"
        value={formData.confirmPassword}
        onChangeText={text => handleChange('confirmPassword', text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        value={formData.email}
        onChangeText={text => handleChange('email', text)}
        keyboardType="email-address"
        style={styles.input}
      />
      <TouchableOpacity onPress={() => setIsDepartmentModalVisible(true)}>
        <Text style={styles.input}>{formData.department || '학과를 선택하세요'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsGradeModalVisible(true)}>
        <Text style={styles.input}>{formData.grade || '학년을 선택하세요'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleImageSelect}>
        <Text style={styles.imageButton}>이미지 선택</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSubmit}>
        <Text style={styles.signupButton}>가입하기</Text>
      </TouchableOpacity>
      <Text style={styles.loginText}>이미 계정이 있으신가요? 로그인</Text>

      {/* Department Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDepartmentModalVisible}
        onRequestClose={() => setIsDepartmentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => handleDepartmentSelect('컴퓨터 공학과')}>
              <Text style={styles.modalItem}>컴퓨터 공학과</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDepartmentSelect('소프트웨어 공학과')}>
              <Text style={styles.modalItem}>소프트웨어 공학과</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDepartmentSelect('디자인학과')}>
              <Text style={styles.modalItem}>디자인학과</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDepartmentSelect('경영학과')}>
              <Text style={styles.modalItem}>경영학과</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </Modal>

      {/* Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGradeModalVisible}
        onRequestClose={() => setIsGradeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => handleGradeSelect('1')}>
              <Text style={styles.modalItem}>1학년</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleGradeSelect('2')}>
              <Text style={styles.modalItem}>2학년</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleGradeSelect('3')}>
              <Text style={styles.modalItem}>3학년</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleGradeSelect('4')}>
              <Text style={styles.modalItem}>4학년</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleCheckAvailability} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>중복 확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  successMessage: {
    color: 'green',
    marginBottom: 10
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  errorMessage: {
    color: 'red',
    marginBottom: 5
  },
  errorButton: {
    backgroundColor: 'lightgray',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  errorButtonText: {
    color: 'black'
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '100%'
  },
  imageButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10
  },
  signupButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10
  },
  loginText: {
    marginTop: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  modalButtonText: {
    color: 'white'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  checkButtonText: {
    color: 'white',
  }
  
});

export default Signup;