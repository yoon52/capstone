import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

function WishList() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // AsyncStorage에서 userId 가져오기
      const userId = await AsyncStorage.getItem('userId');
  
      // API 요청 보내기
      const response = await fetch('http://172.30.1.19:4000/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
  
      const data = await response.json();
  
      // API 응답에서 즐겨찾기 목록 설정
      setFavorites(data);
      setLoading(false); // 로딩 상태 변경
    } catch (error) {
      console.error('Error loading favorites', error);
      setLoading(false); // 로딩 상태 변경
    }
  };
  
  const renderFavoriteItem = ({ item }) => (
    <View>
      <Text>{item.product_name}</Text>
      {/* 여기에 다른 상품 정보 표시 */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wish List</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    fontSize: 16,
  },
});

export default WishList;