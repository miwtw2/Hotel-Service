import React from 'react';
import { Building2, Phone, Clock, MessageCircle } from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Heaven's Hospitality</h1>
              <p className="text-sm text-slate-300">24/7 Guest Assistance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-300">Emergency</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to Your Digital Concierge
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Get instant assistance 24/7 with our AI-powered guest services. From room service to local 
          recommendations, we're here to make your heavenly stay exceptional.
        </p>
        
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-300">Available 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-slate-300">Instant Response</span>
          </div>
        </div>

        <button
          onClick={onStartChat}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Start Chat with AI Assistant
        </button>
      </div>
    </div>
  );
};