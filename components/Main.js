import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProducts from './Addproducts';
import ChatList from './ChatList';
import Sidebar from './SideBar';
import serverHost from './host';

const Tab = createMaterialBottomTabNavigator();

function MainScreen() {
  const [, setProducts] = useState([]);
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortType, ] = useState('recommend');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const fetchProducts = async () => {
    try {
      let url = `${serverHost}:4000/products/viewsMob`;
      if (sortType === 'latest') {
        url = `${serverHost}:4000/products/viewsMob`;
      } else if (sortType === 'recommend') {
        url = `${serverHost}:4000/products/viewsMob`;
      } else if (sortType === 'views') {
        url = `${serverHost}:4000/products/viewsMob`;
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
    } finally {
      setRefreshing(false); // 새로고침 완료 후 상태 변경
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true); // 새로고침 시작 시 상태 변경
    fetchProducts();
  }, [refreshing]);

  useEffect(() => {
    fetchProducts();
  }, [sortType]);

  const handleAddProduct = () => {
    navigation.navigate('AddProducts');
  };

  const handleSearchProduct = () => {
    navigation.navigate('SearchPage');
  };

  const handleLogout = () => {
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
      <ScrollView
        style={styles.productContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ProductList filteredProducts={filteredProducts} />

      </ScrollView>
      {isSidebarOpen && <Sidebar onClose={toggleSidebar} />}
    </View>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      shifting={true}
      barStyle={{ backgroundColor: 'white' }}
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    
  },
});

export default BottomTabNavigator;
