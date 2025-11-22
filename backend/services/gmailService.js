// backend/services/gmailService.js
const { google } = require('googleapis');

/**
 * Get Gmail OAuth2 client
 */
function getGmailClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetch list of emails from Gmail
 * @param {string} accessToken - Gmail access token
 * @param {number} maxResults - Maximum number of emails to fetch (default: 50)
 * @returns {Promise<Array>} List of email summaries
 */
async function fetchEmailList(accessToken, maxResults = 50) {
  try {
    const gmail = getGmailClient(accessToken);
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox' // Only fetch inbox emails
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }

    // Fetch full details for each message
    const emailPromises = response.data.messages.slice(0, maxResults).map(async (msg) => {
      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });

        return parseGmailMessage(fullMessage.data);
      } catch (err) {
        console.error(`Error fetching message ${msg.id}:`, err.message);
        return null;
      }
    });

    const emails = await Promise.all(emailPromises);
    return emails.filter(email => email !== null);
  } catch (err) {
    console.error('Error fetching Gmail emails:', err);
    throw new Error(`Failed to fetch Gmail emails: ${err.message}`);
  }
}

/**
 * Parse Gmail message format into our email format
 */
function parseGmailMessage(gmailMessage) {
  const headers = gmailMessage.payload.headers;
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let body = '';
  if (gmailMessage.payload.body?.data) {
    body = Buffer.from(gmailMessage.payload.body.data, 'base64').toString('utf-8');
  } else if (gmailMessage.payload.parts) {
    // Try to find text/plain or text/html part
    for (const part of gmailMessage.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
        // Fallback to HTML if no plain text
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // Simple HTML to text conversion (remove tags)
        body = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      }
    }
  }

  return {
    gmailId: gmailMessage.id,
    sender: getHeader('From'),
    subject: getHeader('Subject'),
    body: body || '(No content)',
    timestamp: new Date(parseInt(gmailMessage.internalDate))
  };
}

/**
 * Get Gmail OAuth2 URL for authorization
 */
function getAuthUrl(redirectUri, state = null) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly'
  ];

  const options = {
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  };

  if (state) {
    options.state = state;
  }

  return oauth2Client.generateAuthUrl(options);
}

/**
 * Exchange authorization code for tokens
 */
async function getTokensFromCode(code, redirectUri) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

module.exports = {
  fetchEmailList,
  parseGmailMessage,
  getAuthUrl,
  getTokensFromCode
};

