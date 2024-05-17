import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅 추가

import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatComponent = ({ route }) => {
  const { productId, userType } = route.params;

  const [userId, setUserId] = useState(null);
  const receiver = userType === 'seller' ? 'buyer' : 'seller';

  const messageContainerRef = useRef(null);
  const socket = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigation = useNavigation(); // useNavigation 훅으로 navigation 객체 생성

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);

        if (storedUserId && productId && receiver) {
          socket.current = io('http://172.30.1.19:4001/', {
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
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, [productId, receiver]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollToEnd({ animated: true });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://172.30.1.19:4001/messages/${productId}`, {
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

  const handleMessageSubmit = () => {
    if (newMessage.trim() !== '') {
      if (socket.current) {
        socket.current.emit('sendMessage', { text: newMessage, sender: userId, receiver, productId });
      } else {
        console.error('Socket connection not established');
      }
      setNewMessage('');
    }
  };


  const handlePayment = () => {
    // 결제 페이지로 이동하면서 상품 정보를 URL 쿼리 파라미터로 전달
    navigation.navigate('Sandbox', { productId, userId });
    console.log('결제 처리 로직을 추가하세요.');
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={messageContainerRef} style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageContainer, message.sender === userId ? styles.ownMessage : styles.otherMessage]}>
            <Text style={styles.messageSender}>{message.sender === userId ? '나' : message.sender}</Text>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="메시지를 입력하세요..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleMessageSubmit}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handlePayment}>
          <Text style={styles.sendButtonText}>결제하기</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 90,
    flex: 1,
    padding: 10,
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',

  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    color: 'white'
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatComponent;
