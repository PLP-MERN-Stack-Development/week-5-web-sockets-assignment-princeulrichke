import { useState } from 'react';
import { MessageCircle, User, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      login({ username: username.trim() });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center">
              <MessageCircle size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-2">
            WhatsApp Web
          </h1>
          <p className="text-secondary text-sm">
            Send and receive messages without keeping your phone online.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-secondary rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
                Enter your name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your display name"
                  className="w-full pl-10 pr-4 py-3 bg-tertiary border border-light rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full bg-whatsapp-green hover:bg-whatsapp-green-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Smartphone size={20} />
                  Start Messaging
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-tertiary">
          <p>Real-time chat application built with Socket.io</p>
          <p className="mt-1">Your messages are synchronized across devices</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
