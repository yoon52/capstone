import React, { useState, useEffect, useRef } from 'react';
import '../../styles/main.css';
import io from 'socket.io-client'; // 웹 소켓 클라이언트 라이브러리

const ChatComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const productId = sessionStorage.getItem('productId');
  const messageContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null); // 웹 소켓 연결 상태를 저장하기 위한 useRef

  useEffect(() => {
    fetchMessages();
  }, []);

      // 웹 소켓 연결
      socket.current = io('https://ec2caps.liroocapstone.shop');

      // 새로운 메시지를 받으면 messages state를 업데이트
      socket.current.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });
  
      const scrollToBottom = () => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      };
    
  useEffect(() => {
    adjustMessageContainer();
  }, [messages]);

  const adjustMessageContainer = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      scrollToBottom();
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/chat/${productId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('채팅 메시지를 가져오는 데 실패했습니다.', error);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      try {
        const response = await fetch(`https://ec2caps.liroocapstone.shop/chat/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newMessage, sender: userId, productId: productId }),
        });
        if (response.ok) {
          // 웹 소켓을 통해 새로운 메시지 전송
          socket.current.emit('sendMessage', { text: newMessage, sender: userId });
          
          setNewMessage('');
        } else {
          console.error('메시지를 전송하는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('메시지를 전송하는 데 실패했습니다.', error);
      }
    }
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
            className={`message ${message.sender === userId ? 'own-message' : 'other-message'}`}
            style={{ width: `${message.text.length * 20}px` }} // 텍스트 길이에 따라 박스 크기 조절
          >
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
  );
};

export default ChatComponent;