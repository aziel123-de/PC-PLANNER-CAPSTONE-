import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setMsg('');
    if (!email || !email.includes('@')) return setMsg('Please enter a valid email');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Failed to send reset link');
      else setMsg(data.message || 'Password reset link has been sent to your email.');
    } catch (err) {
      console.error('forgot submit', err);
      setMsg('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-box">
        <button className="fp-back" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <h2>Reset Your Password</h2>
        <p className="fp-desc">Enter your email and we'll send a link to reset your password.</p>
        <div className="fp-field">
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label="Email address"
          />
        </div>
        {msg && <p className="fp-msg">{msg}</p>}
        <div className="fp-cta">
          <button className="fp-submit" onClick={submit} disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </div>
      </div>
    </div>
  );
}
