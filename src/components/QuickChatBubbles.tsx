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
import { ContextualSuggestionService } from '../services/contextualSuggestions';
import { ChatMessage } from '../App';

interface QuickChatBubblesProps {
  onBubbleClick: (message: string) => void;
  messages: ChatMessage[];
  show: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'room_service': Utensils,
  'housekeeping': Bed,
  'transportation': Car,
  'local_info': MapPin,
  'maintenance': Wrench,
  'amenities': Sparkles,
  'refreshments': Coffee,
  'tech_support': Wifi,
  'concierge': Phone,
  'towels': Bed,
  'general': Phone
};

export const QuickChatBubbles: React.FC<QuickChatBubblesProps> = ({ 
  onBubbleClick, 
  messages, 
  show 
}) => {
  if (!show) return null;

  const suggestions = ContextualSuggestionService.getContextualSuggestions(messages, 4);

  return (
    <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="mb-2">
        <p className="text-xs text-gray-600 font-medium">💡 Suggested actions:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const IconComponent = iconMap[suggestion.category] || Phone;
          return (
            <button
              key={suggestion.id}
              onClick={() => onBubbleClick(suggestion.message)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <IconComponent className="w-4 h-4" />
              <span>{suggestion.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};