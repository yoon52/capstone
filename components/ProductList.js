import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const itemWidth = (width - 5) / 4;

function ProductList({ filteredProducts }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleProductClick = async (productId) => {
    const viewedProductKey = `viewed_product_${productId}`;

    try {
      setLoading(true);

      const isProductViewed = await AsyncStorage.getItem(viewedProductKey);

      if (!isProductViewed) {
        await fetch(`http://172.30.1.19:4000/updateViews/${productId}`, {
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
      {filteredProducts.map(product => (
        <TouchableOpacity
          key={product.id}
          style={styles.productItem}
          onPress={() => handleProductClick(product.id)}
          disabled={loading}
        >
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `http://172.30.1.19:4000/uploads/${product.image}` }}
                style={styles.productImage}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>가격: {product.price}원</Text>
            </View>
            {loading && <ActivityIndicator size="small" color="#000" />}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginHorizontal: 0, // 좌우 여백 없애기

  },
  productItem: {
    marginBottom: 5,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    
    padding: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden', // 이미지가 컨테이너를 넘어가지 않도록 설정
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 10,
  },
});

export default ProductList;
