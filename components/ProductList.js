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
        await fetch(`http://192.168.219.165:4000/updateViews/${productId}`, {
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
          <View style={styles.card}>
            <Image
              source={{ uri: `http://192.168.219.165:4000/uploads/${product.image}` }}
              style={styles.productImage}
            />
            <Text numberOfLines={2} style={styles.productName}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}원</Text>
            {loading && <ActivityIndicator size="small" color="#000" />}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  productItem: {
    width: 110,
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 5,
    alignItems: 'center',
  },
  productImage: {
    width: 110,
    height: 110,
    maxWidth:110,
    maxHeight:110,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default ProductList;