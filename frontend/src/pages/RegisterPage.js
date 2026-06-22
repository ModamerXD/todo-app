import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (form.password !== form.confirm) return 'Passwords do not match.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter.';
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) {
        setError(details.map(d => d.message).join(' '));
      } else {
        setError(err.response?.data?.error || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">✓</div>
      <h1 className="auth-title">Create account</h1>
      <p className="auth-subtitle">Start managing your tasks</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={form.username}
            onChange={handleChange}
            placeholder="your_username"
            minLength={3}
            maxLength={50}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={handleChange}
            placeholder="Repeat password"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button className="link-btn" onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}
