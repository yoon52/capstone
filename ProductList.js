import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

function ProductList({ filteredProducts }) {
  const handleProductClick = async (productId) => {
    try {
      // 상품 조회수 업데이트 및 상세 화면으로 이동
    } catch (error) {
      console.error('조회수 업데이트 오류:', error);
    }
  };

  return (
    <View style={styles.productList}>
      {filteredProducts.map(product => (
        <TouchableOpacity
          key={product.id}
          style={styles.productItem}
          onPress={() => handleProductClick(product.id)}
        >
          <View style={styles.productContent}>
            <Image
              source={{ uri: `http://192.168.199.120:4000/uploads/${product.image}` }}
              style={styles.productImage}
            />
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPrice}>Price: ${product.price}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '30%', // Adjust the width according to your design
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
  },
  productContent: {
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  productDescription: {
    marginTop: 5,
  },
  productPrice: {
    marginTop: 5,
    fontWeight: 'bold',
  },
});

export default ProductList;