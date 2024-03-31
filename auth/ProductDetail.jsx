import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/product.css';
import Modal from 'react-modal';
import ChatComponent from './ChatComponent';

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/detail/${productId}`);
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
    sessionStorage.setItem('productId', productId);
  }, [productId]);

  const handleChatButtonClick = () => {
    const newChatRoom = {
      productId: productId,
      messages: []
    };
    setChatRooms([...chatRooms, newChatRoom]);
    setIsChatModalOpen(true);
  };

  const handleSendMessage = (roomId, message) => {
    const updatedChatRooms = chatRooms.map((room) => {
      if (room.productId === roomId) {
        return {
          ...room,
          messages: [...room.messages, message]
        };
      }
      return room;
    });
    setChatRooms(updatedChatRooms);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const availability = product.status === 'available' ? '구매 가능' : '판매 완료';

  return (
    <div className="product-detail">
      <h2 className="product-name">{product.name}</h2>
      <p className="product-description">{product.description}</p>
      <div className="product-info">
        <p className="product-price">Price: ${product.price}</p>
        <p className="product-date">Date: {new Date(product.createdAt).toLocaleDateString()}</p>
        <p className="product-views">Views: {product.views}</p>
        <p className="product-availability">Availability: {availability}</p>
        <button onClick={handleChatButtonClick}>채팅하기</button>
      </div>
      <Modal
  isOpen={isChatModalOpen}
  onRequestClose={() => setIsChatModalOpen(false)}
  style={{
    content: {
      top: '50%', // 모달의 상단을 화면의 중앙에 위치
      left: '50%', // 모달의 좌측을 화면의 중앙에 위치
      transform: 'translate(-50%, -50%)', // 모달을 가운데로 정렬
      width: '70%', // 모달의 너비를 70%로 설정
      height: '70%', // 모달의 높이를 70%로 설정
      maxWidth: '800px', // 모달의 최대 너비
      maxHeight: '600px', // 모달의 최대 높이
      overflow: 'auto' // 스크롤이 필요한 경우 스크롤바 표시
    }
  }}
>
  <ChatComponent chatRooms={chatRooms} onSendMessage={handleSendMessage} />
  <button onClick={() => setIsChatModalOpen(false)}>닫기</button>
</Modal>

    </div>
  );
};

export default ProductDetail;