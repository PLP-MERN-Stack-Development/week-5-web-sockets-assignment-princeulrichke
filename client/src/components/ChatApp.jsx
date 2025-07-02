import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const { isConnected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setSelectedChat(null);
    setShowSidebar(true);
  };

  if (!isConnected) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-whatsapp-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary">Connecting to WhatsApp Web...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-primary overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-50' : 'relative'}
        ${showSidebar ? 'block' : 'hidden'}
        ${isMobile ? 'w-full' : 'w-80'}
        bg-secondary border-r border-light
        transition-all duration-300
      `}>
        <Sidebar 
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
          isMobile={isMobile}
        />
      </div>

      {/* Chat Window */}
      <div className={`
        flex-1 flex flex-col
        ${isMobile && showSidebar ? 'hidden' : 'block'}
      `}>
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat}
            onBack={handleBackToSidebar}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-chat">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-32 h-32 mx-auto mb-8 opacity-10">
                <svg viewBox="0 0 303 172" className="w-full h-full">
                  <defs>
                    <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity=".05"/>
                      <stop offset="100%" stopColor="currentColor" stopOpacity=".1"/>
                    </linearGradient>
                  </defs>
                  <g fill="none" fillRule="evenodd">
                    <g fill="url(#a)" transform="translate(1 1)">
                      <path d="m101.843 118.687c-1.335-5.367-8.986-8.351-17.106-6.672-8.12 1.678-13.265 7.776-11.497 13.634 1.768 5.857 10.176 8.424 18.784 5.736 8.608-2.688 11.154-7.331 9.819-12.698z"/>
                      <path d="m116.129 137.773c-1.678-6.745-11.297-10.495-21.493-8.379-10.196 2.107-16.667 9.771-14.459 17.124 2.222 7.396 12.788 10.584 23.642 7.208 10.854-3.404 14.007-9.208 12.31-15.953z"/>
                      <ellipse cx="70.743" cy="101.51" rx="6.906" ry="12.906" transform="rotate(-18 70.743 101.51)"/>
                      <path d="m17.578 49.815c-1.335-5.367-8.986-8.351-17.106-6.672-8.12 1.678-13.265 7.776-11.497 13.634 1.768 5.857 10.176 8.424 18.784 5.736 8.608-2.688 11.154-7.331 9.819-12.698z"/>
                      <path d="m31.864 68.901c-1.678-6.745-11.297-10.495-21.493-8.379-10.196 2.107-16.667 9.771-14.459 17.124 2.222 7.396 12.788 10.584 23.642 7.208 10.854-3.404 14.007-9.208 12.31-15.953z"/>
                      <ellipse cx="234.738" cy="100.511" rx="12.906" ry="6.906" transform="rotate(72 234.738 100.511)"/>
                      <path d="m253.064 88.12c5.367-1.335 8.351-8.986 6.672-17.106-1.678-8.12-7.776-13.265-13.634-11.497-5.857 1.768-8.424 10.176-5.736 18.784 2.688 8.608 7.331 11.154 12.698 9.819z"/>
                      <path d="m272.15 102.406c6.745-1.678 10.495-11.297 8.379-21.493-2.107-10.196-9.771-16.667-17.124-14.459-7.396 2.222-10.584 12.788-7.208 23.642 3.404 10.854 9.208 14.007 15.953 12.31z"/>
                    </g>
                  </g>
                </svg>
              </div>
              <h2 className="text-3xl font-light text-primary mb-4">
                WhatsApp Web
              </h2>
              <p className="text-secondary text-sm leading-relaxed">
                Send and receive messages without keeping your phone online.<br/>
                Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="mt-8 pt-8 border-t border-light">
                <p className="text-xs text-tertiary">
                  🔒 Your personal messages are end-to-end encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
