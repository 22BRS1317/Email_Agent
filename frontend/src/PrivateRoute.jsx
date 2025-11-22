// src/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
export default function PrivateRoute({ children }){
  const { user, ready } = useAuth();
  if(!ready) return <div style={{padding:20}}>Checking auth...</div>;
  if(!user) return <Navigate to="/login" replace />;
  return children;
}
