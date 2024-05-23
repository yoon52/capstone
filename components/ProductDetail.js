import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatComponent from './ChatComponent'; // Assuming ChatComponent is correctly defined
import socket from 'socket.io-client';

const ProductDetail = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sellerName, setSellerName] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [rates, setRates] = useState(null);
  const [barLength, setBarLength] = useState(0);

  useEffect(() => {
    // rates 값이 변경될 때마다 막대기 길이 업데이트
    if (rates !== null) {
      const ratesValue = parseFloat(rates);
      const newBarLength = (ratesValue / 4.5) * 100;
      setBarLength(newBarLength);
    }
  }, [rates]);

  const getBarColor = (rates) => {
    const ratesValue = parseFloat(rates);
    if (ratesValue >= 0 && ratesValue < 1.0) {
      return '#FF0000'; // 빨간색
    } else if (ratesValue >= 1.0 && ratesValue < 2.0) {
      return '#FFA500'; // 주황색
    } else if (ratesValue >= 2.0 && ratesValue < 3.0) {
      return '#ADFF2F'; // 연두색
    } else if (ratesValue >= 3.0 && ratesValue <= 4.5) {
      return '#0000FF'; // 파란색
    } else {
      return '#000000'; // 기본 색상
    }
  };


  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`http://172.30.1.2:4000/products/seller/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setSellerId(data.sellerId);
          setSellerName(data.sellerName);
          setRates(data.rates);
        } else {
          console.error('판매자 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('판매자 정보 가져오기 오류:', error);
      }
    };

    fetchSellerInfo();
  }, [productId]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://172.30.1.2:4000/products/detail/${productId}`);
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
  }, [productId]);

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
      const response = await fetch(`http://172.30.1.2:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch('http://172.30.1.2:4001/api/chat-rooms', {
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
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null; // 소켓 객체 초기화
    }
  };

  if (!product) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <Image style={styles.productImage} source={{ uri: `http://172.30.1.2:4000/uploads/${product.image}` }} />
        <View style={styles.userInfoContainer}>
          <Image
            style={styles.profileImage}
            source={{ uri: 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }}
          />
          <View style={styles.articleProfileLeft}>
            <View style={styles.spaceBetween}>
              <Text style={styles.userId}>학번: {sellerId}</Text>
            </View>
            <Text style={styles.userName}>이름: {sellerName}</Text>
          </View>
          <View style={styles.articleProfileRight}>
            <View style={styles.temperatureWrap}>
              <Text style={styles.temperatureTitle}>매너학점</Text>
              <Text style={styles.temperatureText}>{rates}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${barLength}%`, backgroundColor: getBarColor(rates) }]}></View>
            </View>


          </View>
        </View>


        <View style={styles.productInfoContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>

          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.productNote}>{product.note}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
          <TouchableOpacity style={styles.chatButton} onPress={handleChatButtonClick}>
            <Text style={styles.chatButtonText}>채팅하기</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isChatModalOpen}
          animationType="slide"
          onRequestClose={handleCloseChatModal}
        >
          <View style={styles.modalContainer}>
            <ChatComponent route={route} />
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    justifyContent: 'space-between', // footer를 컨테이너의 하단으로 이동
  },
  contentContainer: {
    flex: 1,
  },

  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  articleProfileLeft: {
    flex: 1,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userId: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#000000',
    fontSize: 16,
  },
  articleProfileRight: {
    alignItems: 'flex-end',
  },
  temperatureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  temperatureText: {
    color: '#FF4500',
    fontSize: 16,
    marginLeft: 5,
  },
  meters: {
    height: 10,
    backgroundColor: '#DCDCDC',
    borderRadius: 5,
    marginTop: 5,
    width: 100,
  },

  barContainer: {
    height: 10,
    backgroundColor: '#DCDCDC',
    borderRadius: 5,
    marginTop: 5,
    width: 100,
  },

  bar: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 5,
  },
  face: {
    marginTop: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4500',
  },
  productInfoContainer: {
    backgroundColor: '#F8F8F8', // 배경색을 연한 회색으로 변경
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginBottom: 20,

  },
  productTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 10,
  },
  productNote: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
    footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#333',
    
  },


  price: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#ff4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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