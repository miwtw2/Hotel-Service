import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { GuestStatus } from './components/GuestStatus';

export interface Guest {
  name: string;
  roomNumber: string;
}

export interface AdminUser {
  username: string;
  fullName: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ServiceRequest {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: Date;
  priority: 'normal' | 'urgent' | 'emergency';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'admin'>('guest');
  const [sessionToken, setSessionToken] = useState('');
  const [guestInfo, setGuestInfo] = useState<Guest>({ name: '', roomNumber: '' });
  const [adminInfo, setAdminInfo] = useState<AdminUser>({ username: '', fullName: '', role: '' });
  
  // Helper function to create the initial welcome message
  const createWelcomeMessage = (): ChatMessage => ({
    id: 'welcome-message-' + Date.now(),
    type: 'bot',
    content: '🏨 Welcome to the Hotel Service Assistant! I\'m here to help you with any requests or questions you may have during your stay. Whether you need housekeeping, room service, maintenance, or information about local attractions, just let me know how I can assist you!',
    timestamp: new Date()
  });
  
  // Initialize with a welcome message from the chatbot
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLogin = (token: string, userData: any, type: 'guest' | 'admin') => {
    setSessionToken(token);
    setUserType(type);
    
    if (type === 'guest') {
      setGuestInfo({ name: userData.name, roomNumber: userData.roomNumber });
    } else {
      setAdminInfo({ 
        username: userData.username, 
        fullName: userData.fullName, 
        role: userData.role 
      });
    }
    
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionToken('');
    setUserType('guest');
    setGuestInfo({ name: '', roomNumber: '' });
    setAdminInfo({ username: '', fullName: '', role: '' });
    // Reset to initial welcome message
    setMessages([createWelcomeMessage()]);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Render Admin Dashboard for admin users
  if (userType === 'admin') {
    return (
      <AdminDashboard 
        sessionToken={sessionToken}
        userData={adminInfo}
        onLogout={handleLogout}
      />
    );
  }

  // Render Guest Interface for guest users
  return (
    <GuestInterface 
      guestInfo={guestInfo}
      sessionToken={sessionToken}
      messages={messages}
      onSendMessage={addMessage}
      onLogout={handleLogout}
    />
  );
}

// Guest Interface Component
interface GuestInterfaceProps {
  guestInfo: Guest;
  sessionToken: string;
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
  onLogout: () => void;
}

const GuestInterface: React.FC<GuestInterfaceProps> = ({
  guestInfo,
  sessionToken,
  messages,
  onSendMessage,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'status'>('services');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {guestInfo.name}
            </h1>
            <p className="text-gray-600">Room {guestInfo.roomNumber}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Services & Chat
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Status
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="p-6">
        {activeTab === 'services' ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-gray-600">How can I help you today? Use the quick request buttons below or type your own message.</p>
              </div>
              <div className="h-full p-6">
                <ChatInterface
                  messages={messages}
                  onSendMessage={onSendMessage}
                  sessionToken={sessionToken}
                />
              </div>
            </div>
          </div>
        ) : (
          <GuestStatus 
            sessionToken={sessionToken}
            guestInfo={guestInfo}
          />
        )}
      </main>
    </div>
  );
};

export default App;