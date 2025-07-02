# 🚀 WhatsApp-Style Real-Time Chat Application

A modern, responsive real-time chat application built with Socket.io, React, and Express that replicates the WhatsApp Web experience with both light and dark themes.

![WhatsApp Chat Demo](https://img.shields.io/badge/Status-Complete-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7+-red.svg)

## ✨ Features Implemented

### 🎯 Core Features
- ✅ **Real-time messaging** using Socket.io
- ✅ **User authentication** (username-based)
- ✅ **Global chat room** for all users
- ✅ **Private messaging** between users
- ✅ **Online/offline status** indicators
- ✅ **Typing indicators** with real-time updates
- ✅ **Message timestamps** and delivery status
- ✅ **WhatsApp-style UI** (desktop & mobile responsive)

### 🎨 UI/UX Features
- ✅ **Dark/Light theme toggle** with persistent settings
- ✅ **WhatsApp Web design** - pixel-perfect replica
- ✅ **Mobile responsive** - WhatsApp mobile app styling
- ✅ **Smooth animations** and transitions
- ✅ **Message reactions** (❤️, 😂, 😮, 😢, 😡, 👍)
- ✅ **Emoji picker** integration
- ✅ **Message search** functionality
- ✅ **User avatars** with online status dots

### 🔔 Notification Features
- ✅ **Browser notifications** for new messages
- ✅ **Sound notifications** (when supported)
- ✅ **Unread message counts** in chat list
- ✅ **Join/leave notifications** with toast messages
- ✅ **Connection status** indicators

### 🚀 Advanced Features
- ✅ **Message reactions** with emoji support
- ✅ **Read receipts** (sent, delivered, read status)
- ✅ **Message delivery acknowledgment**
- ✅ **File sharing** support (images, documents)
- ✅ **Message copying** and context menus
- ✅ **Reconnection logic** for network failures
- ✅ **Group chat** with member count
- ✅ **User list** with online status

### 🛠️ Technical Features
- ✅ **Socket.io rooms** for chat organization
- ✅ **Message pagination** support
- ✅ **Memory management** (message limits)
- ✅ **Error handling** and loading states
- ✅ **Date grouping** for messages
- ✅ **Search highlighting** in messages

## 🏗️ Project Structure

```
whatsapp-chat/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   │   ├── whatsapp-icon.svg   # App icon
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── LoginPage.jsx   # Authentication page
│   │   │   ├── ChatApp.jsx     # Main chat layout
│   │   │   ├── Sidebar.jsx     # Chat list & user panel
│   │   │   ├── ChatWindow.jsx  # Message interface
│   │   │   └── MessageList.jsx # Message display
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx # User authentication
│   │   │   ├── ThemeContext.jsx# Theme management
│   │   │   └── SocketContext.jsx# Socket.io integration
│   │   ├── socket/             # Socket.io client setup
│   │   │   └── socket.js       # Connection & events
│   │   ├── utils/              # Utility functions
│   │   │   └── dateUtils.js    # Date formatting
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles & themes
│   ├── package.json            # Client dependencies
│   ├── vite.config.js          # Vite configuration
│   └── .env                    # Environment variables
├── server/                     # Node.js Backend
│   ├── public/uploads/         # File upload directory
│   ├── server.js               # Main server file
│   ├── package.json            # Server dependencies
│   └── .env                    # Server environment
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd week-5-web-sockets-assignment-princeulrichke
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server** (in `server/` directory)
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the client** (in `client/` directory)
   ```bash
   npm run dev
   ```
   Client will run on http://localhost:5173

3. **Open multiple browser tabs** to test real-time features

## 🎮 Usage Guide

### Getting Started
1. **Enter your name** on the login screen
2. **Choose a display name** - this will be visible to other users
3. **Start chatting** immediately after login

### Chat Features
- **Send messages** - Type and press Enter or click Send
- **React to messages** - Hover over messages and click the heart icon
- **Private chat** - Click on any user in the Users tab
- **Group chat** - Use the General Chat for everyone
- **Search messages** - Use the search icon in chat header
- **Theme toggle** - Click settings menu for dark/light mode

### Mobile Experience
- **Responsive design** - Works perfectly on mobile devices
- **Touch-friendly** - All interactions optimized for touch
- **Swipe navigation** - Natural mobile chat experience

## 🎨 Theme System

The application features a comprehensive theme system that replicates WhatsApp's visual design:

### Light Theme (Default)
- Clean, bright interface
- WhatsApp green (#00a884) accent colors
- Light backgrounds and dark text
- Subtle shadows and borders

### Dark Theme
- Dark backgrounds with light text
- Reduced eye strain for night use
- Consistent with WhatsApp's dark mode
- Preserves all functionality and aesthetics

### Theme Persistence
- Automatically saves theme preference
- Applies theme immediately on load
- Smooth transitions between themes

## 🔧 Technical Implementation

### Backend (Socket.io + Express)
- **Real-time communication** with Socket.io
- **File upload support** with Multer
- **Memory management** for messages and users
- **Room-based messaging** for group chats
- **User session management**
- **Message delivery tracking**

### Frontend (React + Vite)
- **Context API** for state management
- **Custom hooks** for Socket.io integration
- **Responsive design** with CSS variables
- **Component-based architecture**
- **Real-time UI updates**
- **Progressive Web App** features

### Key Libraries Used
- **Socket.io** - Real-time communication
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Modern icon library
- **emoji-picker-react** - Emoji selection
- **react-hot-toast** - Notification system
- **date-fns** - Date manipulation

## 🚀 Deployment

### Local Development
Both development servers support hot reload and are configured for optimal development experience.

### Production Deployment
1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy server** to services like:
   - Render.com
   - Railway.app
   - Heroku
   - Digital Ocean

3. **Deploy client** to services like:
   - Vercel
   - Netlify
   - GitHub Pages

### Environment Variables
**Server (.env)**
```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env)**
```
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User can login with username
- [ ] Real-time message sending/receiving
- [ ] Private messaging works
- [ ] Group chat functionality
- [ ] Typing indicators appear
- [ ] Message reactions work
- [ ] Theme switching works
- [ ] Mobile responsiveness
- [ ] File upload (if implemented)
- [ ] Browser notifications
- [ ] Reconnection on network failure

### Multi-User Testing
1. Open multiple browser tabs
2. Login with different usernames
3. Test all real-time features
4. Verify message delivery and read receipts

## 🎯 Assignment Requirements Met

### ✅ Task 1: Project Setup
- Node.js server with Express ✓
- Socket.io server configuration ✓
- React front-end application ✓
- Socket.io client setup ✓
- Client-server connection ✓

### ✅ Task 2: Core Chat Functionality
- User authentication (username-based) ✓
- Global chat room ✓
- Messages with sender name and timestamp ✓
- Typing indicators ✓
- Online/offline status ✓

### ✅ Task 3: Advanced Chat Features
- Private messaging ✓
- Multiple chat rooms ✓
- Typing indicators ✓
- File/image sharing support ✓
- Read receipts ✓
- Message reactions ✓

### ✅ Task 4: Real-Time Notifications
- New message notifications ✓
- Join/leave notifications ✓
- Unread message count ✓
- Sound notifications ✓
- Browser notifications ✓

### ✅ Task 5: Performance and UX Optimization
- Message pagination support ✓
- Reconnection logic ✓
- Socket.io optimization (rooms) ✓
- Message delivery acknowledgment ✓
- Message search functionality ✓
- Responsive design (desktop & mobile) ✓

## 🎨 Design Highlights

### WhatsApp Web Replica
- **Pixel-perfect design** matching WhatsApp Web
- **Authentic color scheme** and typography
- **Identical layout** and component structure
- **Smooth animations** and micro-interactions

### Mobile Responsiveness
- **WhatsApp mobile app** styling on mobile devices
- **Touch-optimized** interactions
- **Responsive breakpoints** for all screen sizes
- **Native app feel** on mobile browsers

## 🔐 Security & Privacy

- No sensitive data storage
- Client-side user session management
- Memory-only message storage (server restarts clear history)
- No authentication tokens or passwords required
- Real-time communication only during active sessions

## 🐛 Troubleshooting

### Common Issues
1. **Connection failed**: Check if server is running on port 5000
2. **Messages not appearing**: Verify both client and server are running
3. **Theme not persisting**: Check browser local storage permissions
4. **Mobile layout issues**: Clear browser cache and refresh

### Development Tips
- Use browser dev tools to monitor WebSocket connections
- Check console for Socket.io connection logs
- Test with multiple browser profiles for multi-user simulation

## 📈 Future Enhancements

Potential features for future development:
- Voice message support
- Video calling integration
- Message encryption
- User profile management
- Chat backup/export
- Message forwarding
- Group administration
- Media gallery
- Sticker support
- Location sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for educational purposes as part of the MERN Stack Development course assignment.

---

**Built with ❤️ for the PLP MERN Stack Development Course**

*Real-time chat application featuring WhatsApp-style design, comprehensive theme system, and full mobile responsiveness.*
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 