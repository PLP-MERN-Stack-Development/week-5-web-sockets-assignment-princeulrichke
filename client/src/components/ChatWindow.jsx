import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send,
  Users,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageList from './MessageList';
import EmojiPicker from 'emoji-picker-react';
import { formatTime, formatDate, isToday, isYesterday } from '../utils/dateUtils';

const ChatWindow = ({ chat, onBack, isMobile }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const messageInputRef = useRef();
  const chatMessagesRef = useRef();
  const typingTimeoutRef = useRef();
  
  const { 
    messages, 
    users, 
    typingUsers, 
    sendMessage, 
    sendPrivateMessage, 
    setTyping,
    addReaction,
    markMessageAsRead,
    currentRoom,
    setCurrentRoom
  } = useSocket();
  
  const { user } = useAuth();

  // Filter messages for current chat
  const chatMessages = messages.filter(msg => {
    if (chat.type === 'group') {
      return msg.room === chat.id || msg.room === 'general';
    } else {
      return (msg.senderId === chat.id && msg.recipient === user?.id) ||
             (msg.senderId === user?.id && msg.recipient === chat.id) ||
             (msg.private && (msg.senderId === chat.id || msg.recipient === chat.id));
    }
  });

  // Group messages by date
  const groupedMessages = chatMessages.reduce((groups, message) => {
    const date = new Date(message.timestamp);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  // Handle room change
  useEffect(() => {
    if (chat.type === 'group' && currentRoom !== chat.id) {
      setCurrentRoom(chat.id);
    }
  }, [chat, currentRoom, setCurrentRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      setTyping(false);
    }

    // Clear typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(false);
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, setTyping]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    chatMessages
      .filter(msg => msg.senderId !== user?.id && msg.status !== 'read')
      .forEach(msg => markMessageAsRead(msg.id));
  }, [chatMessages, user?.id, markMessageAsRead]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (chat.type === 'group') {
      sendMessage(message);
    } else {
      sendPrivateMessage(chat.id, message);
    }

    setMessage('');
    setIsTyping(false);
    setTyping(false);
    messageInputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Handle file upload logic here
    console.log('File selected:', file);
    // You can implement file upload to server here
  };

  const getTypingText = () => {
    if (chat.type === 'group') {
      if (typingUsers.length === 1) {
        return `${typingUsers[0]} is typing...`;
      } else if (typingUsers.length === 2) {
        return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
      } else if (typingUsers.length > 2) {
        return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
      }
    } else {
      return typingUsers.includes(chat.name) ? `${chat.name} is typing...` : '';
    }
    return '';
  };

  const getDateLabel = (dateKey) => {
    const date = new Date(dateKey);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDate(date);
  };

  return (
    <div className="h-full flex flex-col bg-chat">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-secondary border-b border-light">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-hover rounded-full transition-colors -ml-2"
            >
              <ArrowLeft size={20} className="text-primary" />
            </button>
          )}
          
          {chat.type === 'group' ? (
            <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
          ) : (
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-primary truncate">{chat.name}</h2>
            <p className="text-sm text-secondary">
              {chat.type === 'group' ? (
                `${users.length} members`
              ) : (
                chat.isOnline ? (
                  getTypingText() || 'Online'
                ) : (
                  `Last seen ${formatTime(chat.lastSeen)}`
                )
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-hover rounded-full transition-colors text-secondary"
          >
            <Search size={20} />
          </button>
          
          {chat.type !== 'group' && (
            <>
              <button className="p-2 hover:bg-hover rounded-full transition-colors text-secondary">
                <Phone size={20} />
              </button>
              <button className="p-2 hover:bg-hover rounded-full transition-colors text-secondary">
                <Video size={20} />
              </button>
            </>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowChatInfo(!showChatInfo)}
              className="p-2 hover:bg-hover rounded-full transition-colors text-secondary"
            >
              <MoreVertical size={20} />
            </button>
            
            {showChatInfo && (
              <div className="absolute right-0 top-12 bg-secondary border border-light rounded-lg shadow-lg py-2 w-48 z-10">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-hover transition-colors"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                </button>
                
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-hover transition-colors">
                  <Search size={16} />
                  Search messages
                </button>
                
                {chat.type === 'group' && (
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-hover transition-colors">
                    <Users size={16} />
                    Group info
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 bg-secondary border-b border-light">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-tertiary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-whatsapp-green text-sm"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={chatMessagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(0.5) rotate(0)'%3e%3crect x='0' y='0' width='100%25' height='100%25' fill='%23f0f2f510'/%3e%3cpath d='m10 10-2-2h4z' stroke-width='0.5' stroke='%23ffffff08' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23a)'/%3e%3c/svg%3e")`,
        }}
      >
        {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
          <div key={dateKey}>
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <span className="bg-secondary px-3 py-1 rounded-lg text-xs text-tertiary shadow-sm">
                {getDateLabel(dateKey)}
              </span>
            </div>
            
            {/* Messages for this date */}
            <MessageList 
              messages={dayMessages}
              currentUser={user}
              onReaction={addReaction}
              searchTerm={searchTerm}
            />
          </div>
        ))}
        
        {/* Typing indicator */}
        {getTypingText() && (
          <div className="flex items-center gap-2 text-secondary text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{getTypingText()}</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-secondary border-t border-light">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 bg-tertiary rounded-lg px-3 py-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-tertiary hover:text-primary transition-colors"
              >
                <Smile size={20} />
              </button>
              
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-transparent text-primary placeholder-tertiary focus:outline-none"
                autoFocus={!isMobile}
              />
              
              <label className="text-tertiary hover:text-primary transition-colors cursor-pointer">
                <Paperclip size={20} />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,document/*"
                />
              </label>
            </div>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-14 right-0 z-20">
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  theme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="w-12 h-12 bg-whatsapp-green hover:bg-whatsapp-green-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
