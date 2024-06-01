import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';

import serverHost from './host';

const SuccessPage = ({ route }) => {
  const { paymentData, product, price, userId } = route.params;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [ratingSubmitted, setRatingSubmitted] = useState(false); // 평점 제출 상태
  const [rating, setRating] = useState(0);
  const [productId, setProductId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchProductId = async () => {
      try {
        const id = await AsyncStorage.getItem('productId');
        if (id !== null) {
          setProductId(id);
        } else {
          console.error('No productId found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching productId from AsyncStorage:', error);
      }
    };
    fetchProductId();
  }, []);

  const confirmPayment = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: price,
          productId, // Use the state variable for productId
          userId: userId
        })
      });

      if (response.ok) {
        setIsConfirmed(true);
        // 결제 완료 후 상품의 판매 상태를 업데이트
        await handleSellProduct(productId);
        // Open the modal after successful payment
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const handleSellProduct = async (productId) => {
    try {
      const response = await fetch(`${serverHost}:4000/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': AsyncStorage.getItem('userId')
        }
      });
      if (response.ok) {
        Alert.alert('상품이 판매되었습니다.');
      } else {
        console.error('상품 판매완료 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 판매완료 처리 실패:', error);
    }
  };

  const updateSellerRating = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          rating: rating
        })
      });

      if (response.ok) {
        console.log('Seller rating updated successfully.');
        setRatingSubmitted(true);
        Alert.alert('평점 등록 성공');
      } else {
        console.error('Failed to update seller rating:', response.status);
      }
    } catch (error) {
      console.error('Error updating seller rating:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (ratingSubmitted) {
      setRatingSubmitted(false);
    }
  };

  const navigateToMainPage = () => {
    navigation.navigate('Main'); // Replace 'Main' with the name of your main page route
  };

  return (
    <View style={styles.container}>
      {isConfirmed ? (
        <View style={styles.confirmContainer}>
          <Text style={styles.title}>결제를 완료했어요</Text>
          <Text style={styles.label}>결제 금액: {price}</Text>
          <Text style={styles.label}>주문번호: {paymentData.orderId}</Text>
          <Text style={styles.label}>결제 ID: {paymentData.paymentKey}</Text>
          <Button title="메인으로 이동" onPress={navigateToMainPage} color="#6c63ff" />
        </View>
      ) : (
        <View style={styles.confirmContainer}>
          <Text style={styles.title}>결제 요청까지 성공했어요.</Text>
          <Text style={styles.label}>결제 승인하고 완료해보세요.</Text>
          <Button title="결제 승인하기" onPress={confirmPayment} color="#6c63ff" />
        </View>
      )}
      <Modal visible={isModalOpen} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {ratingSubmitted ? (
              <View>
                <Text style={styles.modalTitle}>평점이 제출되었습니다!</Text>
                <Button title="닫기" onPress={closeModal} color="#6c63ff" />
              </View>
            ) : (
              <View>
                <Text style={styles.modalTitle}>사용자 평점 등록</Text>
                <View style={styles.ratingSection}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={4.5}
                    step={0.1}
                    value={rating}
                    onValueChange={setRating}
                    minimumTrackTintColor="#FFD700"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#6c63ff"
                  />
                  <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={updateSellerRating}>
                  <Text style={styles.submitButtonText}>평점 등록</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F2F5',
  },
  confirmContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,

  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    width: 200,
    height: 40,
  },
  ratingValue: {
    fontSize: 18,
    marginLeft: 10,
    color: '#555',
  },
  submitButton: {
    backgroundColor: '#6c63ff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff4757',
    padding: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



export default SuccessPage;