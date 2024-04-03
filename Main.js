import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SearchInput from './SearchInput';
import SortSelect from './SortSelect';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProducts from './Addproducts'; // AddProducts 컴포넌트를 import합니다.

const Tab = createBottomTabNavigator();

function Main() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortType, setSortType] = useState('recommend');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://192.168.199.120:4000/products';
        if (sortType === 'latest') {
          url = 'http://192.168.199.120:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://192.168.199.120:4000/products/recommendations';
        } else if (sortType === 'views') {
          url = 'http://192.168.199.120:4000/products/views';
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
  
  const handleProductManagement = () => {
    navigation.navigate('ProductManagement');
  };

  const handleMyProfile = () => {
    navigation.navigate('MyInfo');
  };

  const handleLogout = () => {
    // 로그아웃 액션 수행
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={handleKeywordManagement} style={styles.managementButton}>
          <Text>검색어 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProductManagement} style={styles.managementButton}>
        </TouchableOpacity>
      </View>
      <SearchInput
        searchTerm={searchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleSearchProduct={handleSearchProduct}
      />
      <SortSelect sortType={sortType} handleSortChange={handleSortChange} />
      <ProductList filteredProducts={filteredProducts} />
      
    </ScrollView>
  );
}

function ProductManagement() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>Product Management Screen</Text>
    </View>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Main" component={Main} />
      <Tab.Screen name="AddProducts" component={AddProducts} />
      <Tab.Screen name="ProductManagement" component={ProductManagement} />
    </Tab.Navigator>
    
  );
}

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
  
});

export default BottomTabNavigator;
