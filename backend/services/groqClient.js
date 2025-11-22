// backend/services/groqClient.js
const axios = require('axios');

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

if (!GROQ_KEY) {
  console.warn('GROQ_API_KEY not set — Groq calls will fail until you set it.');
}

async function tryRequest(payload, url, headers, timeout = 30000) {
  try {
    console.log('Sending request payload:', JSON.stringify(payload, null, 2));
    const resp = await axios.post(url, payload, { headers, timeout });
    console.log('Groq response status:', resp.status);
    console.log('Groq response data (truncated):', typeof resp.data === 'string' ? resp.data.slice(0, 1000) : JSON.stringify(resp.data).slice(0,1000));
    return resp;
  } catch (err) {
    // Attach structured info for debugging
    const info = {
      message: err.message,
      status: err.response?.status,
      responseData: err.response?.data,
      requestData: payload
    };
    // Log full info (safe to inspect locally; don't paste your API key into public logs)
    console.error('Groq request failed:', JSON.stringify(info, null, 2));
    throw info;
  }
}

/**
 * Send a chat-style request to Groq with a few fallback payload shapes.
 * messages: [{role: 'system'|'user'|'assistant', content: '...'}]
 */
async function chatCompletion({ messages = [], model = DEFAULT_MODEL, max_tokens = 800 }) {
  const url = `${GROQ_BASE}/chat/completions`;
  const headers = {
    Authorization: `Bearer ${GROQ_KEY}`,
    'Content-Type': 'application/json'
  };

  const variants = [
    // Variant A: plain OpenAI-compatible chat + max_tokens
    { model, messages, max_tokens },
    // Variant B: chat without max
    { model, messages },
    // Variant C: try 'max_completion_tokens' if API expects that
    { model, messages, max_completion_tokens: max_tokens },
    // Variant D: fallback to 'input' field with concatenated messages (older style)
    { model, input: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') }
  ];

  let lastError = null;
  for (const payload of variants) {
    try {
      const resp = await tryRequest(payload, url, headers, 60000);
      // normalize response
      if (resp.data && Array.isArray(resp.data.choices) && resp.data.choices[0]) {
        const choice = resp.data.choices[0];
        if (choice.message && (choice.message.content || choice.message.content_raw)) {
          return choice.message.content || choice.message.content_raw;
        }
        if (choice.text) return choice.text;
        return JSON.stringify(choice);
      }
      // if response shape different, return full data as string
      return JSON.stringify(resp.data);
    } catch (errInfo) {
      lastError = errInfo;
      // try next payload variant
    }
  }

  // If we got here, all attempts failed — throw the last error for caller
  const e = new Error('All Groq request variants failed');
  e.details = lastError;
  console.error('All Groq variants failed. Details:', JSON.stringify(lastError, null, 2));
  throw e;
}

module.exports = { chatCompletion };
