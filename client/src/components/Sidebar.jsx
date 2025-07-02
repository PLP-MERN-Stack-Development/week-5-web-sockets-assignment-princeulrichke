import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  MoreVertical, 
  Users, 
  Settings,
  Moon,
  Sun,
  User,
  LogOut,
  UserPlus
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/dateUtils';

const Sidebar = ({ onChatSelect, selectedChat, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
  
  const { users, messages, onlineUsers } = useSocket();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Filter users and create chat list
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get last message for each user
  const getUserLastMessage = (userId) => {
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || 
      (msg.recipient === userId && msg.senderId === user?.id)
    );
    return userMessages[userMessages.length - 1];
  };

  // Get unread count for each user
  const getUnreadCount = (userId) => {
    return messages.filter(msg => 
      msg.senderId === userId && 
      msg.status !== 'read' && 
      msg.senderId !== user?.id
    ).length;
  };

  const handleUserClick = (selectedUser) => {
    onChatSelect({
      id: selectedUser.id,
      name: selectedUser.username,
      avatar: selectedUser.avatar,
      isOnline: selectedUser.isOnline,
      lastSeen: selectedUser.lastSeen,
      type: 'private'
    });
  };

  const handleGroupChatClick = () => {
    onChatSelect({
      id: 'general',
      name: 'General Chat',
      avatar: null,
      isOnline: true,
      type: 'group',
      memberCount: users.length
    });
  };

  return (
    <div className="h-full flex flex-col bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-tertiary border-b border-light">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-medium text-primary">{user?.username}</h2>
            <p className="text-xs text-secondary">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'chats' ? 'users' : 'chats')}
            className="p-2 hover:bg-hover rounded-full transition-colors"
          >
            {activeTab === 'chats' ? <Users size={20} /> : <MessageCircle size={20} />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-hover rounded-full transition-colors text-secondary"
            >
              <MoreVertical size={20} />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-12 bg-secondary border border-light rounded-lg shadow-lg py-2 w-48 z-10">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-hover transition-colors"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                <button
                  onClick={() => {
                    setShowSettings(false);
                    // Handle settings
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-hover transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <hr className="my-2 border-light" />
                
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-hover transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-light">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tertiary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-light">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chats' 
              ? 'text-whatsapp-green border-b-2 border-whatsapp-green' 
              : 'text-secondary hover:text-primary'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'users' 
              ? 'text-whatsapp-green border-b-2 border-whatsapp-green' 
              : 'text-secondary hover:text-primary'
          }`}
        >
          Users ({users.length - 1})
        </button>
      </div>

      {/* Chat/User List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          <div>
            {/* Group Chat */}
            <div
              onClick={handleGroupChatClick}
              className={`flex items-center gap-3 p-4 hover:bg-hover cursor-pointer transition-colors ${
                selectedChat?.id === 'general' ? 'bg-selected' : ''
              }`}
            >
              <div className="w-12 h-12 bg-whatsapp-green rounded-full flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-primary truncate">General Chat</h3>
                  <span className="text-xs text-tertiary">
                    {messages.filter(m => m.room === 'general').length > 0 && 
                     formatTime(messages.filter(m => m.room === 'general').slice(-1)[0]?.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-secondary truncate">
                  {messages.filter(m => m.room === 'general').slice(-1)[0]?.text || 'No messages yet'}
                </p>
                <p className="text-xs text-tertiary mt-1">
                  {users.length} member{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Private Chats */}
            {filteredUsers.map((chatUser) => {
              const lastMessage = getUserLastMessage(chatUser.id);
              const unreadCount = getUnreadCount(chatUser.id);
              
              return (
                <div
                  key={chatUser.id}
                  onClick={() => handleUserClick(chatUser)}
                  className={`flex items-center gap-3 p-4 hover:bg-hover cursor-pointer transition-colors ${
                    selectedChat?.id === chatUser.id ? 'bg-selected' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={chatUser.avatar}
                      alt={chatUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chatUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online rounded-full ring-2 ring-secondary"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-primary truncate">{chatUser.username}</h3>
                      {lastMessage && (
                        <span className="text-xs text-tertiary">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary truncate">
                        {lastMessage ? (
                          lastMessage.senderId === user?.id ? `You: ${lastMessage.text}` : lastMessage.text
                        ) : (
                          'Start a conversation'
                        )}
                      </p>
                      
                      {unreadCount > 0 && (
                        <span className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-tertiary mt-1">
                      {chatUser.isOnline ? 'Online' : `Last seen ${formatTime(chatUser.lastSeen)}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {/* Online Users */}
            <div className="p-4 border-b border-light">
              <h4 className="text-sm font-medium text-secondary mb-3">
                Online ({onlineUsers.length})
              </h4>
              {onlineUsers.filter(u => u.id !== user?.id).map((onlineUser) => (
                <div
                  key={onlineUser.id}
                  onClick={() => handleUserClick(onlineUser)}
                  className="flex items-center gap-3 p-2 hover:bg-hover rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={onlineUser.avatar}
                      alt={onlineUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online rounded-full ring-2 ring-secondary"></div>
                  </div>
                  <div>
                    <h5 className="font-medium text-primary">{onlineUser.username}</h5>
                    <p className="text-xs text-secondary">Online</p>
                  </div>
                </div>
              ))}
            </div>

            {/* All Users */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-secondary mb-3">
                All Users
              </h4>
              {filteredUsers.map((allUser) => (
                <div
                  key={allUser.id}
                  onClick={() => handleUserClick(allUser)}
                  className="flex items-center gap-3 p-2 hover:bg-hover rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={allUser.avatar}
                      alt={allUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {allUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online rounded-full ring-2 ring-secondary"></div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-primary">{allUser.username}</h5>
                    <p className="text-xs text-secondary">
                      {allUser.isOnline ? 'Online' : `Last seen ${formatTime(allUser.lastSeen)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'chats' && filteredUsers.length === 0) || 
          (activeTab === 'users' && filteredUsers.length === 0)) && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mb-4">
              {activeTab === 'chats' ? (
                <MessageCircle size={32} className="text-tertiary" />
              ) : (
                <UserPlus size={32} className="text-tertiary" />
              )}
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              {activeTab === 'chats' ? 'No chats yet' : 'No users found'}
            </h3>
            <p className="text-secondary text-sm">
              {activeTab === 'chats' 
                ? 'Start a conversation with someone from the Users tab'
                : searchTerm 
                  ? 'Try searching for a different name'
                  : 'No other users are currently online'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
