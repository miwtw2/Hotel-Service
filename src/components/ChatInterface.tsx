import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import type { ChatMessage } from '../App';
import { QuickChatBubbles } from './QuickChatBubbles';
import { ContextualSuggestionService } from '../services/contextualSuggestions';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
  sessionToken: string;
}

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  sessionToken
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

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          text: userMessage,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return error instanceof Error ? error.message : "I apologize, but I'm having trouble connecting to the server. Please try again in a moment.";
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    onSendMessage(userMessage, 'user');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Generate and send bot response
      const botResponse = await generateBotResponse(userMessage);
      onSendMessage(botResponse, 'bot');

      // Service requests are now handled automatically by the backend AI service
      // No need to create requests here as the backend processes AI responses
    } catch (error) {
      console.error('Error in chat:', error);
      onSendMessage('I apologize, but I encountered an error. Please try again.', 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const handleBubbleClick = async (message: string) => {
    setInputValue(message);
    onSendMessage(message, 'user');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Generate and send bot response
      const botResponse = await generateBotResponse(message);
      onSendMessage(botResponse, 'bot');

      // Service requests are now handled automatically by the backend AI service
      // No need to create requests here as the backend processes AI responses
    } catch (error) {
      console.error('Error in chat:', error);
      onSendMessage('I apologize, but I encountered an error. Please try again.', 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-96">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((message, index) => {
          const isLastBotMessage = message.type === 'bot' && 
            (index === messages.length - 1 || messages[index + 1]?.type === 'user');
          const shouldShowSuggestions = isLastBotMessage && 
            ContextualSuggestionService.shouldShowSuggestions(messages);

          return (
            <div key={message.id}>
              <div
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
              
              {/* Show contextual suggestions after bot messages */}
              {shouldShowSuggestions && (
                <div className="mt-3 ml-11">
                  <QuickChatBubbles 
                    messages={messages} 
                    show={true} 
                    onBubbleClick={handleBubbleClick} 
                  />
                </div>
              )}
            </div>
          );
        })}

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