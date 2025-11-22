// src/api.js
// Hardcoded backend URL for production deployment
const BASE = 'https://email-agent-vxc5.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

async function authFetch(path, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  // optional: auto-logout on 401
  if (res.status === 401) {
    localStorage.removeItem('token');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// public fetch (no auth)
async function publicFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { ...opts });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

/* Emails & prompts */
export async function fetchEmails() { return authFetch('/emails'); }
export async function importEmail(payload) { return authFetch('/emails/import', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); }
export async function fetchEmail(id) { return authFetch(`/emails/${id}`); }
export async function processEmail(id) { return authFetch(`/emails/${id}/process`, { method: 'POST' }); }
export async function saveDraft(payload) { return authFetch('/emails/save-draft', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); }

export async function fetchPrompts() { return authFetch('/prompts'); }
export async function savePrompts(payload) { return authFetch('/prompts', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); }

/* Auth endpoints (public) */
export async function register(payload) { return publicFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); }
export async function login(payload) { return publicFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); }

/* Profile */
export async function fetchProfile() { return authFetch('/profile'); }

/* Gmail endpoints */
export async function getGmailAuthUrl() { return authFetch('/gmail/auth-url'); }
export async function fetchGmailEmails(maxResults = 50) { return authFetch(`/gmail/emails?maxResults=${maxResults}`); }
export async function checkGmailStatus() { return authFetch('/gmail/status'); }
export async function importEmailBatch(emails) { return authFetch('/emails/import-batch', { method: 'POST', body: JSON.stringify({ emails }), headers: { 'Content-Type': 'application/json' } }); }

export default { fetchEmails, importEmail, importEmailBatch, fetchEmail, processEmail, fetchPrompts, savePrompts, saveDraft, register, login, fetchProfile, getGmailAuthUrl, fetchGmailEmails, checkGmailStatus };
