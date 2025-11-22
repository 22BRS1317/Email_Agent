// src/pages/OAuthSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess(){
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing...');

  useEffect(()=>{
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const token = hash.split('=')[1];
      localStorage.setItem('token', token);
      nav('/');
      return;
    }

    // Handle Gmail OAuth callback
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const errorMessage = searchParams.get('message');

    if (provider === 'google') {
      if (status === 'success') {
        setMessage('Gmail connected successfully! Redirecting...');
        setTimeout(() => nav('/'), 2000);
      } else {
        setMessage(`Error: ${errorMessage || 'Failed to connect Gmail'}`);
        setTimeout(() => nav('/'), 3000);
      }
    } else {
      nav('/');
    }
  }, [nav, searchParams]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 18, marginBottom: 12 }}>{message}</div>
      <div style={{ color: '#666' }}>Please wait...</div>
    </div>
  );
}
