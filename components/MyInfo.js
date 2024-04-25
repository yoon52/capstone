import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'; // Picker import 수정
const MyInfo = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({
    name: '',
    grade: '',
    department: '',
    email: '',
    password: '', // 새 비밀번호 추가
    confirmPassword: '' // 새 비밀번호 확인 추가
  });
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching userId from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleCheckInfo = async () => {
    try {
      if (!password) {
        setError('비밀번호를 입력하세요.');
        return;
      }

      const response = await fetch('http://172.30.1.54:4000/myinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setUserInfo(responseData);
        setEditedUserInfo(responseData);
        setError(null);
        setModalVisible(true);
      } else {
        setError(responseData.error || '서버 오류');
        setUserInfo(null);
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      setError('내 정보를 가져오는 중 오류가 발생했습니다.');
      setUserInfo(null);
    }
  };

  const handleEditUserInfo = async () => {
    try {
      const response = await fetch('http://172.30.1.54:4000/edituserinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          editedUserInfo: editedUserInfo,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setModalVisible(false);
        alert(responseData.message);
      } else {
        setError(responseData.error || '서버 오류');
      }
    } catch (error) {
      console.error('내 정보 수정 오류:', error);
      setError('내 정보를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const toggleChangePasswordModal = () => {
    setChangePasswordModalVisible(!changePasswordModalVisible);
  };

  // handleChangePassword 함수 내에서 비밀번호 변경이 성공했을 때 로그인 페이지로 이동
const handleChangePassword = async () => {
  try {
    if (editedUserInfo.password !== editedUserInfo.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const response = await fetch('http://172.30.1.54:4000/changepassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        currentPassword: password,
        newPassword: editedUserInfo.password,
        confirmPassword: editedUserInfo.confirmPassword
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      setChangePasswordModalVisible(false);
      alert(responseData.message);
      
      // 비밀번호 변경 성공 시 로그인 페이지로 이동
      navigation.navigate('Login'); // 로그인 페이지의 스크린 이름에 따라 수정
    } else {
      setError(responseData.error || '서버 오류');
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    setError('비밀번호를 변경하는 중 오류가 발생했습니다.');
  }
};

const handleWithdrawal = async () => {
  try {
    // 회원 탈퇴를 위한 요청 보내기
    const response = await fetch('http://172.30.1.54:4000/deleteaccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        password: password,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      // 회원 탈퇴 성공 시 알림 후 로그인 페이지로 이동
      alert(responseData.message);
      navigation.navigate('Login');
    } else {
      // 회원 탈퇴 실패 시 에러 메시지 표시
      setError(responseData.error || '서버 오류');
    }
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    setError('회원 탈퇴 중 오류가 발생했습니다.');
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="홈페이지"
          onPress={() => navigation.navigate('Main')}
        />
         <Button
          title="회원탈퇴"
          onPress={handleWithdrawal}
        />
      </View>
      <Text style={styles.headerText}>내 정보</Text>
      <Text style={styles.subHeaderText}>고객님의 개인정보 보호를 위해 본인확인을 진행합니다.</Text>
      <Text style={styles.subHeaderText}>비밀번호를 입력해주세요</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        onChangeText={text => setPassword(text)}
        value={password}
        secureTextEntry={true}
      />
      <Button title="내 정보 확인" onPress={handleCheckInfo} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>내 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름:</Text>
              <TextInput
                style={styles.infoText}
                value={editedUserInfo.name}
                onChangeText={text => setEditedUserInfo(prevState => ({ ...prevState, name: text }))}
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>등급:</Text>
              <Picker
                style={styles.infoText}
                selectedValue={editedUserInfo.grade}
                onValueChange={(itemValue, itemIndex) => setEditedUserInfo(prevState => ({ ...prevState, grade: itemValue }))}
              >
                <Picker.Item label="학년을 선택하세요" value="" />
                <Picker.Item label="1학년" value="1" />
                <Picker.Item label="2학년" value="2" />
                <Picker.Item label="3학년" value="3" />
                <Picker.Item label="4학년" value="4" />
              </Picker>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>부서:</Text>
              <Picker
                style={styles.infoText}
                selectedValue={editedUserInfo.department}
                onValueChange={(itemValue, itemIndex) => setEditedUserInfo(prevState => ({ ...prevState, department: itemValue }))}
              >
                <Picker.Item label="학과를 선택하세요" value="" />
                <Picker.Item label="컴퓨터 공학과" value="computer_science" />
                <Picker.Item label="소프트웨어 공학과" value="software_engineering" />
                <Picker.Item label="디자인학과" value="design" />
                <Picker.Item label="경영학과" value="business-administration" />
              </Picker>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이메일:</Text>
              <TextInput
                style={styles.infoText}
                value={editedUserInfo.email}
                onChangeText={text => setEditedUserInfo(prevState => ({ ...prevState, email: text }))}
              />
            </View>
            <Button title="수정 완료" onPress={handleEditUserInfo} />
            <Button title="닫기" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Button title="비밀번호 변경" onPress={toggleChangePasswordModal} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>비밀번호 변경</Text>
            <TextInput
              style={styles.infoText}
              placeholder="현재 비밀번호"
              secureTextEntry={true}
              onChangeText={text => setPassword(text)} // 현재 비밀번호 입력
            />
            <TextInput
              style={styles.infoText}
              placeholder="새 비밀번호"
              secureTextEntry={true}
              onChangeText={text => setEditedUserInfo(prevState => ({ ...prevState, password: text }))} // 새 비밀번호 입력
            />
            <TextInput
              style={styles.infoText}
              placeholder="새 비밀번호 확인"
              secureTextEntry={true}
              onChangeText={text => setEditedUserInfo(prevState => ({ ...prevState, confirmPassword: text }))} // 새 비밀번호 확인 입력
            />
            <Button title="변경 완료" onPress={handleChangePassword} />
            <Button title="닫기" onPress={() => setChangePasswordModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
});

export default MyInfo;
