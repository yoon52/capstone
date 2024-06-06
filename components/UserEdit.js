import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import serverHost from './host';

function UserEdit({ userInfo }) {
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigation = useNavigation();

  const handleChange = (field, value) => {
    setEditedUserInfo({ ...editedUserInfo, [field]: value });
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/edituserinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, editedUserInfo })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // 수정이 완료되었습니다. 메시지 표시
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        console.error('사용자 정보 수정 실패');
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/deleteaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, editedUserInfo })
      });

      if (response.ok) {
        alert('회원 탈퇴되었습니다.');
        sessionStorage.removeItem('userId');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = () => {
    navigation.reset({ index: 0, routes: [{ name: 'ChangePw' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원 정보 수정</Text>
      <Text style={styles.userId}>학번: {userInfo.id}</Text>
      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          value={editedUserInfo.name}
          placeholder="이름"
          onChangeText={(value) => handleChange('name', value)}
        />
      </View>
      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          value={editedUserInfo.email}
          placeholder="이메일"
          onChangeText={(value) => handleChange('email', value)}
        />
      </View>
      <View style={styles.selectGroup}>
        <Picker
          selectedValue={editedUserInfo.department}
          onValueChange={(itemValue) => handleChange('department', itemValue)}
          style={[styles.picker, { color: editedUserInfo.department ? 'black' : 'gray' }]}
        >
          <Picker.Item label="학과를 선택하세요" value="" />
          <Picker.Item label="컴퓨터 공학과" value="computer_science" />
          <Picker.Item label="소프트웨어 공학과" value="software_engineering" />
          <Picker.Item label="디자인학과" value="design" />
          <Picker.Item label="경영학과" value="business-administration" />
        </Picker>

        <Picker
          selectedValue={editedUserInfo.grade}
          onValueChange={(itemValue) => handleChange('grade', itemValue)}
          style={[styles.picker, { color: editedUserInfo.grade ? 'black' : 'gray' }]}
        >
          <Picker.Item label="학년을 선택하세요" value="" />
          <Picker.Item label="1학년" value="1" />
          <Picker.Item label="2학년" value="2" />
          <Picker.Item label="3학년" value="3" />
          <Picker.Item label="4학년" value="4" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>저장</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.changePwButton} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>비밀번호 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawalButton} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>
            <Text style={styles.modalText}>회원 탈퇴와 함께 K'du-re 에 등록된 모든 개인정보는 삭제, 폐기 처리되며 복구되지 않습니다.</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmDeleteAccount}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalOpen(false)}>
              <Text style={styles.buttonText}>취소</Text>
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
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userId: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  formGroup: {
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    width: '100%',
  },
  selectGroup: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changePwButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    width: '48%',
  },
  withdrawalButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    color: '#555',
  },
  confirmButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default UserEdit;
