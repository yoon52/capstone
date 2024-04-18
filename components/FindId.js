import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useNavigation } from '@react-navigation/native';

const FindId = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  const [id, setId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://172.20.10.3:4000/find-id', {
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
        setModalVisible(true);
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

  const openGradeModal = () => {
    setGradeModalVisible(true);
  };

  const closeGradeModal = () => {
    setGradeModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>아이디 찾기</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="이메일"
        keyboardType="email-address"
      />
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={formData.department}
          onValueChange={(value) => handleChange('department', value)}
        >
          <Picker.Item label="학과를 선택하세요" value="" />
          <Picker.Item label="컴퓨터 공학과" value="computer_science" />
          <Picker.Item label="소프트웨어 공학과" value="software_engineering" />
          <Picker.Item label="디자인학과" value="design" />
          <Picker.Item label="경영학과" value="business-administration" />

        </Picker>
      </View>
      <TouchableOpacity style={styles.input} onPress={openGradeModal}>
        <Text>{formData.grade ? `학년: ${formData.grade}` : '학년을 선택하세요'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>아이디 찾기</Text>
      </TouchableOpacity>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      {/* 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>찾은 아이디: {id}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            navigation.navigate('Login');
            setModalVisible(false);
          }}>
            <Text style={styles.modalButtonText}>로그인하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            navigation.navigate('FindPw');
            setModalVisible(false);
          }}>
            <Text style={styles.modalButtonText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={gradeModalVisible}
        onRequestClose={closeGradeModal}
      >
        <View style={styles.modalContainer}>
          <Picker
            selectedValue={formData.grade}
            onValueChange={(value) => handleChange('grade', value)}
            style={styles.picker}
            prompt="학년을 선택하세요"
          >
            <Picker.Item label="학년을 선택하세요" value="" />
            <Picker.Item label="1학년" value="1" />
            <Picker.Item label="2학년" value="2" />
            <Picker.Item label="3학년" value="3" />
            <Picker.Item label="4학년" value="4" />
          </Picker>
          <TouchableOpacity style={styles.modalButton} onPress={closeGradeModal}>
            <Text style={styles.modalButtonText}>닫기</Text>
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
    backgroundColor: '#ffffff',
    padding: 20
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333'
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#cccccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5
  },
  pickerContainer: {
    width: '100%',
    borderColor: '#cccccc',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5
  },
  picker: {
    height: 40,
    width: '100%'
  },
  button: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: 'lightblue',
    borderRadius: 5
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  errorMessage: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  modalButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'lightblue',
    borderRadius: 5
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default FindId;
