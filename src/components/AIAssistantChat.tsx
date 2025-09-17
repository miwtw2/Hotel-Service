import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../App';

interface AIAssistantChatProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onToggle,
  messages,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    onSendMessage(userMessage, 'user');

    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const botResponse = generateResponse(userMessage);
    onSendMessage(botResponse, 'bot');
    setIsTyping(false);
  };

  const generateResponse = (message: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes('towel')) {
      return "I'll arrange for fresh towels to be delivered to your room within 15 minutes.";
    } else if (msg.includes('food') || msg.includes('room service')) {
      return "I'd be happy to help with room service! What would you like to order?";
    } else {
      return "I understand you need assistance. How can I help make your stay more comfortable?";
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-2xl shadow-2xl hover:bg-slate-700 transition-all duration-200 z-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Bot className="w-5 h-5 text-slate-900" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">AI Assistant</p>
              <p className="text-xs text-slate-300">Always here to help</p>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <Bot className="w-4 h-4 text-slate-900" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Assistant</p>
                <p className="text-xs text-slate-300">Always here to help</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-slate-800'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};