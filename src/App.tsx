import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';
import { QuickServices } from './components/QuickServices';

export interface Guest {
  name: string;
  roomNumber: string;
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
  const [sessionToken, setSessionToken] = useState('');
  const [guestInfo, setGuestInfo] = useState<Guest>({ name: '', roomNumber: '' });
  
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

  const handleLogin = (token: string, name: string, roomNumber: string) => {
    setSessionToken(token);
    setGuestInfo({ name, roomNumber });
    setIsAuthenticated(true);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Services */}
      <div className="w-1/2 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {guestInfo.name}
          </h1>
          <p className="text-gray-600">Room {guestInfo.roomNumber}</p>
        </div>
        <QuickServices onServiceRequest={handleServiceRequest} />
      </div>

      {/* Right side - Chat Interface */}
      <div className="w-1/2 p-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-gray-600">How can I help you today?</p>
          </div>
          <div className="h-full p-6">
            <ChatInterface
              messages={messages}
              onSendMessage={addMessage}
              onCreateRequest={addRequest}
              sessionToken={sessionToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;