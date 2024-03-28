import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SearchInput from './SearchInput';
import SortSelect from './SortSelect';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Main() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortType, setSortType] = useState('recommend');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://172.30.1.76:4000/products';
        if (sortType === 'latest') {
          url = 'http://172.30.1.76:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://172.30.1.76:4000/products/searchByRecent';
        } else if (sortType === 'views') {
          url = 'http://172.30.1.76:4000/products/views';
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
    <View style={styles.mainContainer}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={handleKeywordManagement} style={styles.managementButton}>
          <Text>검색어 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProductManagement} style={styles.managementButton}>
          <Text>상품 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMyProfile} style={styles.profileButton}>
          <Text>내 정보</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text>로그아웃</Text>
        </TouchableOpacity>
      </View>
      <SearchInput
        searchTerm={searchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleSearchProduct={handleSearchProduct}
      />
      <SortSelect sortType={sortType} handleSortChange={handleSortChange} />
      <ProductList filteredProducts={filteredProducts} />
      <Button title="상품 등록" onPress={handleAddProduct} />
    </View>
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
  managementButton: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  profileButton: {
    padding: 10,
    backgroundColor: 'lightgreen',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'lightcoral',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
});
  
export default Main;
