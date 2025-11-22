// backend/routes/profile.js
const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('./auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -tokens');
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'profile_error' });
  }
});

module.exports = router;
