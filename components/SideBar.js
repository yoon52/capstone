import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MyInfo from './MyInfo';


const Sidebar = ({ onClose }) => {
  const navigation = useNavigation();

  const handleProductManagement = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('ProductManagement'); // ProductManagement 화면으로 이동
  };

  const handleMyInfo = () => {
    onClose(); // 사이드바 닫기
    navigation.navigate('MyInfo'); // MyInfo 화면으로 이동
  };

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleMyInfo}> 
        <Text>내 정보</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Text>설정</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleProductManagement}>
        <Text>상품 관리</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Text>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#FFFFFF',
    width: 200,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    elevation: 5,
    paddingTop: 50,
    paddingLeft: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
});

export default Sidebar;
