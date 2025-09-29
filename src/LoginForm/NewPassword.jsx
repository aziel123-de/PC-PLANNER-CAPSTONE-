import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewPassword.css';

function NewPasswordPage() {
  const navigate = useNavigate();
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (!password || password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    if (!token) { setError('Missing reset token'); return; }
    setBusy(true);
    try {
      const resp = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || resp.statusText);
      }
      // success
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="np-container">
      <form className="np-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="np-desc">Enter your new password. This link will only work if you have a valid reset token.</p>
        {error && <div className="np-error">{error}</div>}
        <label className="np-label">New Password</label>
        <input className="np-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" />
        <label className="np-label">Confirm Password</label>
        <input className="np-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" />

        <div style={{ display: 'flex', gap: '.6rem', marginTop: 12 }}>
          <button className="np-btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Set New Password'}</button>
          <button type="button" className="np-btn secondary" onClick={() => navigate('/login')} disabled={busy}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default NewPasswordPage;
