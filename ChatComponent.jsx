import React, { useState, useEffect, useRef } from 'react';
import '../../styles/chat.css';
import io from 'socket.io-client'; // 웹 소켓 클라이언트 라이브러리

const ChatComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const productId = sessionStorage.getItem('productId');
  const messageContainerRef = useRef(null);
  const socket = useRef(null); // 웹 소켓 연결 상태를 저장하기 위한 useRef

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // 웹 소켓 연결
    socket.current = io('http://localhost:4001/', {
      query: { productId } // productId를 서버에 전달
    });

    // 새로운 메시지를 받으면 messages state를 업데이트
    socket.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    // 클라이언트가 다시 연결되었을 때의 처리
    socket.current.on('connect', () => {
      console.log('Client reconnected');
      fetchMessages(); // 연결이 다시 성공하면 최근 채팅 기록을 다시 요청
    });

    // 컴포넌트가 언마운트될 때 웹 소켓 연결 해제
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
    // 서버로부터 메시지를 받았을 때의 처리
    socket.current.on('chatHistory', (chatHistory) => {
      setMessages(chatHistory);
      scrollToBottom(); // 최근 채팅 기록으로 스크롤 이동
    });
  }, []); // 한 번만 수행되어야 함

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:4001/messages/${productId}`);
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
      // 웹 소켓을 통해 새로운 메시지 전송
      socket.current.emit('sendMessage', { text: newMessage, sender: userId, productId });

      // 메시지 전송 후 입력 필드 리셋
      setNewMessage('');

      // 성공적으로 메시지를 서버로 전송한 후에 로그를 출력합니다.
      console.log('메시지를 서버로 전송했습니다:', newMessage);
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
            className={`message-container ${message.sender === userId ? 'own-message' : 'other-message'}`}
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