import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">✓</div>
        <p>Loading…</p>
      </div>
    );
  }

  if (user) return <Dashboard />;

  return (
    <div className="auth-layout">
      <div className="auth-bg" />
      {showRegister
        ? <RegisterPage onSwitch={() => setShowRegister(false)} />
        : <LoginPage    onSwitch={() => setShowRegister(true)} />
      }
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
