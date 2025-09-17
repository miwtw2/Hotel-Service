import React, { useState } from 'react';
import { Hotel, User, Key, ArrowRight } from 'lucide-react';

interface GuestCheckInProps {
  onCheckIn: (guest: { name: string; roomNumber: string }) => void;
}

export const GuestCheckIn: React.FC<GuestCheckInProps> = ({ onCheckIn }) => {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomNumber.trim()) return;
    
    setIsLoading(true);
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onCheckIn({ name: name.trim(), roomNumber: roomNumber.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Guest Services
          </h1>
          <p className="text-gray-600">
            Your 24/7 virtual concierge is ready to assist
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Room Number
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 1205"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !roomNumber.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                Access Guest Services
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Available 24/7</span>
          </div>
          <p className="text-blue-600 text-xs mt-1">
            Instant assistance for all your hotel needs
          </p>
        </div>
      </div>
    </div>
  );
};