import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatComponent from './ChatComponent'; // Assuming ChatComponent is correctly defined

const ProductDetail = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://172.20.10.3:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('상품 상세 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 상세 정보 가져오기 오류:', error);
      }
    };

    fetchProductDetail();
  }, [productId]); // productId 의존성 추가

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleChatButtonClick = async () => {
    try {
      const response = await fetch(`http://172.20.10.3:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch('http://172.20.10.3:4001/api/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, userId })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create chat room');
      }

      setIsChatModalOpen(true);
    } catch (error) {
      console.error('Error creating or retrieving chat room:', error);
    }
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };

  if (!product) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const availability = product.status === 'available' ? '구매 가능' : '판매 완료';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Image style={styles.image} source={{ uri: `http://172.20.10.3:4000/uploads/${product.image}` }} />
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.price}>Price: ${product.price}</Text>
        <Text style={styles.date}>Date: {new Date(product.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.views}>Views: {product.views}</Text>
        <Text style={styles.availability}>Availability: {availability}</Text>
        <Button title="채팅하기" onPress={handleChatButtonClick} />
      </View>
      
      <Modal
    visible={isChatModalOpen}
    animationType="slide"
    onRequestClose={handleCloseChatModal}
  >
    <View style={styles.modalContainer}>
      {/* ChatComponent에 route를 전달 */}
      <ChatComponent route={route} />
      <Button title="닫기" onPress={handleCloseChatModal} />
    </View>
  </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    marginBottom: 5,
  },
  views: {
    fontSize: 16,
    marginBottom: 5,
  },
  availability: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex',
    alignItems: 'flex',
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },

});

export default ProductDetail;
