// src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchProfile } from './api';

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function loadUser(){
    const token = localStorage.getItem('token');
    if(!token){ setUser(null); setReady(true); return; }
    try {
      const resp = await fetchProfile(); // may throw if no valid token
      setUser(resp.user || resp);
    } catch (err) {
      console.warn('Auth load failed', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally { setReady(true); }
  }

  useEffect(()=>{ loadUser(); }, []);

  const login = (token, userObj) => { if(token) localStorage.setItem('token', token); setUser(userObj||null); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(){ const ctx = useContext(AuthContext); if(!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx; }
