import React, { useEffect, useState } from 'react';

export default function EmailView({ email, processing, savingDraft, onProcess, onSaveDraft }) {
  const [editSub, setEditSub] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    if (!email) return;
    setEditSub(email.draft?.subject || `Re: ${email.subject}`);
    setEditBody(email.draft?.body || '');
  }, [email]);

  return (
    <div>
      <div><strong>{email.subject}</strong></div>
      <div style={{marginTop:8}}>{email.body}</div>
      <div style={{marginTop:12}}>
        <button onClick={onProcess} disabled={processing}>
          {processing ? 'Processing…' : 'Process with Agent'}
        </button>
      </div>

      {email.category && (
        <div style={{marginTop:12}}>
          <h4>Results</h4>
          <div><strong>Category:</strong> {email.category}</div>
          <div><strong>Action Items:</strong><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(email.action_items, null, 2)}</pre></div>
          <div><strong>Draft:</strong>
            <div><em>Subject</em></div>
            <input value={editSub} onChange={e=>setEditSub(e.target.value)} style={{width:'100%'}} />
            <div><em>Body</em></div>
            <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} style={{width:'100%', height:160}} />
            <div style={{marginTop:8}}>
              <button onClick={()=>onSaveDraft(editSub, editBody)} disabled={savingDraft}>
                {savingDraft ? 'Saving…' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
