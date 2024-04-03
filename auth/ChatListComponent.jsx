import React, { useState, useEffect } from 'react';
import '../../styles/chat.css';
import ChatModal from './ChatModal';

const ChatListComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const userType = sessionStorage.getItem('userType');
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomProductId, setSelectedRoomProductId] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    fetchChatRooms();
  }, [userId, userType]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('http://localhost:4001/myChatRooms', {
        headers: {
          'user_id': userId,
          'user_type': userType
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

  const openModal = (chatRoomId, productId) => {
    setSelectedRoomId(chatRoomId);
    setSelectedRoomProductId(productId);
    setIsChatModalOpen(true); // 모달 열기
  };
  
  const closeModal = () => {
    setSelectedRoomId(null);
    setSelectedRoomProductId(null);
    setIsChatModalOpen(false); // 모달 닫기
  };

  return (
    <div className="chat-list-container">
      <h2>내 채팅방 목록</h2>
      <ul>
        {chatRooms.map((chatRoom) => (
          <li key={chatRoom.id}>
            <button onClick={() => openModal(chatRoom.id, chatRoom.productId)}>채팅방 번호: {chatRoom.productId}</button>
          </li>
        ))}
      </ul>
      {selectedRoomId && selectedRoomProductId && (
        <ChatModal chatRoomId={selectedRoomId} productId={selectedRoomProductId} closeModal={closeModal} isOpen={isChatModalOpen} />
      )}
      
    </div>
  );
};

export default ChatListComponent;