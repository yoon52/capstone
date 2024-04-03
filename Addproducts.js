// AddProducts.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function AddProducts() {
  const navigation = useNavigation();

  const handleProductManagement = () => {
    navigation.navigate('ProductManagement');
  };

  return (
    <View style={styles.container}>
      <Text>Add Products Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddProducts;
