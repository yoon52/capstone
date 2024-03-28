import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Picker, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function FindId() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  const [id, setId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // 모달 표시 여부 상태

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://172.30.1.76:4000/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setId(data.id);
        setErrorMessage('');
        setModalVisible(true); // 아이디를 찾으면 모달을 엽니다.
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        setId('');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setId('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>아이디 찾기</Text>
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
      <TouchableOpacity style={styles.findButton} onPress={handleSubmit}>
        <Text style={styles.findText}>아이디 찾기</Text>
      </TouchableOpacity>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      {/* 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>찾은 아이디: {id}</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => {
              navigation.navigate('Login'); // Login.js로 이동
              setModalVisible(!modalVisible);
            }}>
              <Text style={styles.buttonText}>로그인하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.passwordButton} onPress={() => {
              navigation.navigate('FindPw'); // FindPw.js로 이동
              setModalVisible(!modalVisible);
            }}>
              <Text style={styles.buttonText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  findButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'lightblue',
    borderRadius: 5
  },
  findText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  idText: {
    marginTop: 10,
    fontWeight: 'bold'
  },
  errorMessage: {
    marginTop: 10,
    color: 'red'
  },
  // 모달 스타일
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center'
  },
  passwordButton: {
    backgroundColor: 'gray',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18
  },
  modalButton: {
    marginTop: 20
  },
  modalButtonText: {
    color: 'blue',
    fontWeight: 'bold'
  }
});

export default FindId;
