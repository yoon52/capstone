// ProductList.js

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

function ProductList({ filteredProducts }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formattedProducts, setFormattedProducts] = useState([]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60)); // milliseconds to minutes

      if (timeDifference < 30) {
        return '방금 전';
      } else if (timeDifference < 60 * 24) {
        return `${Math.floor(timeDifference / 60)}시간 전`;
      } else if (timeDifference < 60 * 24 * 7) {
        return `${Math.floor(timeDifference / (60 * 24))}일 전`;
      } else if (timeDifference < 60 * 24 * 30) {
        return `${Math.floor(timeDifference / (60 * 24 * 7))}주 전`;
      } else {
        return '한달 ↑';
      }
    };

    const formatted = filteredProducts.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [filteredProducts]);

  const handleProductClick = async (productId) => {
    const viewedProductKey = `viewed_product_${productId}`;

    try {
      setLoading(true);

      const isProductViewed = await AsyncStorage.getItem(viewedProductKey);

      if (!isProductViewed) {
        await fetch(`${serverHost}:4000/updateViews/${productId}`, {
          method: 'POST',
        });

        await AsyncStorage.setItem(viewedProductKey, 'true');
      }

      navigation.navigate('ProductDetail', { productId });
    } catch (error) {
      console.error('Error updating views:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!filteredProducts || filteredProducts.length === 0) {
    return <Text style={styles.emptyText}>No products found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {formattedProducts.map(product => (
        <TouchableOpacity
          key={product.id}
          style={styles.productItem}
          onPress={() => handleProductClick(product.id)}
          disabled={loading}
        >
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
                style={styles.productImage}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>가격: {product.price}원</Text>
              <Text style={styles.productPrice}>{product.formattedCreatedAt}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {loading && <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  productItem: {
    width: '100%',
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 14,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});

export default ProductList;