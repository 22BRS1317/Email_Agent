// backend/routes/gmail.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('./auth');
const User = require('../models/User');
const { getAuthUrl, getTokensFromCode, fetchEmailList } = require('../services/gmailService');

const router = express.Router();

/**
 * GET /api/gmail/auth-url
 * Get Gmail OAuth authorization URL
 */
router.get('/auth-url', requireAuth, (req, res) => {
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/gmail/callback`;

    // Include JWT token in state parameter so we can identify user in callback
    const state = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    const authUrl = getAuthUrl(redirectUri, state);
    res.json({ authUrl });
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ error: 'failed to generate auth URL', details: err.message });
  }
});

/**
 * GET /api/gmail/callback
 * Handle OAuth callback and store tokens
 * Note: This route needs to get user ID from state parameter or session
 * For now, we'll use a state parameter with JWT token
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Extract user ID from state (state should contain JWT token)
    let userId = null;
    if (state) {
      try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        console.error('Invalid state token:', e);
      }
    }

    if (!userId) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/oauth-success?provider=google&status=error&message=${encodeURIComponent('User session expired. Please login again.')}`);
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/gmail/callback`;
    const tokens = await getTokensFromCode(code, redirectUri);

    // Store tokens in user document
    const user = await User.findById(userId);
    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/oauth-success?provider=google&status=error&message=${encodeURIComponent('User not found')}`);
    }

    // Remove existing Google token if any
    user.tokens = user.tokens.filter(t => t.provider !== 'google');

    // Add new Google token
    user.tokens.push({
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date
    });

    await user.save();

    // Redirect to frontend with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth-success?provider=google&status=success`);
  } catch (err) {
    console.error('Error in Gmail callback:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth-success?provider=google&status=error&message=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/gmail/emails
 * Fetch emails from user's Gmail account
 */
router.get('/emails', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const googleToken = user.tokens.find(t => t.provider === 'google');
    if (!googleToken || !googleToken.access_token) {
      return res.status(401).json({ error: 'Gmail not connected. Please connect your Gmail account first.' });
    }

    const maxResults = parseInt(req.query.maxResults) || 50;
    // Pass refresh token to allow auto-refresh if access token is expired
    const emails = await fetchEmailList(googleToken.access_token, googleToken.refresh_token, maxResults);

    res.json({ emails, count: emails.length });
  } catch (err) {
    console.error('Error fetching Gmail emails:', err);
    if (err.message === 'UNAUTHENTICATED' || err.message.includes('UNAUTHENTICATED')) {
      return res.status(401).json({ error: 'Gmail authentication failed. Please reconnect your account.' });
    }
    res.status(500).json({ error: 'failed to fetch Gmail emails', details: err.message });
  }
});

/**
 * GET /api/gmail/status
 * Check if user has Gmail connected
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const googleToken = user.tokens.find(t => t.provider === 'google');
    const connected = !!(googleToken && googleToken.access_token);

    res.json({ connected, email: user.email });
  } catch (err) {
    console.error('Error checking Gmail status:', err);
    res.status(500).json({ error: 'failed to check Gmail status', details: err.message });
  }
});

module.exports = router;

