import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from './UIElements';

export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Authenticating session..." />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children, onOpenAdminModal }) {
  const { user, adminUnlocked, loading } = useAuth();

  if (loading) {
    return <Loading message="Verifying admin credentials..." />;
  }

  // If user has ADMIN role or has unlocked with master passcode, allow access
  if (user?.role === 'ADMIN' || adminUnlocked) {
    return children;
  }

  // Otherwise, render passcode access gate
  return (
    <div className="admin-lock-screen">
      <div className="admin-lock-card">
        <div className="admin-shield-icon">🛡️</div>
        <h2>Enterprise Admin Command Center</h2>
        <p>Restricted Area. Master authorization passcode or Administrator role required.</p>
        <button
          className="btn-primary large full-width"
          onClick={onOpenAdminModal}
        >
          🔑 Enter Admin Master Passcode
        </button>
      </div>
    </div>
  );
}
