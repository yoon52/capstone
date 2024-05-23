import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);

        if (storedUserId && productId && receiver) {
          socket.current = io('http://172.30.1.2:4001/', {
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

  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null; // 소켓 객체 초기화
      }
    };
  }, []);


  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollToEnd({ animated: true });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://172.30.1.2:4001/messages/${productId}`, {
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
    navigation.navigate('Sandbox', { productId, userId });
    console.log('Add payment logic here');
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={messageContainerRef} style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageContainer, message.sender === userId ? styles.ownMessage : styles.otherMessage]}>
          {message.sender !== userId && (
            <Image
              source={{ uri: 'https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png' }}
              style={styles.profileImage}
            />
          )}
          <View style={[styles.messageContent, message.sender === userId ? styles.ownMessageBackground : styles.otherMessageBackground]}>
            <Text style={styles.messageSender}>{message.sender === userId ? '나' : message.sender}</Text>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
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
    flex: 1,
    padding: 10,
    borderRadius: 20, // 컨테이너를 둥글게 만듦
    backgroundColor: '#F4F4F4', // 배경색 추가
    overflow: 'hidden', // 둥근 테두리가 넘치지 않도록 함
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: 10, // 메시지 텍스트의 둥근 테두리
    padding: 10, // 메시지 내용 간격 추가
  },
  ownMessageBackground: {
    backgroundColor: '#DCF8C6', // 사용자 메시지의 배경색
  },
  otherMessageBackground: {
    backgroundColor: '#E5E5EA', // 상대방 메시지의 배경색
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});

export default ChatComponent;
