import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import serverHost from './host';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId !== null) {
        loadPayments(userId);
      } else {
        console.error('User ID not found in AsyncStorage');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user ID from AsyncStorage', error);
      setLoading(false);
    }
  };

  const loadPayments = async (userId) => {
    try {
      const response = await fetch(`${serverHost}:4000/payments/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payments', error);
      setLoading(false);
    }
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentItem}>
      <Text style={styles.paymentDate}>결제 날짜: {item.createdAt}</Text>
      <Text style={styles.paymentAmount}>결제 금액: {item.amount}</Text>
      <Text style={styles.productName}>상품 이름: {item.productName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>결제 내역</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  paymentDate: {
    fontWeight: 'bold',
  },
  paymentAmount: {
    marginTop: 5,
  },
  productName: {
    marginTop: 5,
    color: '#666',
  },
});

export default Payments;
