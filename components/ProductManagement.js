import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';
const screenWidth = Dimensions.get('window').width;

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/productsmanage`, {
        headers: {
          'user_id': userId
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching product list:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  };

  const handleProductPress = (productId) => {
    navigation.navigate('ProductManagementForm', { productId });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <Text style={styles.header}>내가 등록한 상품</Text>
      <View style={styles.cardsContainer}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.card}
            onPress={() => handleProductPress(product.id)}
            accessibilityLabel={`Product ${product.name}, priced at ${product.price}원`}
          >
            <Image
              source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.cardDesc}>
              <Text style={styles.cardTitle}>{product.name}</Text>
              <Text style={styles.cardPrice}>{product.price}원</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: screenWidth * 0.42, // Dynamic width calculation
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardDesc: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontSize: 14,
    color: '#888',
  },
});

export default ProductManagement;