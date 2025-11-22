const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileStore');
const { requireAuth } = require('./auth');

const router = express.Router();
const PROMPTS_FILE = path.join(__dirname, '..', 'data', 'prompts.json');

router.get('/', requireAuth, async (req, res) => {
  try {
    const p = await readJSON(PROMPTS_FILE);
    res.json(p);
  } catch (err) {
    console.error('Error fetching prompts:', err);
    // Return default prompts if file doesn't exist
    const defaultPrompts = {
      categorization: "Categorize emails into: Important, Newsletter, Spam, To-Do. To-Do means a direct request requiring user action. Respond with a single category string.",
      action_item: "Extract action items from the email. Respond JSON array of objects [{\"task\":\"...\",\"deadline\":\"...\"}] or [] if none.\n",
      auto_reply: "Draft a polite reply. Use sender name if available. Keep reply concise and ask clarifying questions if needed."
    };
    res.json(defaultPrompts);
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const newPrompts = req.body;
    if (!newPrompts || typeof newPrompts !== 'object') {
      return res.status(400).json({ error: 'Invalid prompts data' });
    }
    await writeJSON(PROMPTS_FILE, newPrompts);
    res.json({ ok: true, prompts: newPrompts });
  } catch (err) {
    console.error('Error saving prompts:', err);
    res.status(500).json({ error: 'failed to save prompts', details: err.message });
  }
});

module.exports = router;
