import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Main from './Main';
import ProductManagement from './ProductManagement'; // 수정: ProductManagement 컴포넌트 임포트
import AddProducts from './Addproducts'; // 수정: AddProducts 컴포넌트 임포트

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="상품목록" component={Main} />
      <Tab.Screen name="상품등록" component={AddProducts} /> {/* 수정: AddProducts 컴포넌트 사용 */}
      <Tab.Screen name="상품관리" component={ProductManagement} /> {/* 수정: ProductManagement 컴포넌트 사용 */}
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
