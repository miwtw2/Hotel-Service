import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';
import { QuickServices } from './components/QuickServices';
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

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'admin'>('guest');
  const [sessionToken, setSessionToken] = useState('');
  const [guestInfo, setGuestInfo] = useState<Guest>({ name: '', roomNumber: '' });
  const [adminInfo, setAdminInfo] = useState<AdminUser>({ username: '', fullName: '', role: '' });
  
  // Start with no pre-generated messages; AI will reply on demand
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Track requests but avoid unused variable warnings
  const [, setRequests] = useState<ServiceRequest[]>([]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addRequest = (type: string, description: string, priority: 'normal' | 'urgent' | 'emergency' = 'normal') => {
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      type,
      description,
      status: 'pending',
      timestamp: new Date(),
      priority
    };
    setRequests(prev => [...prev, newRequest]);
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
    setMessages([]);
  };

  const handleServiceRequest = async (service: { name: string; description: string }) => {
    const message = `I need ${service.name.toLowerCase()}: ${service.description}`;
    addMessage(message, 'user');
    addRequest(service.name, service.description);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      addMessage(data.reply, 'bot');
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage("I apologize, but I'm having trouble processing your request. Please try again.", 'bot');
    }
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
      onServiceRequest={handleServiceRequest}
      onSendMessage={addMessage}
      onCreateRequest={addRequest}
      onLogout={handleLogout}
    />
  );
}

// Guest Interface Component
interface GuestInterfaceProps {
  guestInfo: Guest;
  sessionToken: string;
  messages: ChatMessage[];
  onServiceRequest: (service: { name: string; description: string }) => void;
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
  onCreateRequest: (type: string, description: string, priority?: 'normal' | 'urgent' | 'emergency') => void;
  onLogout: () => void;
}

const GuestInterface: React.FC<GuestInterfaceProps> = ({
  guestInfo,
  sessionToken,
  messages,
  onServiceRequest,
  onSendMessage,
  onCreateRequest,
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
          <div className="flex gap-6">
            {/* Left side - Services */}
            <div className="w-1/2">
              <QuickServices onServiceRequest={onServiceRequest} />
            </div>

            {/* Right side - Chat Interface */}
            <div className="w-1/2">
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                  <p className="text-gray-600">How can I help you today?</p>
                </div>
                <div className="h-full p-6">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={onSendMessage}
                    onCreateRequest={onCreateRequest}
                    sessionToken={sessionToken}
                  />
                </div>
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