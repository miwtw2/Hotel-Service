# 🏨 Hotel Service Management System

A comprehensive hotel service management system with AI-powered chat assistance, guest authentication, and admin dashboard for managing requests and staff assignments.

## 🌟 Features

### 🔐 **Authentication System**
- **Guest Login**: Room number and name-based authentication
- **Admin Login**: Username and password authentication with role-based access
- **Session Management**: Secure JWT-like tokens with automatic expiration

### 🤖 **AI Chat Assistant**
- **Google Gemini Integration**: Gemini 1.5 Flash powered responses
- **Hotel Concierge**: Professional, helpful AI assistant for guest inquiries
- **Always Available**: Chat interface visible at all times after login
- **Context Aware**: AI understands hotel-specific information and services
- **Fast & Efficient**: Gemini 1.5 Flash provides quick responses with low latency
- **Cost Effective**: Generous free tier and competitive pricing

### 👥 **Guest Features**
- **Service Requests**: Easy request submission with priority levels
- **Request Tracking**: Real-time status updates on submitted requests
- **Chat History**: Persistent conversation history
- **Quick Services**: One-click common service requests

### 🛠 **Admin Dashboard**
- **Request Management**: View, assign, and update all service requests
- **Staff Management**: Manage staff profiles, departments, and availability
- **Assignment Tracking**: Monitor staff workloads and active assignments
- **Analytics**: Real-time statistics and performance metrics
- **Role-based Access**: Different permission levels (Admin, Manager, Supervisor)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Supabase account
- Google AI Studio API key (Gemini)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Hotel-Service
```

### 2. Backend Setup
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your credentials:
# GEMINI_API_KEY=your_gemini_api_key
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key
```

#### Getting a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated API key to your `.env` file

### 3. Database Setup
1. Create a new project on [Supabase](https://supabase.com)
2. Copy your Project URL and API Key
3. Run the SQL schema in Supabase SQL Editor:
```bash
# Run the setup script to create tables and sample data
cd backend
python setup_supabase.py
```

### 4. Frontend Setup
```bash
# Return to project root
cd ..

# Install dependencies
npm install

# Create environment file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 5. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🔑 Test Credentials

### Guest Login
- **Room 101**: John Smith
- **Room 102**: Jane Doe

### Admin Login
- **Username**: admin / **Password**: admin123 (Full Admin)
- **Username**: manager / **Password**: manager456 (Manager)

## 📁 Project Structure

```
Hotel-Service/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry
│   │   ├── models/            # Data models
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── chat.py        # Chat and AI endpoints
│   │   │   ├── admin.py       # Admin management endpoints
│   │   │   └── guest.py       # Guest-specific endpoints
│   │   └── services/          # Business logic
│   │       ├── ai_services.py # OpenAI integration
│   │       └── db_services.py # Supabase integration
│   ├── requirements.txt       # Python dependencies
│   └── setup_supabase.py     # Database setup script
├── src/                       # React TypeScript frontend
│   ├── components/           # React components
│   │   ├── LoginForm.tsx     # Dual-mode authentication
│   │   ├── ChatInterface.tsx # AI chat component
│   │   ├── AdminDashboard.tsx # Admin main dashboard
│   │   ├── RequestsManagement.tsx # Request management
│   │   ├── StaffManagement.tsx # Staff management
│   │   ├── AssignmentsManagement.tsx # Assignment tracking
│   │   ├── GuestStatus.tsx   # Guest status tracking
│   │   └── QuickServices.tsx # Quick service buttons
│   ├── App.tsx              # Main application component
│   └── main.tsx             # React entry point
├── package.json             # Node.js dependencies
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - Guest authentication
- `POST /auth/verify` - Session verification
- `POST /admin/login` - Admin authentication

### Chat & AI
- `POST /chat` - Send message to AI assistant

### Admin Operations
- `GET /admin/requests` - Get all service requests
- `PUT /admin/requests/{id}/assign` - Assign request to staff
- `PUT /admin/requests/{id}/status` - Update request status
- `GET /admin/staff` - Get all staff members
- `GET /admin/assignments` - Get staff assignments

### Guest Operations
- `GET /guest/requests/{room_number}` - Get guest's requests
- `POST /guest/requests` - Create new service request

## 🛡 Security Features

- **Session-based Authentication**: Secure token-based sessions
- **Role-based Access Control**: Different permissions for different user types
- **CORS Protection**: Configured for development and production
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries via Supabase

## 🎨 Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Supabase**: PostgreSQL database with real-time features
- **Google Gemini**: Gemini 1.5 Flash for AI chat responses
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

## 📊 Database Schema

### Core Tables
- **guest_sessions**: Authentication sessions for guests
- **admin_users**: Admin user accounts with roles
- **staff_members**: Hotel staff information and availability
- **chat_messages**: AI chat conversation history
- **service_requests**: Guest service requests with status tracking
- **staff_assignments**: Request assignments to staff members

## 🔄 Development Workflow

1. **Backend Development**: Modify Python files in `backend/app/`
2. **Frontend Development**: Modify React components in `src/`
3. **Database Changes**: Update schema in Supabase dashboard
4. **Environment Variables**: Update `.env` files as needed
5. **Testing**: Use provided test credentials for different user roles

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Railway, Render, or AWS
- Set environment variables in production
- Configure CORS for production domains

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Set `VITE_API_URL` to production backend URL
- Build with `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase database is properly configured
4. Test API endpoints directly if needed

---

**Built with ❤️ for modern hotel service management**
