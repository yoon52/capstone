import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import '../../styles/chat.css';
import io from 'socket.io-client';

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
    socket.current = io('http://localhost:4001/', {
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
      const response = await fetch(`http://localhost:4001/messages/${productId}`, {
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

  return (
    <div className="chat-component">
      <div className="chat-header">
        <h3>사용자 ID: {userId} - 채팅방 번호: {productId}</h3>
      </div>
      <div ref={messageContainerRef} className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-container ${message.sender === userId ? 'own-message' : 'other-message'}`}
          >
            <span className="message-sender">{message.sender === userId ? '나' : message.sender}</span>
            <span className="message-text">{message.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </form>
      <button onClick={handlePayment}>결제하기</button>
    </div>
  );
};

export default ChatComponent;