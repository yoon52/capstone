import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 라이브러리 추가
import ProductList from './ProductList'; // 상품 목록 컴포넌트
import AddProduct from './Addproducts'; // 상품 등록 컴포넌트
import ChatList from './ChatList'; // 채팅 목록 컴포넌트
import MainScreen from './Main'; // MainScreen 컴포넌트 import

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === '상품목록') {
            iconName = 'ios-list'; // 상품 목록 아이콘
          } else if (route.name === '상품등록') {
            iconName = 'ios-add-circle'; // 상품 등록 아이콘
          } else if (route.name === '채팅목록') {
            iconName = 'ios-chatbubbles'; // 채팅 목록 아이콘
          }

          // 아이콘 컴포넌트 반환
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'blue', // 활성 탭의 색상
        inactiveTintColor: 'gray', // 비활성 탭의 색상
      }}
    >
      {/* 상품 목록 탭 */}
      <Tab.Screen name="상품목록" component={MainScreen} />
      {/* 상품 등록 탭 */}
      <Tab.Screen name="상품등록" component={AddProduct} />
      {/* 채팅 목록 탭 */}
      <Tab.Screen name="채팅목록" component={ChatList} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;