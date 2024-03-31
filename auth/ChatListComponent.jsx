import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/chat.css';
import ChatModal from './ChatModal'; // ChatModal 컴포넌트 추가

const ChatListComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const productId = sessionStorage.getItem('productId');
  const userType = sessionStorage.getItem('userType'); // 사용자 유형 정보 추가
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // 선택된 채팅방 상태

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('http://localhost:4001/chatRooms', {
        headers: {
          'user_id': userId,
          'product_id': productId,
          'user_type': userType // userType도 헤더에 포함
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // 모달 열기 함수
  const openModal = (chatRoom, productId) => {
    setSelectedRoom({ chatRoom, productId, userType }); // userType 정보도 함께 전달
  };
  
  // 모달 닫기 함수
  const closeModal = () => {
    setSelectedRoom(null);
  };

  return (
    <div className="chat-list-container">
      <h2>채팅방 목록</h2>
      <ul>
        {chatRooms.map((chatRoom) => (
          <li key={chatRoom}>
            {/* 클릭 시 모달 열기 */}
            <button onClick={() => openModal(chatRoom, productId)}>채팅방 번호: {chatRoom}</button>
          </li>
        ))}
      </ul>
      {/* 모달 창 */}
      {selectedRoom && (
        <ChatModal chatRoom={selectedRoom.chatRoom} productId={selectedRoom.productId} receiver={selectedRoom.userType === 'seller' ? 'buyer' : 'seller'} closeModal={closeModal} />
      )}
    </div>
  );
};

export default ChatListComponent;
