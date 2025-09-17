import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { QuickServices } from './components/QuickServices';
import { AIAssistantChat } from './components/AIAssistantChat';

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

function App() {
  const [showChat, setShowChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

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

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleServiceRequest = (service: { name: string; description: string }) => {
    addRequest(service.name, service.description);
    addMessage(`I need ${service.name.toLowerCase()}: ${service.description}`, 'user');
    
    // Auto-response
    setTimeout(() => {
      addMessage(`Your ${service.name.toLowerCase()} request has been received and will be fulfilled within 20-30 minutes. Thank you!`, 'bot');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingPage onStartChat={handleStartChat} />
      <QuickServices onServiceRequest={handleServiceRequest} />
      
      {/* AI Assistant Chat Widget */}
      <AIAssistantChat 
        isOpen={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
        messages={messages}
        onSendMessage={addMessage}
      />
      
      {/* Full Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">AI Assistant Chat</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6">
              <ChatInterface
                messages={messages}
                onSendMessage={addMessage}
                onCreateRequest={addRequest}
                guest={{ name: 'Guest', roomNumber: '101' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;