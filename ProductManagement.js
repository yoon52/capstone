// ProductManagement.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function ProductManagement() {
  const navigation = useNavigation();

  const handleProductManagement = () => {
    navigation.navigate('ProductManagement');
  };

  return (
    <View style={styles.container}>
      <Text>Product Management Screen</Text>
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

export default ProductManagement;
