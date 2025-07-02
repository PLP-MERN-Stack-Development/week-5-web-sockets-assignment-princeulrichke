import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { socket } from '../socket/socket';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      // Connect to socket
      socket.connect();
      socket.emit('user_join', user);

      // Set up event listeners
      const handleConnect = () => {
        setIsConnected(true);
        toast.success('Connected to chat');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        toast.error('Disconnected from chat');
      };

      const handleReceiveMessage = (message) => {
        setMessages(prev => [...prev, message]);
        
        // Show notification if message is not from current user
        if (message.senderId !== user.id && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`New message from ${message.sender}`, {
              body: message.text,
              icon: message.avatar,
              tag: 'chat-message'
            });
          }
        }
        
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // Ignore errors if sound can't play
      };

      const handleMessageHistory = (messageHistory) => {
        setMessages(messageHistory);
      };

      const handleUserList = (userList) => {
        setUsers(userList);
        setOnlineUsers(userList.filter(u => u.isOnline));
      };

      const handleUserJoined = (user) => {
        toast.success(`${user.username} joined the chat`);
      };

      const handleUserLeft = (user) => {
        toast(`${user.username} left the chat`, { icon: '👋' });
      };

      const handleTypingUsers = ({ room, users: typingUsersList }) => {
        if (room === currentRoom) {
          setTypingUsers(typingUsersList);
        }
      };

      const handlePrivateMessage = (message) => {
        setMessages(prev => [...prev, message]);
        toast.success(`Private message from ${message.sender}`);
      };

      const handleMessageDelivered = ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        ));
      };

      const handleMessageRead = ({ messageId, readBy }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read', readBy } : msg
        ));
      };

      const handleMessageReaction = ({ messageId, reactions }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, reactions } : msg
        ));
      };

      // Register event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('receive_message', handleReceiveMessage);
      socket.on('message_history', handleMessageHistory);
      socket.on('user_list', handleUserList);
      socket.on('user_joined', handleUserJoined);
      socket.on('user_left', handleUserLeft);
      socket.on('typing_users', handleTypingUsers);
      socket.on('private_message', handlePrivateMessage);
      socket.on('message_delivered', handleMessageDelivered);
      socket.on('message_read', handleMessageRead);
      socket.on('message_reaction', handleMessageReaction);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('receive_message', handleReceiveMessage);
        socket.off('message_history', handleMessageHistory);
        socket.off('user_list', handleUserList);
        socket.off('user_joined', handleUserJoined);
        socket.off('user_left', handleUserLeft);
        socket.off('typing_users', handleTypingUsers);
        socket.off('private_message', handlePrivateMessage);
        socket.off('message_delivered', handleMessageDelivered);
        socket.off('message_read', handleMessageRead);
        socket.off('message_reaction', handleMessageReaction);
        socket.disconnect();
      };
    }
  }, [user, currentRoom]);

  const sendMessage = (message, type = 'text', fileUrl = null, fileName = null) => {
    if (!message.trim() && !fileUrl) return;

    const messageData = {
      message: message.trim(),
      room: currentRoom,
      type,
      fileUrl,
      fileName
    };

    socket.emit('send_message', messageData);
  };

  const sendPrivateMessage = (to, message, type = 'text', fileUrl = null, fileName = null) => {
    if (!message.trim() && !fileUrl) return;

    socket.emit('private_message', {
      to,
      message: message.trim(),
      type,
      fileUrl,
      fileName
    });
  };

  const setTyping = (isTyping) => {
    socket.emit('typing', { isTyping, room: currentRoom });
  };

  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, reaction });
  };

  const markMessageAsRead = (messageId) => {
    socket.emit('message_read', { messageId });
  };

  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
    setCurrentRoom(roomId);
  };

  const leaveRoom = (roomId) => {
    socket.emit('leave_room', roomId);
  };

  const value = {
    isConnected,
    messages,
    users,
    typingUsers,
    currentRoom,
    unreadCount,
    onlineUsers,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    markMessageAsRead,
    joinRoom,
    leaveRoom,
    setCurrentRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
