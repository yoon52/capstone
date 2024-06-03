import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
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
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원 정보 수정</Text>
      <Text style={styles.userId}>ID: {userInfo.id}</Text>
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
        {/* Add your select inputs here */}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>저장</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.changePwButton} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>비밀번호 변경</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.withdrawalButton} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>회원 탈퇴</Text>
      </TouchableOpacity>
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userId: {
    fontSize: 16,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  selectGroup: {
    // Add styles for select inputs
  },
  saveButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  changePwButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  withdrawalButton: {
    backgroundColor: '#FF0000',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
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
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#103260',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default UserEdit;