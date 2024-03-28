import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ProductDetail({ route }) {
  // Extracting product ID from the route parameters
  const { productId } = route.params;

  // State to hold the product details
  const [product, setProduct] = useState(null);

  // Function to fetch product details based on the product ID
  const fetchProductDetails = async () => {
    try {
      // Make API request to fetch product details using the productId
      // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint
      const response = await fetch(`YOUR_API_ENDPOINT/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        console.error('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  // Fetch product details when component mounts
  useEffect(() => {
    fetchProductDetails();
  }, []);

  return (
    <View style={styles.container}>
      {product ? (
        // Render product details if product is available
        <View>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.price}>Price: ${product.price}</Text>
          {/* Add more details as needed */}
        </View>
      ) : (
        // Render loading indicator if product is being fetched
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetail;