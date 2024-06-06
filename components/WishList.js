import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

const ShowWishlist = () => {
  const [userId, setUserId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchWishlistItems = async () => {
        try {
          const response = await fetch(`${serverHost}:4000/favorites?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setWishlistItems(data);
          } else {
            console.error('Error fetching wishlist items:', response.status);
          }
        } catch (error) {
          console.error('Error fetching wishlist items:', error);
        }
      };

      fetchWishlistItems();
    }
  }, [userId]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const updatedItems = await Promise.all(
          wishlistItems.map(async (product) => {
            const favoriteResponse = await fetch(`${serverHost}:4000/products/isFavorite/${userId}/${product.product_id}`);
            if (favoriteResponse.ok) {
              const { isFavorite } = await favoriteResponse.json();
              return { ...product, isFavorite };
            } else {
              console.error('찜 상태 확인 실패:', favoriteResponse.status);
              return product;
            }
          })
        );
        setWishlistItems(updatedItems);
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    if (wishlistItems.length > 0) {
      fetchFavoriteStatus();
    }
  }, [wishlistItems, userId]);

  const handleProductClick = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const response = await fetch(`${serverHost}:4000/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId ? { ...item, isFavorite: data.isFavorite } : item
          )
        );
      } else {
        console.error('찜 상태 토글 실패:', response.status);
      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.wishlistTitle}>찜 목록</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.wishlistContainer}>
          {wishlistItems.map((product) => (
            <View key={product.id} style={styles.wishlistItemContainer}>
              <TouchableOpacity style={styles.wishlistItem} onPress={() => handleProductClick(product.product_id)}>
                <TouchableOpacity style={styles.wishlistBadge} onPress={() => handleToggleFavorite(product.product_id)}>
                  {product.isFavorite ? <FontAwesome name="heart" size={24} color="red" /> : <FontAwesome name="heart-o" size={24} color="black" />}
                </TouchableOpacity>
                <Image
                  source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
                  style={styles.wishImage}
                />
                <View style={styles.wishDetails}>
                  <Text style={styles.wishName}>상품명: {product.product_name}</Text>
                  <Text style={styles.wishPrice}>가격: {product.price.toLocaleString()}원</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 30
  },
  wishlistTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    marginLeft:10,
  },
  wishlistContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wishlistItemContainer: {
    width: '48%',
    marginBottom: 20,
  },
  wishlistItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  wishImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  wishDetails: {
    alignItems: 'center',
  },
  wishName: {
    fontWeight:'bold',
    fontSize: 18,
    marginBottom: 5,
    textAlign:'center',
  },
  wishPrice: {
    fontSize: 16,
    textAlign:'center',
  },
});

export default ShowWishlist;
