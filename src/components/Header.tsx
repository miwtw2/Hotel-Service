import React from 'react';
import { Hotel, Clock, Wifi } from 'lucide-react';

interface HeaderProps {
  guest: {
    name: string;
    roomNumber: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ guest }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Guest Services</h1>
              <p className="text-sm text-gray-600">Virtual Concierge</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{guest.name}</p>
              <p className="text-xs text-gray-600">Room {guest.roomNumber}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>24/7</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};