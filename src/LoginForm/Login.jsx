import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaRegEye, FaRegEyeSlash,  FaArrowLeft } from 'react-icons/fa';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';

function Login({ onSignUpClick, onLoginSuccess , onBackClick}) {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Sign out any existing Firebase session when login page loads
    signOut(auth).catch(() => {});
  }, []);

  

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSignIn = async () => {
    setError('');
    const typedEmail = Email.trim().toLowerCase();
    const typedPassword = Password;
    if (!typedEmail || !typedPassword) return setError('Email and password required');

    try {
  const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: typedEmail, password: typedPassword })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed');
      // store user and token locally for header/auth state and notify listeners
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('token', data.token);
        // include token in the event detail so listeners can access it immediately
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: data.user, token: data.token } }));
      } catch (e) {
        console.warn('localStorage set failed', e);
      }
      if (typeof onLoginSuccess === 'function') onLoginSuccess(data.user);
      // navigate to dashboard after successful login
      try {
        navigate('/dashboard');
      } catch (e) {}
    } catch (err) {
      console.error('login error', err);
      setError('Network error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  // Google sign-in handler (functional)
  const handleGoogle = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Send Firebase user data to backend
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });
      
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Firebase sync failed');
      
      // Store user and token locally
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('token', data.token);
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: data.user, token: data.token } }));
      
      if (typeof onLoginSuccess === 'function') onLoginSuccess(data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-in error', err);
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="login-wrapper">

    

      <div className="login-box">
        
        <div className="login-top">
          {/* header removed - keep form only */}
          <h2>PC Planner</h2>
          <h3>Sign in to your Account</h3>
          <p>Enter your email and password to access your PC builds and recommendations</p>

          <label>Email</label>
          <div className="emailInput">
            <input
            className='email'
              type="email"
              placeholder="Enter your email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              required
            />
          </div>

          <label>Password</label>
          <div className="passwordInput">
            <input
              className='password'
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              required
            />
            {Password && (
              <button
                type="button"
                className="toggle-button-icon"
                onClick={togglePassword}
              >
                {showPassword ? <FaRegEye />:<FaRegEyeSlash />}
              </button>
            )}
          </div>

          {error && <p style={{ color: 'red', fontSize: '15px' }}>{error}</p>}

          <div className="forgot">
            <a onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer', color: '#9fd7ff' }}>Forgot Password?</a>
          </div>

          <button className="signin-btn" onClick={handleSignIn}>Sign In</button>

          <div className="divider">Or login with</div>

          <div className="socials">
            <button className="google-button" type="button" onClick={handleGoogle}>
              <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
            </button>
            <button className="facebook" type="button">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
            </button>
            <button className="twitter" type="button">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
            </button>
          </div>
        </div>

        <p className="signIn">
          Don’t have an account?{' '}
          <a
            className="signUp-link"
            onClick={onSignUpClick}
            style={{ cursor: 'pointer', color: '#21b8f3ff' }}
          >
            Sign Up
          </a>
        </p>
        <div className='back-home'>
          <button className='home-button' onClick={onBackClick}>
            <FaArrowLeft style={{ marginRight: '8px' }} />
          
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
