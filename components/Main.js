import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProductList from './ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProducts from './AddProducts';
import ChatList from './ChatList';
import Sidebar from './SideBar';
import serverHost from './host';
import { useTheme } from 'react-native-paper';

const Tab = createMaterialBottomTabNavigator();
const ads = [
  { id: '1', uri: 'https://ssl.pstatic.net/melona/libs/1497/1497101/875d9ac6d48065f7a3c1_20240604162511108.png' },
  { id: '2', uri: 'https://via.placeholder.com/300x100?text=Ad+2' },
  { id: '3', uri: 'https://via.placeholder.com/300x100?text=Ad+3' },
];

function MainScreen() {
  const [, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortType,] = useState('recommend');
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
        console.error('Error fetching products:', response.status);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [refreshing]);

  useEffect(() => {
    fetchProducts();
  }, [sortType]);

  const handleSearchProduct = () => {
    navigation.navigate('SearchPage');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const renderItem = ({ item }) => (
    <Image source={{ uri: item.uri }} style={styles.bannerImage} />
  );

  const handlePress = () => {
    navigation.navigate('MyInfo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#103260" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={handleSearchProduct} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#103260" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePress}>
        <Image 
          source={{ uri: 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }} 
          style={styles.searchImage} 
        />
      </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bannerContainer}>
      <Swiper
        showsButtons={false}
        paginationStyle={{ bottom: -1 }} // Adjust the bottom value as needed
        activeDotColor="#103260" // Change the color of active dot to white
        dotColor="#ffffff" // Change the color of inactive dots to white
        dotStyle={{ width: 8, height: 8, borderRadius: 4 }} // Adjust the size of dots
        activeDotStyle={{ width: 8, height: 8, borderRadius: 4 }} // Adjust the size of active dot
      >


        <View style={styles.slide}>
          <Image source={require('../image/123.png')} style={styles.bannerImage} />
        </View>
        <View style={styles.slide}>
          <Image source={{ uri: 'https://ssl.pstatic.net/melona/libs/1497/1497101/875d9ac6d48065f7a3c1_20240604162511108.png' }} style={styles.bannerImage} />
        </View>
      </Swiper>
    </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
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
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent";

  return (
    <Tab.Navigator
      shifting={true}
      barStyle={{ backgroundColor: 'white' }}
    >
      <Tab.Screen
        name="메인화면"
        component={MainScreen}
        options={{
          tabBarIcon: () => (
            <Ionicons name="list" size={24} color="#103260" />
          ),
        }}
      />
      <Tab.Screen
        name="상품 등록"
        component={AddProducts}
        options={{
          tabBarIcon: () => (
            <Ionicons name="add-circle" size={24} color="#103260" />
          ),
        }}
      />
      <Tab.Screen
        name="채팅 목록"
        component={ChatList}
        options={{
          tabBarIcon: () => (
            <Ionicons name="chatbubbles" size={24} color="#103260" />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    backgroundColor: '#f4f4f4',
  },
  menuButton: {
    marginTop: -2
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    borderRadius: 10,
    padding: 10,
  },
  searchImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  bannerContainer: {
    height: 120, // 광고 배너 높이 조절
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '90%',
    height: 100,
    resizeMode: 'cover',

  },

  productContainer: {
    flex: 1,
  },
});

export default BottomTabNavigator;