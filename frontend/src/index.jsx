// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="color:red;padding:20px;">No #root element found</div>';
} else {
  const root = createRoot(rootEl);
  root.render(<App />);
}
