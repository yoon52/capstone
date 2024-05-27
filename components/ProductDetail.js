import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatComponent from './ChatComponent'; // Assuming ChatComponent is correctly defined
import socket from 'socket.io-client';
import { FontAwesome } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import { Alert } from 'react-native';
import serverHost from './host';

const ProductDetail = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sellerName, setSellerName] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [rates, setRates] = useState(null);
  const [barLength, setBarLength] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Initialize state for the image modal


  useEffect(() => {
    // rates 값이 변경될 때마다 막대기 길이 업데이트
    if (rates !== null) {
      const ratesValue = parseFloat(rates);
      const newBarLength = (ratesValue / 4.5) * 100;
      setBarLength(newBarLength);
    }
  }, [rates]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        // 서버에서 찜 상태 확인
        const favoriteResponse = await fetch(`${serverHost}:4000/products/isFavorite/${userId}/${productId}`);
        if (favoriteResponse.ok) {
          const { isFavorite } = await favoriteResponse.json();
          setIsFavorite(isFavorite);
        } else {
          console.error('찜 상태 확인 실패:', favoriteResponse.status);
        }
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    fetchFavoriteStatus();
  }, [productId, userId]);


  const getBarColor = (rates) => {
    const ratesValue = parseFloat(rates);
    if (ratesValue >= 0 && ratesValue < 1.0) {
      return '#de5d06'; // 빨간색
    } else if (ratesValue >= 1.0 && ratesValue < 2.0) {
      return '#df9100'; // 주황색
    } else if (ratesValue >= 2.0 && ratesValue < 3.0) {
      return '#319e45'; // 연두색
    } else if (ratesValue >= 3.0 && ratesValue < 4.0) {
      return '#1561a9'; // 파란색
    } else if (ratesValue >= 4.0 && ratesValue <= 4.5) {
      return '#0d3a65'; // 남색
    } else {
      return '#000000'; // 기본 색상
    }
  };

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/seller/${productId}`);
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
        const response = await fetch(`${serverHost}:4000/products/detail/${productId}`);
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
      const response = await fetch(`${serverHost}:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch(`${serverHost}:4001/api/chat-rooms`, {
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

  const handleToggleFavorite = async () => {
    try {
      // 서버에 찜 상태 토글 요청
      const response = await fetch(`${serverHost}:4000/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite); // 서버에서 받은 찜 상태로 업데이트
      } else {
        Alert.alert('알림', '본인의 게시물에는 찜을 할 수 없습니다.');

      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
  };

  if (!product) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <TouchableOpacity onPress={() => { setIsImageModalOpen(!isImageModalOpen); }}>
          <Image style={styles.productImage} source={{ uri: `${serverHost}:4000/uploads/${product.image}` }} />
        </TouchableOpacity>


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
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? 'red' : 'black'} />
          </TouchableOpacity>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
            <TouchableOpacity style={styles.chatButton} onPress={handleChatButtonClick}>
              <Text style={styles.chatButtonText}>채팅하기</Text>
            </TouchableOpacity>
          </View>
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
        <Modal
          visible={isImageModalOpen}
          animationType="slide"
          onRequestClose={() => { setIsImageModalOpen(false); }}
        >
          <View style={styles.imagemodalContainer}>
            <Image
              source={{ uri: `${serverHost}:4000/uploads/${product.image}` }}
              style={{ width: '100%', aspectRatio: 4 / 3 }} // Adjust aspectRatio according to your image's aspect ratio
              resizeMode="contain" // Ensure the entire image fits within the dimensions specified
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => { setIsImageModalOpen(false); }}>
              <FontAwesome name="times-circle" size={24} color="black" />
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff', // Footer의 배경색
  },
  heartButton: {
    marginRight: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginRight: 10,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333', // 가격 텍스트의 색상
  },
  chatButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ff4500',
    borderRadius: 5,
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // 채팅하기 버튼의 텍스트 색상
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex',
    alignItems: 'flex',
    backgroundColor: '#FFFFFF',
  },
  imagemodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent background color
  },

  fullImage: {
    width: '100%',
    height: '100%',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ProductDetail; // Exporting ProductDetail as the default export
