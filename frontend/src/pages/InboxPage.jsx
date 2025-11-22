// src/pages/InboxPage.jsx
import React, { useEffect, useState } from 'react';
import InboxList from '../components/InboxList';
import EmailView from '../components/EmailView';
import PromptEditor from '../components/PromptEditor';
import {
  fetchEmails,
  fetchEmail,
  fetchPrompts,
  processEmail,
  saveDraft,
  savePrompts,
  getGmailAuthUrl,
  fetchGmailEmails,
  checkGmailStatus,
  importEmailBatch
} from '../api';

function errorMessage(err) {
  if (!err) return 'Something went wrong';
  if (err.data?.error) return err.data.error;
  if (typeof err === 'string') return err;
  return err.message || 'Request failed';
}

export default function InboxPage() {
  const [emails, setEmails] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPrompts, setSavingPrompts] = useState(false);
  const [message, setMessage] = useState(null);

  // Gmail states
  const [gmailConnected, setGmailConnected] = useState(false);
  const [checkingGmail, setCheckingGmail] = useState(true);
  const [showGmailSelector, setShowGmailSelector] = useState(false);
  const [gmailEmails, setGmailEmails] = useState([]);
  const [selectedGmailEmails, setSelectedGmailEmails] = useState(new Set());
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [importingGmail, setImportingGmail] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    setLoading(true);
    setMessage(null);
    try {
      const [emailData, promptData, gmailStatus] = await Promise.all([
        fetchEmails(),
        fetchPrompts(),
        checkGmailStatus().catch(() => ({ connected: false }))
      ]);
      setEmails(emailData);
      setPrompts(promptData);
      setGmailConnected(gmailStatus.connected || false);
      if (emailData.length) {
        await handleSelect(emailData[0].id, emailData[0]);
      } else {
        setSelectedId(null);
        setSelectedEmail(null);
      }
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setLoading(false);
      setCheckingGmail(false);
    }
  }

  async function handleConnectGmail() {
    try {
      const { authUrl } = await getGmailAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  async function handleLoadGmailEmails() {
    setLoadingGmail(true);
    setMessage(null);
    try {
      const { emails: gmailList } = await fetchGmailEmails(50);
      setGmailEmails(gmailList);
      setShowGmailSelector(true);
      setSelectedGmailEmails(new Set());
    } catch (err) {
      setMessage(errorMessage(err));
      if (err.status === 401 || (err.data && err.data.error && err.data.error.includes('authentication failed'))) {
        setGmailConnected(false);
      }
    } finally {
      setLoadingGmail(false);
    }
  }

  async function handleImportSelectedGmailEmails() {
    if (selectedGmailEmails.size === 0) {
      setMessage('Please select at least one email to import');
      return;
    }

    setImportingGmail(true);
    setMessage(null);
    try {
      const emailsToImport = Array.from(selectedGmailEmails).map(id => {
        const email = gmailEmails.find(e => e.gmailId === id);
        return {
          sender: email.sender,
          subject: email.subject,
          body: email.body,
          timestamp: email.timestamp,
          gmailId: email.gmailId
        };
      });

      const result = await importEmailBatch(emailsToImport);
      setMessage(`Successfully imported ${result.imported} email(s)`);
      setShowGmailSelector(false);
      setSelectedGmailEmails(new Set());
      setGmailEmails([]);

      // Refresh inbox
      await bootstrap();
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setImportingGmail(false);
    }
  }

  function toggleGmailEmailSelection(gmailId) {
    const newSet = new Set(selectedGmailEmails);
    if (newSet.has(gmailId)) {
      newSet.delete(gmailId);
    } else {
      newSet.add(gmailId);
    }
    setSelectedGmailEmails(newSet);
  }

  async function handleSelect(id, fallback) {
    setSelectedId(id);
    setSelectedEmail(fallback || null);
    try {
      const detailed = await fetchEmail(id);
      setSelectedEmail(detailed);
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  async function handleProcess() {
    if (!selectedId) return;
    setProcessing(true);
    setMessage(null);
    try {
      const result = await processEmail(selectedId);
      setSelectedEmail((prev) => ({ ...(prev || {}), ...result }));
      setEmails((prev) =>
        prev.map((email) =>
          email.id === selectedId ? { ...email, category: result.category } : email
        )
      );
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setProcessing(false);
    }
  }

  async function handleSaveDraft(subject, body) {
    if (!selectedId) return;
    setSavingDraft(true);
    setMessage(null);
    try {
      const resp = await saveDraft({ id: selectedId, subject, body });
      setSelectedEmail((prev) => (prev ? { ...prev, draft: resp.draft } : prev));
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSavePrompts(nextPrompts) {
    setSavingPrompts(true);
    setMessage(null);
    try {
      const resp = await savePrompts(nextPrompts);
      setPrompts(resp.prompts);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setSavingPrompts(false);
    }
  }

  return (
    <div className="main-layout">
      {/* Left Column: Inbox List */}
      <div className="column" style={{ flex: '0 0 320px' }}>
        <div className="column-header">
          <h3 className="column-title">Inbox</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!gmailConnected ? (
              <button
                onClick={handleConnectGmail}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Connect Gmail
              </button>
            ) : (
              <button
                onClick={handleLoadGmailEmails}
                disabled={loadingGmail}
                className="btn btn-success"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: 'var(--success)', color: 'white' }}
              >
                {loadingGmail ? 'Loading...' : 'Import Mail'}
              </button>
            )}
            <button
              onClick={bootstrap}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              {loading ? '...' : '↻'}
            </button>
          </div>
        </div>
        <div className="column-content">
          <InboxList
            emails={emails}
            selectedId={selectedId}
            onOpen={(id) => handleSelect(id, emails.find((e) => e.id === id))}
          />
        </div>
      </div>

      {/* Middle Column: Email View */}
      <div className="column" style={{ flex: 1 }}>
        <div className="column-header">
          <h3 className="column-title">Email Details</h3>
        </div>
        <div className="column-content" style={{ padding: '1.5rem' }}>
          {selectedEmail ? (
            <EmailView
              email={selectedEmail}
              processing={processing}
              savingDraft={savingDraft}
              onProcess={handleProcess}
              onSaveDraft={handleSaveDraft}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-tertiary)',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p>{loading ? 'Loading emails…' : 'Select an email to view details'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Prompts */}
      <div className="column" style={{ flex: '0 0 300px' }}>
        <div className="column-header">
          <h3 className="column-title">AI Prompts</h3>
        </div>
        <div className="column-content" style={{ padding: '1rem' }}>
          {prompts ? (
            <PromptEditor prompts={prompts} saving={savingPrompts} onSave={handleSavePrompts} />
          ) : (
            <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              {loading ? 'Loading prompts…' : 'No prompts found'}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className={`toast ${message.includes('Successfully') ? 'toast-success' : 'toast-error'}`}>
          {message}
        </div>
      )}

      {/* Gmail Selector Modal */}
      {showGmailSelector && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 1000
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 800, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div className="column-header">
              <h3 className="column-title">Select Emails from Gmail</h3>
              <button
                onClick={() => {
                  setShowGmailSelector(false);
                  setSelectedGmailEmails(new Set());
                  setGmailEmails([]);
                }}
                disabled={importingGmail}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {gmailEmails.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>No emails found</div>
              ) : (
                gmailEmails.map((email) => (
                  <div
                    key={email.gmailId}
                    onClick={() => toggleGmailEmailSelection(email.gmailId)}
                    className={`list-item ${selectedGmailEmails.has(email.gmailId) ? 'selected' : ''}`}
                    style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGmailEmails.has(email.gmailId)}
                      onChange={() => toggleGmailEmailSelection(email.gmailId)}
                      style={{ marginTop: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="list-item-title">{email.subject || '(No Subject)'}</div>
                      <div className="list-item-subtitle">
                        <span>{email.sender}</span>
                        <span>{new Date(email.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="list-item-preview">
                        {email.body ? email.body.substring(0, 150) : ''}...
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {selectedGmailEmails.size} of {gmailEmails.length} selected
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setShowGmailSelector(false);
                    setSelectedGmailEmails(new Set());
                    setGmailEmails([]);
                  }}
                  disabled={importingGmail}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSelectedGmailEmails}
                  disabled={importingGmail || selectedGmailEmails.size === 0}
                  className="btn btn-primary"
                >
                  {importingGmail ? 'Importing…' : `Import ${selectedGmailEmails.size} Email(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
