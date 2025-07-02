import { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  MoreVertical, 
  Reply, 
  Copy, 
  Trash2,
  Heart,
  Laugh,
  Angry,
  Frown,
  ThumbsUp
} from 'lucide-react';
import { formatTime } from '../utils/dateUtils';

const MessageList = ({ messages, currentUser, onReaction, searchTerm }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(null);

  const reactions = [
    { emoji: '❤️', name: 'heart', icon: Heart },
    { emoji: '😂', name: 'laugh', icon: Laugh },
    { emoji: '😮', name: 'wow', icon: null },
    { emoji: '😢', name: 'sad', icon: Frown },
    { emoji: '😡', name: 'angry', icon: Angry },
    { emoji: '👍', name: 'like', icon: ThumbsUp }
  ];

  const handleReaction = (messageId, reaction) => {
    onReaction(messageId, reaction);
    setShowReactions(null);
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== currentUser?.id) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check size={16} className="text-tertiary" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-tertiary" />;
      case 'read':
        return <CheckCheck size={16} className="text-whatsapp-green" />;
      default:
        return null;
    }
  };

  const renderReactions = (reactions) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactions).map(([emoji, users]) => (
          <div
            key={emoji}
            className="flex items-center gap-1 bg-hover rounded-full px-2 py-1 text-xs"
            title={users.map(u => u.username).join(', ')}
          >
            <span>{emoji}</span>
            <span className="text-tertiary">{users.length}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUser?.id;
        const showAvatar = !isOwnMessage && (
          index === 0 || 
          messages[index - 1].senderId !== message.senderId
        );
        const showSender = !isOwnMessage && showAvatar && !message.private;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`flex gap-2 max-w-xs sm:max-w-md lg:max-w-lg ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {showAvatar && !isOwnMessage && (
                <img
                  src={message.avatar}
                  alt={message.sender}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                />
              )}
              
              {/* Message bubble */}
              <div className="relative">
                <div
                  className={`
                    relative px-3 py-2 rounded-lg shadow-sm
                    ${isOwnMessage 
                      ? 'bg-bubble-sent text-primary' 
                      : 'bg-bubble-received text-primary'
                    }
                  `}
                >
                  {/* Sender name */}
                  {showSender && (
                    <p className="text-xs font-medium text-whatsapp-green mb-1">
                      {message.sender}
                    </p>
                  )}
                  
                  {/* System message */}
                  {message.system ? (
                    <p className="text-center text-xs text-tertiary italic py-1">
                      {message.text}
                    </p>
                  ) : (
                    <>
                      {/* File/Image message */}
                      {message.type === 'file' && message.fileUrl && (
                        <div className="mb-2">
                          {message.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={message.fileUrl}
                              alt={message.fileName}
                              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-hover rounded-lg">
                              <div className="w-8 h-8 bg-whatsapp-green rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {message.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.fileName}</p>
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-whatsapp-green hover:underline"
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Text message */}
                      {message.text && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {highlightText(message.text, searchTerm)}
                        </p>
                      )}
                      
                      {/* Message metadata */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-tertiary">
                          {formatTime(message.timestamp)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                      
                      {/* Reactions */}
                      {renderReactions(message.reactions)}
                    </>
                  )}
                </div>
                
                {/* Message actions */}
                {!message.system && (
                  <div className={`
                    absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
                    opacity-0 group-hover:opacity-100 transition-opacity
                    flex items-center gap-1 bg-secondary rounded-lg shadow-lg p-1 z-10
                  `}>
                    {/* Reaction button */}
                    <button
                      onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      className="p-1 hover:bg-hover rounded text-tertiary hover:text-primary transition-colors"
                      title="Add reaction"
                    >
                      <Heart size={14} />
                    </button>
                    
                    {/* More actions */}
                    <button
                      onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                      className="p-1 hover:bg-hover rounded text-tertiary hover:text-primary transition-colors"
                      title="More actions"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                )}
                
                {/* Reaction picker */}
                {showReactions === message.id && (
                  <div className={`
                    absolute top-0 ${isOwnMessage ? 'right-0' : 'left-0'}
                    -translate-y-full mb-2 bg-secondary rounded-lg shadow-lg p-2 z-20
                    flex gap-1
                  `}>
                    {reactions.map((reaction) => (
                      <button
                        key={reaction.name}
                        onClick={() => handleReaction(message.id, reaction.emoji)}
                        className="p-2 hover:bg-hover rounded-lg transition-colors text-lg"
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Message menu */}
                {selectedMessage === message.id && (
                  <div className={`
                    absolute top-0 ${isOwnMessage ? 'right-0' : 'left-0'}
                    -translate-y-full mb-2 bg-secondary border border-light rounded-lg shadow-lg py-2 z-20
                    min-w-[150px]
                  `}>
                    <button
                      onClick={() => {
                        // Handle reply
                        setSelectedMessage(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-hover transition-colors"
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                    
                    <button
                      onClick={() => copyMessage(message.text)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-hover transition-colors"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    
                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          // Handle delete
                          setSelectedMessage(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-hover transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
