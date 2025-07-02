import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('whatsapp-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('whatsapp-user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('whatsapp-user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (userData) => {
    const userWithDefaults = {
      ...userData,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username}&background=random&color=fff`,
      status: 'online',
      lastSeen: new Date()
    };
    setUser(userWithDefaults);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('whatsapp-user');
  };

  const updateUser = (updates) => {
    setUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
