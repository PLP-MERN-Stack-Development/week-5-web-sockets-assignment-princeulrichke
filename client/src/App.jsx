import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LoginPage from './components/LoginPage';
import ChatApp from './components/ChatApp';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="app h-screen">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
          },
        }}
      />
      
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <SocketProvider>
          <ChatApp />
        </SocketProvider>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
