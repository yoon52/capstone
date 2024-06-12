require('dotenv').config(); // 환경 변수 로드
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const socketio = require('socket.io');
const { app, pool } = require('./db');

app.use(express.json());
app.use(cors());

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

const server = https.createServer(options, app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('sendMessage', async (message) => {
    try {
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO messages (productId, text, sender, receiver, createdAt) VALUES (?, ?, ?, ?, NOW())', [message.productId, message.text, message.sender, message.receiver]);
      connection.release();

      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 채팅 메시지를 가져오는 엔드포인트 구현
app.get('/messages/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const query = 'SELECT * FROM messages WHERE productId = ?';
    const [messages] = await pool.query(query, [productId]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자 유형 가져오기
app.get('/userType', async (req, res) => {
  const userId = req.query.user_id;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT userType FROM users WHERE id = ?', [userId]);
    connection.release();

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ userType: rows[0].userType });
    }
  } catch (error) {
    console.error('Error fetching user type:', error);
    res.status(500).json({ error: 'Failed to fetch user type' });
  }
});

// 채팅방 목록 가져오기 API 엔드포인트
app.get('/chatRooms', async (req, res) => {
  const { userId, productId } = req.headers;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM chat_rooms WHERE user_id = ? AND product_id = ?', [userId, productId]);
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 새로운 채팅방 생성 및 이미 존재하는 채팅방 확인
app.post('/api/chat-rooms', async (req, res) => {
  const { productId, userId } = req.body;

  try {
    const [existingRows] = await pool.query('SELECT * FROM chat_rooms WHERE product_id = ? AND user_id = ?', [productId, userId]);
    if (existingRows.length > 0) {
      res.status(200).json(existingRows[0]);
      return;
    }

    const insertQuery = 'INSERT INTO chat_rooms (product_id, user_id) VALUES (?, ?)';
    const [result] = await pool.query(insertQuery, [productId, userId]);

    const newChatRoomId = result.insertId;
    res.status(201).json({ id: newChatRoomId });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 사용자가 입장한 채팅방 목록을 가져오는 엔드포인트
app.get('/myChatRooms', async (req, res) => {
  const userId = req.headers['user_id'];

  try {
    const [rows] = await pool.query(
      'SELECT chat_rooms.id, chat_rooms.product_id, products.name AS product_name FROM chat_rooms JOIN products ON chat_rooms.product_id = products.id WHERE chat_rooms.user_id = ?',
      [userId]
    );

    const chatRooms = rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
    }));

    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
