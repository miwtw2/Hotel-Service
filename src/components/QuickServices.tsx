import React from 'react';
import { 
  Utensils, 
  Bed, 
  Car, 
  MapPin, 
  Wrench, 
  Sparkles,
  Coffee,
  Wifi,
  Phone
} from 'lucide-react';

interface QuickServicesProps {
  onServiceRequest: (service: { name: string; description: string }) => void;
}

const services = [
  {
    icon: Utensils,
    name: 'Room Service',
    description: 'Order food and beverages to your room',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    icon: Bed,
    name: 'Housekeeping',
    description: 'Request towels, bedding, or room cleaning',
    color: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  {
    icon: Car,
    name: 'Transportation',
    description: 'Book taxi, shuttle, or car rental services',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  },
  {
    icon: MapPin,
    name: 'Local Info',
    description: 'Get recommendations for dining and attractions',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
  },
  {
    icon: Wrench,
    name: 'Maintenance',
    description: 'Report issues with room facilities',
    color: 'bg-red-50 hover:bg-red-100 border-red-200'
  },
  {
    icon: Sparkles,
    name: 'Amenities',
    description: 'Request additional amenities or services',
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
  },
  {
    icon: Coffee,
    name: 'Refreshments',
    description: 'Order coffee, tea, or light snacks',
    color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  },
  {
    icon: Wifi,
    name: 'Tech Support',
    description: 'Get help with WiFi, TV, or room technology',
    color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
  },
  {
    icon: Phone,
    name: 'Concierge',
    description: 'General assistance and special requests',
    color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
  }
];

export const QuickServices: React.FC<QuickServicesProps> = ({ onServiceRequest }) => {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Quick Services</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Click on any service below to get instant assistance, or use our AI chatbot for personalized help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <button
            key={index}
            onClick={() => onServiceRequest(service)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg transform hover:-translate-y-1 ${service.color}`}
          >
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <service.icon className="w-6 h-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-slate-900">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 group-hover:text-slate-700">
                  {service.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};