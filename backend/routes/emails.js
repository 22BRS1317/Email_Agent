const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileStore');
const { chatCompletion } = require('../services/groqClient');
const { requireAuth } = require('./auth');
const Email = require('../models/Email');
const { randomUUID } = require('crypto');

const router = express.Router();
const PROMPTS_FILE = path.join(__dirname, '..', 'data', 'prompts.json');

/**
 * GET /api/emails
 * Returns list of emails for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const emails = await Email.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .lean();
    
    // Convert MongoDB _id to id for frontend compatibility
    const formattedEmails = emails.map(email => ({
      id: email._id.toString(),
      ...email,
      _id: undefined
    }));
    
    res.json(formattedEmails);
  } catch (err) {
    console.error('Error fetching emails:', err);
    res.status(500).json({ error: 'failed to fetch emails', details: err.message });
  }
});

/**
 * POST /api/emails/import
 * Adds a new email (from Gmail or manual entry) to the user's inbox in database
 */
router.post('/import', requireAuth, async (req, res) => {
  try {
    const { subject, body, sender, timestamp, gmailId } = req.body || {};
    if (!subject || !body || !sender) {
      return res.status(400).json({ error: 'sender, subject and body are required' });
    }

    // Check if email with same gmailId already exists for this user
    if (gmailId) {
      const existing = await Email.findOne({ userId: req.user.id, gmailId });
      if (existing) {
        return res.status(400).json({ error: 'Email already imported', email: existing });
      }
    }

    const newEmail = await Email.create({
      userId: req.user.id,
      gmailId: gmailId || null,
      sender: sender.trim(),
      subject: subject.trim(),
      body: body.trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      thread: [],
      category: null,
      action_items: null,
      draft: null
    });

    console.log('Email imported successfully to database:', newEmail._id);
    
    // Format for frontend
    const formatted = {
      id: newEmail._id.toString(),
      ...newEmail.toObject(),
      _id: undefined
    };
    
    res.status(201).json(formatted);
  } catch (err) {
    console.error('import email failed', err);
    res.status(500).json({ error: 'import_failed', details: err.message });
  }
});

/**
 * POST /api/emails/import-batch
 * Import multiple emails at once (from Gmail selection)
 */
router.post('/import-batch', requireAuth, async (req, res) => {
  try {
    const { emails: emailsToImport } = req.body || {};
    if (!Array.isArray(emailsToImport) || emailsToImport.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }

    const userId = req.user.id;
    const imported = [];
    const skipped = [];

    for (const emailData of emailsToImport) {
      const { subject, body, sender, timestamp, gmailId } = emailData;
      if (!subject || !body || !sender) {
        skipped.push({ email: emailData, reason: 'Missing required fields' });
        continue;
      }

      // Check if already imported
      if (gmailId) {
        const existing = await Email.findOne({ userId, gmailId });
        if (existing) {
          skipped.push({ email: emailData, reason: 'Already imported' });
          continue;
        }
      }

      try {
        const newEmail = await Email.create({
          userId,
          gmailId: gmailId || null,
          sender: sender.trim(),
          subject: subject.trim(),
          body: body.trim(),
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          thread: [],
          category: null,
          action_items: null,
          draft: null
        });

        imported.push({
          id: newEmail._id.toString(),
          ...newEmail.toObject(),
          _id: undefined
        });
      } catch (err) {
        skipped.push({ email: emailData, reason: err.message });
      }
    }

    res.status(201).json({ 
      imported: imported.length, 
      skipped: skipped.length,
      emails: imported,
      skippedDetails: skipped
    });
  } catch (err) {
    console.error('batch import failed', err);
    res.status(500).json({ error: 'batch_import_failed', details: err.message });
  }
});

/**
 * GET /api/emails/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!email) return res.status(404).json({ error: 'not found' });
    
    const formatted = {
      id: email._id.toString(),
      ...email,
      _id: undefined
    };
    
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching email:', err);
    res.status(500).json({ error: 'failed to fetch email', details: err.message });
  }
});

/**
 * POST /api/emails/:id/process
 * Runs categorization + action extraction + draft generation using stored prompts and Groq
 */
router.post('/:id/process', requireAuth, async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.user.id });
    if (!email) return res.status(404).json({ error: 'email not found' });

    const prompts = await readJSON(PROMPTS_FILE);

    // 1) Categorize
    const catMessages = [
      { role: 'system', content: prompts.categorization || '' },
      { role: 'user', content: `Email:\nSubject: ${email.subject}\nBody:\n${email.body}` }
    ];
    const category = await chatCompletion({ messages: catMessages });

    // 2) Extract action items
    const actionMessages = [
      { role: 'system', content: prompts.action_item || '' },
      { role: 'user', content: `Email:\n${email.body}\n\nReturn valid JSON as instructed.` }
    ];
    const actionRaw = await chatCompletion({ messages: actionMessages });

    // 3) Draft reply
    const replyMessages = [
      { role: 'system', content: prompts.auto_reply || '' },
      { role: 'user', content: `Reply to this email:\nSubject: ${email.subject}\nBody:\n${email.body}` }
    ];
    const draft = await chatCompletion({ messages: replyMessages });

    // Save results back to database
    email.category = (category || '').trim();
    try {
      email.action_items = JSON.parse(actionRaw);
    } catch (e) {
      email.action_items = { raw: actionRaw };
    }
    email.draft = {
      subject: `Re: ${email.subject}`,
      body: draft,
      savedAt: new Date()
    };

    await email.save();

    const formatted = {
      id: email._id.toString(),
      ...email.toObject(),
      _id: undefined
    };

    res.json({ 
      category: formatted.category, 
      action_items: formatted.action_items, 
      draft: formatted.draft 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'processing failed', details: err.message });
  }
});

/**
 * POST /api/emails/save-draft
 * Save user edited draft (keeps draft only, does not send)
 * body: {id, subject, body}
 */
router.post('/save-draft', requireAuth, async (req, res) => {
  try {
    const { id, subject, body } = req.body;
    const email = await Email.findOne({ _id: id, userId: req.user.id });
    if (!email) return res.status(404).json({ error: 'email not found' });
    
    email.draft = { 
      subject, 
      body, 
      savedAt: new Date() 
    };
    await email.save();
    
    res.json({ ok: true, draft: email.draft });
  } catch (err) {
    console.error('Error saving draft:', err);
    res.status(500).json({ error: 'failed to save draft', details: err.message });
  }
});

module.exports = router;
