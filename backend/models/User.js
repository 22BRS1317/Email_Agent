// backend/models/User.js
const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  provider: { type: String, required: true }, // e.g. "google"
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String }, // present for email/password users
  tokens: { type: [TokenSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
