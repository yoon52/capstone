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
        let url = 'http://172.20.10.3:4000/products';
        if (sortType === 'latest') {
          url = 'http://172.20.10.3:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://172.20.10.3:4000/products/recommendations';
        } else if (sortType === 'views') {
          url = 'http://172.20.10.3:4000/products/views';
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
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleChangeSearchTerm = (value) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value) => {
    setSortType(value);
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
    <ScrollView style={styles.mainContainer}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.managementButton}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>

      </View>
      {/* 수정된 검색어창 */}
      <View style={styles.searchContainer}>
        <TextInput

          label="상품 검색"
          value={searchTerm}
          onChangeText={handleChangeSearchTerm}
          style={styles.input}
        />
        {/* 수정된 검색 버튼 */}
        <TouchableOpacity onPress={handleSearchProduct} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <SortSelect sortType={sortType} handleSortChange={handleSortChange} />
      <ProductList filteredProducts={filteredProducts} />
      {isSidebarOpen && <Sidebar onClose={toggleSidebar} />}
    </ScrollView>
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
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
  },
});

export default BottomTabNavigator;
