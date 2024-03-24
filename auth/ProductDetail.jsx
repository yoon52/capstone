// ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/product.css';
import Modal from 'react-modal'; // react-modal 라이브러리 import
import ChatComponent from './ChatComponent'; // ChatComponent 라는 모달 내부의 채팅 컴포넌트 import

Modal.setAppElement('#root'); // 모달을 사용할 때, 화면 리더기 등에게 모달을 보여주는 엘리먼트를 지정

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState([]); // 각 채팅방에 대한 정보를 저장하는 상태 추가

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
    // productId를 세션에 저장
    sessionStorage.setItem('productId', productId);
  }, [productId]);


  const handleChatButtonClick = () => {
    // 해당 상품에 대한 채팅방을 생성하고 열린 채팅방 목록에 추가
    const newChatRoom = {
      productId: productId,
      messages: [] // 채팅 메시지 목록
    };
    setChatRooms([...chatRooms, newChatRoom]);
    setIsChatModalOpen(true);
  };

  const handleSendMessage = (roomId, message) => {
    // 메시지를 해당 채팅방에 추가
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
      <Modal isOpen={isChatModalOpen} onRequestClose={() => setIsChatModalOpen(false)}>
        <ChatComponent chatRooms={chatRooms} onSendMessage={handleSendMessage} />
          <button onClick={() => setIsChatModalOpen(false)}>닫기</button>
      </Modal>
    </div>
  );
};

export default ProductDetail;
