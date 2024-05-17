import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { TextInput } from 'react-native-paper'; // TextInput을 추가로 import합니다.
import { Ionicons } from '@expo/vector-icons'; // 검색 아이콘을 추가로 import합니다.
import SortSelect from './SortSelect';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProducts from './Addproducts'; // AddProducts 컴포넌트를 import합니다.
import ChatList from './ChatList'; // ChatList 컴포넌트를 import합니다.
import Sidebar from './SideBar'; // 사이드바 컴포넌트를 추가로 import합니다.

const Tab = createMaterialBottomTabNavigator();

function MainScreen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortType, setSortType] = useState('recommend');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열기/닫기 상태를 관리합니다.

  const navigation = useNavigation();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://172.30.1.19:4000/products';
        if (sortType === 'latest') {
          url = 'http://172.30.1.19:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://172.30.1.19:4000/products/latest';
        } else if (sortType === 'views') {
          url = 'http://172.30.1.19:4000/products/views';
        }
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(url, {
          headers: {
            'user_id': userId
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data);
        } else {
          console.error('상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 목록 가져오기 오류:', error);
      }
    };

    fetchProducts();
  }, [sortType]);

  const handleAddProduct = () => {
    navigation.navigate('AddProducts');
  };

  const handleSearchProduct = () => {
    navigation.navigate('SearchPage');
  };

  const handleChangeSearchTerm = (value) => {
    setSearchTerm(value);
  };

  const handleKeywordManagement = () => {
    navigation.navigate('search-keyword');
  };


  const handleMyProfile = () => {
    navigation.navigate('MyInfo');
  };

  const handleLogout = () => {
    // 로그아웃 액션 수행
    navigation.navigate('Login');
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('touched')
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#103260" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        
        <TouchableOpacity onPress={handleSearchProduct} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#103260" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.productContainer}>
        
        <ProductList filteredProducts={filteredProducts} />
      </ScrollView>
      {isSidebarOpen && <Sidebar onClose={toggleSidebar} />}
    </View>
  );
}



const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      shifting={true} // 탭이 스와이프되는 동안 색상이 변경되도록 설정
      barStyle={{ backgroundColor: 'white' }} // 탭 바의 배경색 설정
    >
      <Tab.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddProduct"
        component={AddProducts}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatList}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    backgroundColor: '#f4f4f4',
    
  },
  menuButton: {},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f4',
  },
  searchButton: {
    borderRadius: 10,
    marginLeft: '85%',
    marginTop: -35,
    marginBottom: -20,
    
  },
  productContainer: {
    marginTop: 5,
    flex: 1,
    paddingVertical: 10, // 위아래 패딩
    paddingHorizontal: 20, // 양 옆 패딩
  },
});

export default BottomTabNavigator;