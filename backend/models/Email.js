// backend/models/Email.js
const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gmailId: { type: String, index: true }, // Gmail message ID if imported from Gmail
  sender: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  thread: { type: [String], default: [] },
  category: { type: String, default: null },
  action_items: { type: mongoose.Schema.Types.Mixed, default: null },
  draft: {
    subject: String,
    body: String,
    savedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', EmailSchema);



