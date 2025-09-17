import React from 'react';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Emergency Contact</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Front Desk: Dial 0</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Security: Dial 911</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Email: services@hotel.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Service Hours</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>AI Concierge: 24/7</div>
              <div>Room Service: 24/7</div>
              <div>Housekeeping: 6 AM - 11 PM</div>
              <div>Maintenance: 24/7</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Access</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>WiFi: HotelGuest</div>
              <div>Password: Welcome2024</div>
              <div>Checkout: 11:00 AM</div>
              <div>Late Checkout: Request via chat</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© 2024 Hotel Guest Services. Your comfort is our priority.</p>
          <div className="flex justify-center items-center gap-1 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Status: All services operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};