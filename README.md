# Hotel-Service

A modern hospitality service platform built with TypeScript, React, and FastAPI, featuring AI-powered chat assistance for hotel services and requests.

## Features

- 💬 AI-powered chat interface
- 🏨 Hotel service request management
- 📱 Responsive design
- 🔒 Type-safe with TypeScript
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🚀 RESTful API with FastAPI
- 📦 Supabase integration

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase Client

### Backend
- FastAPI
- Python 3.10+
- AI Services Integration
- Supabase Database

## Project Structure
```
Hotel-Service/
├── backend/                # Backend source code
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── .env              # Environment configuration
├── src/                   # Frontend source code
│   ├── App.tsx           # Main React component
│   ├── index.tsx         # Entry point
│   ├── api/              # API clients
│   └── components/       # React components
├── public/               # Static assets
├── package.json         # Node.js dependencies
├── requirements.txt     # Python dependencies
└── tailwind.config.js   # Tailwind configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SnekHunter/Hotel-Service.git
   cd Hotel-Service
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   
   Create `backend/app/.env` with:
   ```env
   DATABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   AI_API_KEY=your-ai-service-key
   ```

### Running the Application

1. **Start the frontend**
   ```bash
   npm run dev
   ```
   Access at http://localhost:5173

2. **Start the backend**
   ```bash
   cd backend
   python -m app.main
   ```
   API available at http://localhost:8000

## API Endpoints

### Chat
- `POST /chat/message` - Send a message to AI service
- `GET /chat/history` - Get chat history

### Requests
- `GET /requests` - List service requests
- `POST /requests` - Create new request
- `PUT /requests/{id}` - Update request status

## Components

- `ChatWindow.tsx` - Main chat interface
- `Message.tsx` - Individual message component

## Services

### AI Services
- Natural language processing for guest requests
- Context-aware responses
- Service categorization

### Database Services
- Chat history persistence
- Request tracking
- User session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
