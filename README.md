# 🎤 Speech to Text Application

A full-stack real-time multilingual speech-to-text web application with transcription history management.

## 📋 Features

- **Real-time Speech Recognition**: Convert speech to text in real-time using the Web Speech API
- **Multilingual Support**: Supports 14+ languages including Hindi, English, Spanish, French, German, and more
- **Mixed Language Support**: Can transcribe mixed languages (e.g., Hindi + English)
- **Transcription History**: View, search, and filter all saved transcriptions
- **CRUD Operations**: Create, Read, Update, and Delete transcriptions
- **Statistics Dashboard**: Track total transcriptions, languages used, and recent sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Storage**: All transcriptions are stored in MongoDB

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library
- **Web Speech API** - Browser-based speech recognition

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

## 📁 Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Transcription.js     # Transcription schema
│   ├── routes/
│   │   └── transcription.routes.js  # API routes
│   ├── .env                     # Environment variables
│   ├── .env.example             # Example environment file
│   ├── package.json
│   └── server.js                # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpeechToText.jsx     # Speech recognition component
│   │   │   ├── Dashboard.jsx        # History dashboard
│   │   │   ├── TranscriptionCard.jsx # Individual transcription card
│   │   │   └── EditModal.jsx        # Edit modal
│   │   ├── services/
│   │   │   └── api.js               # API service
│   │   ├── utils/
│   │   │   └── speechRecognition.js # Speech API wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                     # Frontend environment variables
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- A modern browser (Chrome, Edge, or Safari recommended for speech recognition)

### Installation

#### 1. Clone the repository (if applicable)

```bash
git clone <repository-url>
cd Procucev
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update the values
cp .env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/speech-to-text
# PORT=5000

# Start the backend server
npm start

# Or use nodemon for development
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
# The .env file should already point to http://localhost:5000/api
# Verify or create .env file:
cp .env.example .env

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 4. Database Setup

**Option A: Local MongoDB**

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/speech-to-text?retryWrites=true&w=majority
   ```

## 📖 Usage

### Recording a Transcription

1. Open the application at `http://localhost:5173`
2. Select your desired language from the dropdown
3. Click "Start Recording" and grant microphone permissions
4. Speak naturally into your microphone
5. Watch the real-time transcription appear on screen
6. Click "Stop Recording" when finished
7. Click "Save" to store the transcription in the database

### Managing Transcriptions

- **View History**: Scroll down to see all saved transcriptions
- **Search**: Use the search box to find specific transcriptions
- **Filter**: Filter by language using the dropdown
- **Edit**: Click the edit icon on any transcription to modify the text
- **Delete**: Click the delete icon to remove a transcription
- **Statistics**: View total transcriptions and language usage stats at the top

## 🌐 API Endpoints

### Transcriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transcriptions` | Get all transcriptions (with pagination) |
| GET | `/api/transcriptions/:id` | Get single transcription by ID |
| POST | `/api/transcriptions` | Create new transcription |
| PUT | `/api/transcriptions/:id` | Update transcription |
| DELETE | `/api/transcriptions/:id` | Delete transcription |
| GET | `/api/transcriptions/stats/summary` | Get statistics |

### Example API Request

```javascript
// Create a new transcription
POST http://localhost:5000/api/transcriptions
Content-Type: application/json

{
  "text": "Hello world, this is a test transcription",
  "language": "en-US",
  "duration": 5.2,
  "confidence": 0.95
}
```

## 🎯 Supported Languages

The application supports the following languages:

- English (US, UK, India)
- Hindi
- Spanish
- French
- German
- Italian
- Japanese
- Chinese (Simplified)
- Arabic
- Portuguese (Brazil)
- Russian
- Korean

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/speech-to-text
NODE_ENV=development
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🌐 Browser Compatibility

The Web Speech API is supported in:

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari
- ❌ Firefox (limited support)

**Note**: For the best experience, use Chrome or Edge browsers.

## 🐛 Troubleshooting

### Quick Diagnostic

**Audio records but no transcription?** 

1. **Test Page**: Open `http://localhost:5173/test-speech.html` - This simple test page will help diagnose the issue
2. **Check Console**: Open browser DevTools (F12) and look at the Console tab for detailed logs
3. **Full Guide**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for comprehensive debugging steps

### Common Issues

**1. Audio records but no text appears**
- Check browser console for errors (press F12)
- Ensure you're using Chrome or Edge browser
- Verify microphone volume is high enough (70%+)
- Check that you selected the correct language
- See detailed guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**2. "no-speech" error**
- This is now handled automatically - just keep speaking
- Make sure to speak clearly and at normal volume
- Reduce background noise

**3. Microphone permission issues**
- Look for microphone icon in browser address bar
- Click it and set to "Allow"
- Check Windows Settings → Privacy → Microphone

**4. Backend connection error**
- Verify MongoDB is running: `mongosh` or check MongoDB Compass
- Ensure the backend server is running on port 5000
- Check `backend/.env` has the correct MONGODB_URI

**5. CORS errors**
- Verify the backend's CORS configuration includes your frontend URL
- Check that frontend's `.env` has the correct API URL

## 📝 Development Notes

### Running Both Servers Simultaneously

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
# Set NODE_ENV=production in .env
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

This is an assignment project demonstrating:
- Full-stack development skills
- Real-time API integration
- Database design and CRUD operations
- Modern React patterns and state management
- RESTful API design
- Responsive UI/UX design

## 📄 License

MIT License - feel free to use this code for learning and development purposes.

## 🙏 Acknowledgments

- Web Speech API for browser-based speech recognition
- React and Vite teams for excellent developer experience
- MongoDB for reliable database solution
- Express.js for simple and robust backend framework

## 📧 Contact

For questions or issues, please refer to the assignment guidelines or contact the evaluator.

---

**Built with ❤️ for the Speech to Text Assignment**
