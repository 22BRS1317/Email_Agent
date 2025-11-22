# Email Agent Application

A full-stack email management application with Gmail integration, AI-powered categorization, action item extraction, and automated reply generation.

## Features

- 🔐 **User Authentication** - Secure login/register system with JWT tokens
- 📧 **Gmail Integration** - Connect your Gmail account via OAuth 2.0
- 📥 **Email Import** - Select and import emails from your Gmail inbox
- 🤖 **AI Processing** - Automatically categorize emails, extract action items, and generate replies
- 💾 **Database Storage** - All emails stored in MongoDB per user
- ✏️ **Draft Management** - Edit and save email drafts
- ⚙️ **Customizable Prompts** - Configure AI prompts for categorization, action items, and replies

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth 2.0 (Gmail API)
- Groq AI API (for email processing)

### Frontend
- React + Vite
- React Router
- Context API for state management

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Cloud Console account (for Gmail API)
- Groq API key (optional, for AI features)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd email_agent
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/email_agent
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/email_agent

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/gmail/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Groq API Key (optional)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192

# Server Port
PORT=4000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**:
   - APIs & Services > Library
   - Search "Gmail API" > Enable
4. Configure OAuth Consent Screen:
   - APIs & Services > OAuth consent screen
   - User Type: External
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`
5. Create OAuth 2.0 Credentials:
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:4000/api/gmail/callback`
   - Copy Client ID and Client Secret to `.env`

## Running the Application

### Start Backend

```bash
cd backend
npm start
```

Backend will run on `http://localhost:4000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account or log in
2. **Connect Gmail**: Click "Connect Gmail" button to authorize your Gmail account
3. **Select Emails**: Click "Select from Gmail" to view emails from your inbox
4. **Import Emails**: Select emails and click "Import" to add them to your database
5. **Process Emails**: Click "Process with Agent" to categorize, extract action items, and generate replies
6. **Edit Drafts**: Modify generated replies and save them
7. **Customize Prompts**: Edit AI prompts in the prompts panel

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Emails
- `GET /api/emails` - Get user's emails
- `GET /api/emails/:id` - Get specific email
- `POST /api/emails/import` - Import single email
- `POST /api/emails/import-batch` - Import multiple emails
- `POST /api/emails/:id/process` - Process email with AI
- `POST /api/emails/save-draft` - Save email draft

### Gmail
- `GET /api/gmail/auth-url` - Get Gmail OAuth URL
- `GET /api/gmail/callback` - OAuth callback handler
- `GET /api/gmail/emails` - Fetch emails from Gmail
- `GET /api/gmail/status` - Check Gmail connection status

### Prompts
- `GET /api/prompts` - Get AI prompts
- `PUT /api/prompts` - Update AI prompts

### Profile
- `GET /api/profile` - Get user profile

## Project Structure

```
email_agent/
├── backend/
│   ├── models/          # MongoDB models (User, Email)
│   ├── routes/          # API routes
│   ├── services/        # External services (Gmail, Groq)
│   ├── utils/           # Utility functions
│   ├── data/            # Data files (prompts.json)
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── api.js       # API client
│   │   └── App.jsx      # Main app component
│   └── vite.config.js
└── README.md
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID <PID>

# Or change PORT in .env
```

### MongoDB Connection Error
- Check `MONGO_URI` in `.env`
- Ensure MongoDB is running
- For MongoDB Atlas, check network access settings

### Gmail OAuth Error
- Verify `GOOGLE_REDIRECT_URI` matches Google Cloud Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Ensure Gmail API is enabled

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.js`

## License

MIT



