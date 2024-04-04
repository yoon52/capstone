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
  const userId = sessionStorage.getItem('userId');

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
  }, []);

  useEffect(() => {
    sessionStorage.setItem('productId', productId);
  }, [productId]);

  const handleChatButtonClick = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch('http://localhost:4001/api/chat-rooms', {
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

  const handleSendMessage = (roomId, message) => {
    // 메시지 전송 로직 추가
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
        <button className='chat-button' onClick={handleChatButtonClick}>채팅하기</button>
      </div>
      <Modal
        isOpen={isChatModalOpen}
        onRequestClose={() => setIsChatModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            maxWidth: '800px',
            maxHeight: '600px',
            overflow: 'auto'
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