// backend/routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) console.warn('JWT_SECRET not set in .env');

// ---------- helper: generate token ----------
function generateToken(user) {
  const payload = { id: user._id.toString(), email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ---------- Register ----------
router.post(
  '/register',
  body('email').isEmail().withMessage('invalid_email'),
  body('password').isLength({ min: 6 }).withMessage('password_too_short'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, name, passwordHash: hash });

      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      console.error('register error', err);
      res.status(500).json({ error: 'register_failed' });
    }
  }
);

// ---------- Login ----------
router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      console.error('login error', err);
      res.status(500).json({ error: 'login_failed' });
    }
  }
);

// ---------- Middleware to protect routes ----------
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no_auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid_auth' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { router, requireAuth };
