import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

function UserEdit({ route }) {
  const [userInfo, setUserInfo] = useState(null);
  const [editedUserInfo, setEditedUserInfo] = useState(null);

  useEffect(() => {
    const { password } = route.params;
    fetchUserInfo(password);
  }, []);

  const fetchUserInfo = async (password) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch('http://192.168.219.165:4000/myinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setEditedUserInfo(data); // 처음에는 기존 정보로 초기화
      } else {
        Alert.alert('Error', '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      Alert.alert('Error', '내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch('http://192.168.219.165:4000/edituserinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, editedUserInfo })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        // 성공 메시지를 처리하는 코드 추가
      } else {
        console.error('사용자 정보 수정 실패');
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
    }
  };

  const handleChange = (field, value) => {
    setEditedUserInfo({ ...editedUserInfo, [field]: value });
  };

  return (
    <View>
      <Text>ID: {userInfo?.id}</Text>
      <TextInput
        onChangeText={(text) => handleChange('name', text)}
        value={editedUserInfo?.name || userInfo?.name}
      />
      {/* 수정할 다른 사용자 정보 입력 필드들을 추가하세요 */}
      <Button title="저장" onPress={handleSave} />
    </View>
  );
}

export default UserEdit;