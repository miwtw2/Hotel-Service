import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import type { ChatMessage, ServiceRequest, Guest } from '../App';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
  onCreateRequest: (type: string, description: string, priority?: 'normal' | 'urgent' | 'emergency') => void;
  guest: Guest;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onCreateRequest,
  guest
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('towel')) {
      return "I'll arrange for fresh towels to be delivered to your room right away. You can expect them within 15-20 minutes. Is there anything else you need?";
    } else if (message.includes('blanket') || message.includes('pillow')) {
      return "I'll send extra bedding to room " + guest.roomNumber + " immediately. Our housekeeping team will deliver them within 15 minutes. What else can I help you with?";
    } else if (message.includes('room service') || message.includes('food') || message.includes('order')) {
      return "I'd be happy to help with room service! Our kitchen is open 24/7. Would you like me to connect you with our dining menu, or do you have a specific request in mind?";
    } else if (message.includes('clean') || message.includes('housekeeping')) {
      return "I'll schedule housekeeping for your room. Would you prefer immediate service or would you like to schedule it for a specific time? Our team can be there within 30 minutes if you need immediate assistance.";
    } else if (message.includes('maintenance') || message.includes('repair') || message.includes('broken')) {
      return "I'll dispatch our maintenance team to room " + guest.roomNumber + " right away. They'll assess and resolve the issue as quickly as possible. Can you provide more details about what needs attention?";
    } else if (message.includes('checkout') || message.includes('bill') || message.includes('receipt')) {
      return "I can help you with checkout information. Would you like me to prepare your bill, arrange express checkout, or answer any questions about charges?";
    } else if (message.includes('wifi') || message.includes('internet')) {
      return "For WiFi assistance: Network is 'HotelGuest', password is 'Welcome2024'. If you're still having connectivity issues, I can send our IT support to your room.";
    } else if (message.includes('taxi') || message.includes('transport') || message.includes('airport')) {
      return "I'll be happy to arrange transportation for you. Where would you like to go and when? I can book a taxi, rideshare, or airport shuttle depending on your preference.";
    } else {
      return "I understand you need assistance. Let me help you with that. Could you provide a bit more detail about what you need? I'm here to ensure your stay is comfortable and enjoyable.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    onSendMessage(userMessage, 'user');

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate and send bot response
    const botResponse = generateBotResponse(userMessage);
    onSendMessage(botResponse, 'bot');

    // Create a service request if the message indicates a specific need
    const message = userMessage.toLowerCase();
    if (message.includes('towel')) {
      onCreateRequest('Towels', 'Fresh towels requested', 'normal');
    } else if (message.includes('blanket') || message.includes('pillow')) {
      onCreateRequest('Bedding', 'Extra bedding requested', 'normal');
    } else if (message.includes('clean') || message.includes('housekeeping')) {
      onCreateRequest('Housekeeping', 'Room cleaning requested', 'normal');
    } else if (message.includes('maintenance') || message.includes('repair') || message.includes('broken')) {
      onCreateRequest('Maintenance', 'Maintenance assistance requested', 'urgent');
    }

    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-96">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your request here..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};