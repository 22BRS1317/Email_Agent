// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const emailsRouter = require('./routes/emails');
const promptsRouter = require('./routes/prompts');
const gmailRouter = require('./routes/gmail');
// auth router will be added below
const authRoutes = require('./routes/auth').router; // note: auth.js exports { router, requireAuth }

const app = express();
// Configure CORS to allow requests from frontend
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (normalizedOrigin === frontendUrl || normalizedOrigin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// --- MongoDB connection ---
const MONGO = process.env.MONGO_URI;
if (!MONGO) {
  console.warn('MONGO_URI not set in .env');
} else {
  mongoose.connect(MONGO)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error', err);
      console.error('Please check your MONGO_URI in .env file');
    });
}

// --- Mount routes ---
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailsRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/gmail', gmailRouter);
const profileRouter = require('./routes/profile');
app.use('/api/profile', profileRouter);


// health
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
