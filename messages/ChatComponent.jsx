import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/chat.css';
import io from 'socket.io-client';
import serverHost from '../../utils/host';
import SendIcon from '@mui/icons-material/Send';
import PaymentIcon from '@mui/icons-material/Payment';
import Button from '@mui/material/Button';

const ChatComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const productId = sessionStorage.getItem('productId');
  const userType = sessionStorage.getItem('userType');
  const receiver = userType === 'seller' ? 'buyer' : 'seller';
  const messageContainerRef = useRef(null);
  const socket = useRef(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.current = io(`${serverHost}:4001/`, {
      query: { productId, receiver }
    });

    socket.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    socket.current.on('connect', () => {
      console.log('Client reconnected');
      fetchMessages();
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    adjustMessageContainer();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const adjustMessageContainer = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      scrollToBottom();
    }
  };

  useEffect(() => {
    socket.current.on('chatHistory', (chatHistory) => {
      setMessages(chatHistory);
      scrollToBottom();
    });
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${serverHost}:4001/messages/${productId}`, {
        headers: {
          'receiver': receiver
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      socket.current.emit('sendMessage', { text: newMessage, sender: userId, receiver, productId });
      setNewMessage('');
    }
  };

  const handlePayment = () => {
    navigate(`/sandbox?productId=${productId}&userId=${userId}`);
    console.log('결제 처리 로직을 추가하세요.');
  };

  const isCurrentUser = (senderId) => senderId === userId;

  return (
    <div className="chat-component">
      <div className="chat-header">
        <h3>사용자 ID: {userId} - 채팅방 번호: {productId}</h3>
      </div>
      <div ref={messageContainerRef} className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-container ${isCurrentUser(message.sender) ? 'own-message' : 'other-message'}`}
          >
            {!isCurrentUser(message.sender) && (
              <img
                src="https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png"
                className="profile-image"
                alt="프로필 이미지"
              />
            )}

            <div className="message-content">
              <span className="message-sender">{isCurrentUser(message.sender) ? '' : message.sender}</span>
              <span className="message-text">{message.text}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} className="message-input-form1">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <div className="button-group-1">
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            className="button"
          >
            {/* 아이콘만 사용하고 텍스트는 비워둡니다 */}
          </Button>
          <Button
            className="button Pay-button1"
            onClick={handlePayment}
            variant="contained"
            startIcon={<PaymentIcon />}
          >
            {/* 아이콘만 사용하고 텍스트는 비워둡니다 */}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ChatComponent;