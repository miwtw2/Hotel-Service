// Contextual suggestion service for chat interface
import { ChatMessage } from '../App';

export interface SuggestionBubble {
  id: string;
  text: string;
  message: string;
  category: string;
  relevanceScore: number;
}

const contextualSuggestions: Record<string, SuggestionBubble[]> = {
  housekeeping: [
    {
      id: 'hk-1',
      text: 'Need more towels',
      message: 'I need additional towels for my room please.',
      category: 'housekeeping',
      relevanceScore: 0.9
    },
    {
      id: 'hk-2', 
      text: 'Schedule cleaning',
      message: 'Can you schedule a room cleaning for later today?',
      category: 'housekeeping',
      relevanceScore: 0.8
    },
    {
      id: 'hk-3',
      text: 'Change bedding',
      message: 'I would like fresh bedding for my room.',
      category: 'housekeeping',
      relevanceScore: 0.7
    }
  ],
  
  food: [
    {
      id: 'food-1',
      text: 'Room service menu',
      message: 'Can I see the room service menu and place an order?',
      category: 'room_service',
      relevanceScore: 0.9
    },
    {
      id: 'food-2',
      text: 'Order breakfast',
      message: 'I would like to order breakfast to my room for tomorrow morning.',
      category: 'room_service',
      relevanceScore: 0.8
    },
    {
      id: 'food-3',
      text: 'Late night snacks',
      message: 'Are there any late night dining options or snacks available?',
      category: 'room_service',
      relevanceScore: 0.7
    }
  ],

  technical: [
    {
      id: 'tech-1',
      text: 'WiFi not working',
      message: 'The WiFi in my room is not working properly. Can you help?',
      category: 'tech_support',
      relevanceScore: 0.9
    },
    {
      id: 'tech-2',
      text: 'TV issues',
      message: 'I am having trouble with the TV in my room.',
      category: 'tech_support',
      relevanceScore: 0.8
    },
    {
      id: 'tech-3',
      text: 'Need tech help',
      message: 'I need technical assistance with the room equipment.',
      category: 'tech_support',
      relevanceScore: 0.7
    }
  ],

  transportation: [
    {
      id: 'transport-1',
      text: 'Airport shuttle',
      message: 'Do you have airport shuttle service? What are the schedules?',
      category: 'transportation',
      relevanceScore: 0.9
    },
    {
      id: 'transport-2',
      text: 'Call a taxi',
      message: 'Can you help me arrange a taxi to the airport?',
      category: 'transportation',
      relevanceScore: 0.8
    },
    {
      id: 'transport-3',
      text: 'Car rental',
      message: 'I need information about car rental services.',
      category: 'transportation',
      relevanceScore: 0.7
    }
  ],

  local: [
    {
      id: 'local-1',
      text: 'Restaurant recommendations',
      message: 'Can you recommend some good restaurants nearby?',
      category: 'local_info',
      relevanceScore: 0.9
    },
    {
      id: 'local-2',
      text: 'Tourist attractions',
      message: 'What are the popular tourist attractions in the area?',
      category: 'local_info',
      relevanceScore: 0.8
    },
    {
      id: 'local-3',
      text: 'Shopping areas',
      message: 'Where are the best shopping areas near the hotel?',
      category: 'local_info',
      relevanceScore: 0.7
    }
  ],

  maintenance: [
    {
      id: 'maint-1',
      text: 'AC not working',
      message: 'The air conditioning in my room is not working properly.',
      category: 'maintenance',
      relevanceScore: 0.9
    },
    {
      id: 'maint-2',
      text: 'Plumbing issue',
      message: 'There is a plumbing issue in my bathroom that needs attention.',
      category: 'maintenance',
      relevanceScore: 0.8
    },
    {
      id: 'maint-3',
      text: 'Report broken item',
      message: 'I need to report a broken item in my room.',
      category: 'maintenance',
      relevanceScore: 0.7
    }
  ],

  general: [
    {
      id: 'gen-1',
      text: 'Extend checkout',
      message: 'Can I extend my checkout time?',
      category: 'concierge',
      relevanceScore: 0.8
    },
    {
      id: 'gen-2',
      text: 'Hotel amenities',
      message: 'What amenities does the hotel offer?',
      category: 'concierge',
      relevanceScore: 0.7
    },
    {
      id: 'gen-3',
      text: 'Business center',
      message: 'Do you have a business center or meeting rooms available?',
      category: 'concierge',
      relevanceScore: 0.6
    }
  ]
};

// Keywords for different categories
const categoryKeywords: Record<string, string[]> = {
  housekeeping: ['clean', 'towel', 'housekeeping', 'bedding', 'sheets', 'pillow', 'tidy', 'maid'],
  food: ['food', 'eat', 'hungry', 'breakfast', 'lunch', 'dinner', 'menu', 'order', 'meal', 'restaurant', 'room service'],
  technical: ['wifi', 'internet', 'tv', 'television', 'remote', 'tech', 'technical', 'device', 'computer', 'phone'],
  transportation: ['taxi', 'car', 'airport', 'shuttle', 'transport', 'drive', 'rental', 'uber', 'lyft'],
  local: ['restaurant', 'attraction', 'tour', 'shopping', 'nearby', 'local', 'area', 'recommend', 'place'],
  maintenance: ['broken', 'fix', 'repair', 'maintenance', 'plumbing', 'heating', 'cooling', 'air conditioning', 'ac'],
  general: ['checkout', 'amenity', 'facility', 'service', 'help', 'business', 'meeting', 'pool', 'gym']
};

export class ContextualSuggestionService {
  
  /**
   * Analyze chat messages and return contextually relevant suggestions
   */
  static getContextualSuggestions(messages: ChatMessage[], maxSuggestions: number = 3): SuggestionBubble[] {
    if (messages.length === 0) {
      return this.getDefaultSuggestions(maxSuggestions);
    }

    // Get the last few messages for context (last 3 messages)
    const recentMessages = messages.slice(-3);
    const contextText = recentMessages
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    // Calculate relevance scores for each category
    const categoryScores: Record<string, number> = {};
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        // Count occurrences of each keyword
        const regex = new RegExp(keyword, 'gi');
        const matches = contextText.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      categoryScores[category] = score;
    });

    // Get suggestions from the top scoring categories
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0)
      .map(([category]) => category);

    let suggestions: SuggestionBubble[] = [];
    
    // If we found relevant categories, use them
    if (sortedCategories.length > 0) {
      for (const category of sortedCategories) {
        if (suggestions.length >= maxSuggestions) break;
        
        const categorySuggestions = contextualSuggestions[category] || [];
        const remaining = maxSuggestions - suggestions.length;
        suggestions = suggestions.concat(categorySuggestions.slice(0, remaining));
      }
    }

    // Fill remaining slots with general suggestions if needed
    if (suggestions.length < maxSuggestions) {
      const generalSuggestions = contextualSuggestions.general || [];
      const remaining = maxSuggestions - suggestions.length;
      suggestions = suggestions.concat(generalSuggestions.slice(0, remaining));
    }

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Get default suggestions when no context is available
   */
  static getDefaultSuggestions(maxSuggestions: number = 3): SuggestionBubble[] {
    const defaultSuggestions = [
      contextualSuggestions.housekeeping[0],
      contextualSuggestions.food[0],
      contextualSuggestions.local[0]
    ];
    
    return defaultSuggestions.slice(0, maxSuggestions);
  }

  /**
   * Check if we should show suggestions based on the last message
   */
  static shouldShowSuggestions(messages: ChatMessage[]): boolean {
    if (messages.length === 0) return true;
    
    const lastMessage = messages[messages.length - 1];
    
    // Show suggestions after bot replies
    if (lastMessage.type === 'bot') {
      return true;
    }
    
    return false;
  }
}