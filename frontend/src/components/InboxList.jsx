import React from 'react';

const itemStyle = {
  padding: 12,
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

export default function InboxList({ emails = [], selectedId, onOpen }) {
  if (!emails.length) {
    return <div style={{ padding: 12, color: '#666' }}>Inbox is empty.</div>;
  }

  return (
    <div>
      {emails.map((email) => {
        const active = email.id === selectedId;
        return (
          <div
            key={email.id}
            style={{
              ...itemStyle,
              background: active ? '#eef4ff' : 'transparent',
              fontWeight: active ? 600 : 400
            }}
            onClick={() => onOpen(email.id)}
          >
            <div>{email.subject}</div>
            <div style={{ fontSize: 13, color: '#444' }}>{email.sender}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {email.timestamp
                ? new Date(email.timestamp).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })
                : '—'}
              {email.category ? ` · ${email.category}` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
