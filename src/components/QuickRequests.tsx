import React from 'react';
import { 
  Droplets, 
  Bed, 
  Utensils, 
  Sparkles, 
  Wrench, 
  Car, 
  Phone, 
  AlertTriangle,
  Clock,
  Coffee
} from 'lucide-react';
import type { Guest } from '../App';

interface QuickRequestsProps {
  onCreateRequest: (type: string, description: string, priority?: 'normal' | 'urgent' | 'emergency') => void;
  onSendMessage: (content: string, type: 'user' | 'bot') => void;
  guest: Guest;
}

const requestCategories = [
  {
    title: 'Housekeeping',
    icon: Sparkles,
    color: 'blue',
    requests: [
      { name: 'Fresh Towels', description: 'Clean towels delivery', priority: 'normal' as const },
      { name: 'Extra Bedding', description: 'Additional pillows and blankets', priority: 'normal' as const },
      { name: 'Room Cleaning', description: 'Complete room cleaning service', priority: 'normal' as const },
      { name: 'Bathroom Supplies', description: 'Toiletries and amenities', priority: 'normal' as const },
    ]
  },
  {
    title: 'Room Service',
    icon: Utensils,
    color: 'green',
    requests: [
      { name: 'Food Menu', description: 'Request room service menu', priority: 'normal' as const },
      { name: 'Coffee/Tea', description: 'Hot beverages delivery', priority: 'normal' as const },
      { name: 'Ice & Water', description: 'Ice bucket and bottled water', priority: 'normal' as const },
      { name: 'Late Night Snacks', description: '24-hour snack service', priority: 'normal' as const },
    ]
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    color: 'orange',
    requests: [
      { name: 'Air Conditioning', description: 'AC temperature control issue', priority: 'urgent' as const },
      { name: 'Plumbing Issue', description: 'Bathroom or sink problems', priority: 'urgent' as const },
      { name: 'Electrical Issue', description: 'Lights or outlets not working', priority: 'urgent' as const },
      { name: 'TV/Internet', description: 'Entertainment system support', priority: 'normal' as const },
    ]
  },
  {
    title: 'Concierge',
    icon: Phone,
    color: 'purple',
    requests: [
      { name: 'Transportation', description: 'Taxi or shuttle service', priority: 'normal' as const },
      { name: 'Local Information', description: 'Area attractions and dining', priority: 'normal' as const },
      { name: 'Wake-up Call', description: 'Schedule morning wake-up call', priority: 'normal' as const },
      { name: 'Lost & Found', description: 'Report or inquire about lost items', priority: 'normal' as const },
    ]
  }
];

const emergencyRequests = [
  { name: 'Security Emergency', description: 'Immediate security assistance needed', priority: 'emergency' as const },
  { name: 'Medical Emergency', description: 'Medical assistance required', priority: 'emergency' as const },
  { name: 'Fire/Safety', description: 'Fire alarm or safety concern', priority: 'emergency' as const },
];

export const QuickRequests: React.FC<QuickRequestsProps> = ({
  onCreateRequest,
  onSendMessage,
  guest
}) => {
  const handleQuickRequest = (request: { name: string; description: string; priority: 'normal' | 'urgent' | 'emergency' }) => {
    onCreateRequest(request.name, request.description, request.priority);
    onSendMessage(`I need ${request.name.toLowerCase()}: ${request.description}`, 'user');
    
    // Generate automatic bot response
    setTimeout(() => {
      let response = '';
      if (request.priority === 'emergency') {
        response = `Emergency assistance has been dispatched to room ${guest.roomNumber} immediately. Help is on the way.`;
      } else if (request.priority === 'urgent') {
        response = `Your ${request.name.toLowerCase()} request has been marked as urgent and assigned to our maintenance team. They'll be with you within 15 minutes.`;
      } else {
        response = `Your ${request.name.toLowerCase()} request has been received and will be fulfilled within 20-30 minutes. Thank you for your patience!`;
      }
      onSendMessage(response, 'bot');
    }, 1000);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'green': return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
      case 'orange': return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100';
      default: return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Emergency Requests */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">Emergency Assistance</h2>
        </div>
        <div className="grid gap-3">
          {emergencyRequests.map((request, index) => (
            <button
              key={index}
              onClick={() => handleQuickRequest(request)}
              className="w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 font-medium hover:bg-red-200 transition-all duration-200 text-left"
            >
              {request.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regular Request Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {requestCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={`border rounded-xl p-6 ${getColorClasses(category.color)}`}>
            <div className="flex items-center gap-3 mb-4">
              <category.icon className="w-6 h-6" />
              <h3 className="text-lg font-semibold">{category.title}</h3>
            </div>
            <div className="space-y-2">
              {category.requests.map((request, requestIndex) => (
                <button
                  key={requestIndex}
                  onClick={() => handleQuickRequest(request)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{request.name}</span>
                    {request.priority === 'urgent' && (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Quick Response Times:</strong> Normal requests are fulfilled within 20-30 minutes. 
              Urgent requests receive priority attention within 15 minutes. Emergency requests are handled immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};