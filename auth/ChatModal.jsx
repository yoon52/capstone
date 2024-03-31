import React, { useEffect, useRef, useState } from 'react';
import '../../styles/chat.css';
import io from 'socket.io-client';

const ChatModal = ({ chatRoom, productId, closeModal }) => {
  const userId = sessionStorage.getItem('userId');
  const userType = sessionStorage.getItem('userType');
  const receiver = userType === 'seller' ? 'buyer' : 'seller';

  const messageContainerRef = useRef(null);
  const socket = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.current = io('http://localhost:4001/', {
      query: { chatRoom, productId, receiver } // chatRoom, productId, receiver를 함께 전달
    });

    socket.current.on('newMessage', (message) => {
      if (message.productId === productId && message.chatRoom === chatRoom && message.receiver === receiver) {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      }
    });

    socket.current.on('connect', () => {
      console.log('Client reconnected');
      fetchMessages();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [chatRoom, productId, receiver]);

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
  }, [chatRoom, productId, receiver]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:4001/messages/${chatRoom}`, {
        headers: {
          receiver // 서버에 receiver 정보를 헤더로 전달
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
      socket.current.emit('sendMessage', { text: newMessage, sender: userId, receiver, chatRoom, productId });
      setNewMessage('');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h2>채팅방 번호: {chatRoom}</h2>
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
      </div>
    </div>
  );
};

export default ChatModal;
