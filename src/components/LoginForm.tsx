import React, { useState } from 'react';
import { Hotel, User, Key } from 'lucide-react';

interface LoginFormProps {
  onLogin: (sessionToken: string, guestName: string, roomNumber: string) => void;
}

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !guestName.trim()) {
      setError('Please enter both room number and guest name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_number: roomNumber.trim(),
          guest_name: guestName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      onLogin(data.session_token, data.guest_name, data.room_number);
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hotel className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Heaven's Hospitality</h1>
          <p className="text-slate-600">Please enter your details to access guest services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-slate-700 mb-2">
              Room Number
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="roomNumber"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 101"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-slate-700 mb-2">
              Guest Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 text-slate-900 py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing In...' : 'Access Guest Services'}
          </button>
        </form>
      </div>
    </div>
  );
};