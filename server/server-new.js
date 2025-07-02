// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// MongoDB imports
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');
const Room = require('./models/Room');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5175',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Store connected users, messages, and rooms (fallback for no MongoDB)
const users = {};
const messages = [];
const rooms = { general: { name: 'General', messages: [] } };
const typingUsers = {};
const userStatus = {};

// MongoDB connection flag
let isDBConnected = false;

// Connect to MongoDB
connectDB().then((connected) => {
  isDBConnected = connected;
  if (connected) {
    console.log('💾 Using MongoDB for data persistence');
    initializeDefaultRoom();
  } else {
    console.log('⚠️  Using in-memory storage (data will be lost on restart)');
  }
});

// Initialize default room in MongoDB
const initializeDefaultRoom = async () => {
  try {
    const generalRoom = await Room.findOne({ name: 'General' });
    if (!generalRoom) {
      await Room.create({
        name: 'General',
        description: 'Default chat room for everyone',
        type: 'public',
        createdBy: null
      });
      console.log('✅ Default "General" room created');
    }
  } catch (error) {
    console.error('❌ Error initializing default room:', error);
  }
};

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', async (userData) => {
    try {
      const { username, avatar } = userData;
      
      if (isDBConnected) {
        // MongoDB: Find or create user
        let user = await User.findOne({ username });
        
        if (!user) {
          user = await User.create({
            username,
            avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
            isOnline: true,
            socketId: socket.id,
            status: 'online'
          });
        } else {
          // Update existing user
          user.isOnline = true;
          user.socketId = socket.id;
          user.status = 'online';
          user.lastSeen = new Date();
          await user.save();
        }
        
        users[socket.id] = {
          _id: user._id,
          username: user.username,
          id: socket.id,
          avatar: user.avatar,
          lastSeen: user.lastSeen,
          isOnline: true
        };
        
        // Send recent messages from MongoDB
        const recentMessages = await Message.find({ room: 'general' })
          .populate('sender', 'username avatar')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        
        const formattedMessages = recentMessages.reverse().map(msg => ({
          id: msg._id,
          text: msg.text,
          sender: msg.senderName,
          senderId: msg.sender._id,
          avatar: msg.sender.avatar,
          timestamp: msg.createdAt,
          type: msg.type,
          room: msg.room,
          status: msg.status,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          reactions: msg.reactions,
          private: msg.isPrivate
        }));
        
        socket.emit('message_history', formattedMessages);
        
      } else {
        // Fallback: In-memory storage
        users[socket.id] = { 
          username, 
          id: socket.id, 
          avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
          lastSeen: new Date(),
          isOnline: true
        };
        
        socket.emit('message_history', messages);
      }
      
      userStatus[socket.id] = 'online';
      
      // Join general room by default
      socket.join('general');
      
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username, id: socket.id });
      
      console.log(`${username} joined the chat`);
      
    } catch (error) {
      console.error('❌ Error handling user join:', error);
      socket.emit('error', 'Failed to join chat');
    }
  });

  // Handle joining rooms
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { name: roomId, messages: [] };
    }
    socket.emit('room_messages', rooms[roomId].messages);
  });

  // Handle leaving rooms
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  // Handle chat messages
  socket.on('send_message', async (messageData) => {
    try {
      const user = users[socket.id];
      if (!user) return;

      const messageObj = {
        text: messageData.message,
        sender: user.username,
        senderId: user._id || socket.id,
        avatar: user.avatar,
        timestamp: new Date(),
        type: messageData.type || 'text',
        room: messageData.room || 'general',
        status: 'sent',
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        reactions: {}
      };

      if (isDBConnected) {
        // Save to MongoDB
        const dbMessage = await Message.create({
          text: messageData.message,
          sender: user._id,
          senderName: user.username,
          room: messageData.room || 'general',
          type: messageData.type || 'text',
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          status: 'sent'
        });
        
        messageObj.id = dbMessage._id;
        
        // Update room's last activity
        await Room.updateOne(
          { name: messageData.room || 'General' },
          { 
            lastMessage: dbMessage._id,
            lastActivity: new Date()
          }
        );
      } else {
        // Fallback: In-memory storage
        messageObj.id = uuidv4();
        messages.push(messageObj);
        
        // Store in room if specified
        if (rooms[messageObj.room]) {
          rooms[messageObj.room].messages.push(messageObj);
        }
        
        // Limit stored messages to prevent memory issues
        if (messages.length > 1000) {
          messages.shift();
        }
      }
      
      // Broadcast message to all users in the room
      if (messageObj.room === 'general') {
        io.emit('receive_message', messageObj);
      } else {
        io.to(messageObj.room).emit('receive_message', messageObj);
      }
      
      // Send delivery confirmation
      socket.emit('message_delivered', { messageId: messageObj.id });
      
      console.log(`Message from ${user.username}: ${messageObj.text}`);
      
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message, type, fileUrl, fileName }) => {
    const user = users[socket.id];
    if (!user) return;

    const privateMessage = {
      id: uuidv4(),
      text: message,
      sender: user.username,
      senderId: socket.id,
      avatar: user.avatar,
      recipient: to,
      timestamp: new Date(),
      type: type || 'text',
      status: 'sent',
      fileUrl: fileUrl,
      fileName: fileName,
      private: true,
      reactions: {}
    };
    
    // Send to recipient
    io.to(to).emit('private_message', privateMessage);
    
    // Send back to sender for confirmation
    socket.emit('private_message', privateMessage);
    
    messages.push(privateMessage);
  });

  // Handle typing indicators
  socket.on('typing', ({ isTyping, room }) => {
    const user = users[socket.id];
    if (!user) return;

    if (isTyping) {
      if (!typingUsers[room]) typingUsers[room] = {};
      typingUsers[room][socket.id] = user.username;
    } else {
      if (typingUsers[room]) {
        delete typingUsers[room][socket.id];
        if (Object.keys(typingUsers[room]).length === 0) {
          delete typingUsers[room];
        }
      }
    }
    
    socket.to(room).emit('typing_users', {
      room,
      users: typingUsers[room] ? Object.values(typingUsers[room]) : []
    });
  });

  // Handle message reactions
  socket.on('add_reaction', async ({ messageId, reaction }) => {
    try {
      const user = users[socket.id];
      if (!user) return;

      if (isDBConnected) {
        // Update reaction in MongoDB
        const message = await Message.findById(messageId);
        if (message) {
          // Remove user's previous reaction
          message.reactions = message.reactions.filter(r => r.user.toString() !== (user._id || socket.id).toString());
          
          // Add new reaction
          message.reactions.push({
            user: user._id || socket.id,
            username: user.username,
            emoji: reaction
          });
          
          await message.save();
          
          // Convert to object format for client
          const reactionsObj = {};
          message.reactions.forEach(r => {
            if (!reactionsObj[r.emoji]) reactionsObj[r.emoji] = [];
            reactionsObj[r.emoji].push({
              id: r.user,
              username: r.username
            });
          });
          
          io.emit('message_reaction', { messageId, reactions: reactionsObj });
        }
      } else {
        // Fallback: In-memory storage
        const message = messages.find(m => m.id === messageId);
        if (message) {
          if (!message.reactions) message.reactions = {};
          if (!message.reactions[reaction]) message.reactions[reaction] = [];
          
          // Remove user's previous reaction to this message
          Object.keys(message.reactions).forEach(r => {
            message.reactions[r] = message.reactions[r].filter(u => u.id !== socket.id);
            if (message.reactions[r].length === 0) delete message.reactions[r];
          });
          
          // Add new reaction
          message.reactions[reaction] = message.reactions[reaction] || [];
          message.reactions[reaction].push({
            id: socket.id,
            username: user.username
          });
          
          io.emit('message_reaction', { messageId, reactions: message.reactions });
        }
      }
    } catch (error) {
      console.error('❌ Error handling reaction:', error);
    }
  });

  // Handle message read receipts
  socket.on('message_read', ({ messageId }) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.senderId !== socket.id) {
      io.to(message.senderId).emit('message_read', { 
        messageId, 
        readBy: users[socket.id]?.username 
      });
    }
  });

  // Handle user status updates
  socket.on('update_status', (status) => {
    if (users[socket.id]) {
      users[socket.id].status = status;
      userStatus[socket.id] = status;
      io.emit('user_status_update', { 
        userId: socket.id, 
        status,
        username: users[socket.id].username
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const user = users[socket.id];
      if (user) {
        if (isDBConnected && user._id) {
          // Update user status in MongoDB
          await User.findByIdAndUpdate(user._id, {
            isOnline: false,
            lastSeen: new Date(),
            status: 'offline',
            socketId: null
          });
        }
        
        user.isOnline = false;
        user.lastSeen = new Date();
        userStatus[socket.id] = 'offline';
        
        // Clean up typing indicators
        Object.keys(typingUsers).forEach(room => {
          if (typingUsers[room] && typingUsers[room][socket.id]) {
            delete typingUsers[room][socket.id];
            if (Object.keys(typingUsers[room]).length === 0) {
              delete typingUsers[room];
            }
          }
        });
        
        io.emit('user_left', user);
        io.emit('user_list', Object.values(users));
        
        console.log(`${user.username} disconnected`);
        delete users[socket.id];
      }
    } catch (error) {
      console.error('❌ Error handling disconnect:', error);
    }
  });

  // Handle reconnection
  socket.on('reconnect_user', (userData) => {
    if (users[socket.id]) {
      users[socket.id].isOnline = true;
      users[socket.id].lastSeen = new Date();
      userStatus[socket.id] = 'online';
      io.emit('user_reconnected', users[socket.id]);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    connectedUsers: Object.keys(users).length,
    totalMessages: messages.length,
    database: isDBConnected ? 'MongoDB' : 'In-Memory'
  });
});

// Get server stats
app.get('/stats', async (req, res) => {
  try {
    if (isDBConnected) {
      const [userCount, messageCount, roomCount] = await Promise.all([
        User.countDocuments(),
        Message.countDocuments(),
        Room.countDocuments()
      ]);
      
      const onlineUsers = await User.countDocuments({ isOnline: true });
      
      res.json({
        connectedUsers: Object.keys(users).length,
        totalUsers: userCount,
        onlineUsers,
        totalMessages: messageCount,
        rooms: roomCount,
        uptime: process.uptime(),
        database: 'MongoDB',
        dbConnected: true
      });
    } else {
      res.json({
        connectedUsers: Object.keys(users).length,
        totalMessages: messages.length,
        rooms: Object.keys(rooms).length,
        uptime: process.uptime(),
        database: 'In-Memory',
        dbConnected: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get chat history for a room
app.get('/api/messages/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (isDBConnected) {
      const messages = await Message.find({ room })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      
      const formattedMessages = messages.reverse().map(msg => ({
        id: msg._id,
        text: msg.text,
        sender: msg.senderName,
        senderId: msg.sender._id,
        avatar: msg.sender.avatar,
        timestamp: msg.createdAt,
        type: msg.type,
        room: msg.room,
        status: msg.status,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        reactions: msg.reactions
      }));
      
      res.json(formattedMessages);
    } else {
      const roomMessages = messages.filter(msg => msg.room === room);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      res.json(roomMessages.slice(startIndex, endIndex));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get user list
app.get('/api/users', async (req, res) => {
  try {
    if (isDBConnected) {
      const users = await User.find({}, 'username avatar isOnline lastSeen status')
        .sort({ lastSeen: -1 })
        .lean();
      
      res.json(users);
    } else {
      res.json(Object.values(users));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp-style Chat Server is ready!`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/stats`);
  console.log(`📚 API endpoints:`);
  console.log(`  - GET /api/messages/:room - Get chat history`);
  console.log(`  - GET /api/users - Get user list`);
  console.log(`  - POST /upload - Upload files`);
  
  setTimeout(() => {
    if (isDBConnected) {
      console.log(`💾 Database: MongoDB (persistent storage)`);
    } else {
      console.log(`⚠️  Database: In-Memory (data will be lost on restart)`);
      console.log(`💡 To use MongoDB: Start MongoDB service and check MONGODB_URI in .env`);
    }
  }, 1000);
});

module.exports = { app, server, io };
