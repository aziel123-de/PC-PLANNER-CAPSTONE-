import { useState } from "react";
import { FaRegEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
import './SignUp.css';

function SignUp({ onLoginClick }) {
  const [Fullname, setFullName] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasMinLength = Password.length >= 8;
    const hasLowerCase = /[a-z]/.test(Password);
    const hasUpperCase = /[A-Z]/.test(Password);
    const hasNumber = /[0-9]/.test(Password);
    const hasSpecialChar = /[@#$]/.test(Password);

    if (!hasMinLength || !hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      setShowPasswordRequirements(true);
      return;
    }
    setPasswordError('');

    if (Password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    setConfirmPasswordError('');

    if (!Fullname || !Email || !Password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (!Email.includes('@')) {
      setEmailError('Enter a valid email');
      return;
    }
    setEmailError('');

    try {
      // create user with backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: Email.trim().toLowerCase(), username: Fullname, password: Password })
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'unexpected server response' };
      }

      if (response.ok) {
        alert(`Account created for: ${Fullname}`);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        if (typeof onLoginClick === 'function') onLoginClick();
      } else {
        alert(`Error: ${data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      alert('Network Error: ' + (error.message || error));
    }
  };

  return (
    <div className="SignUp-wrapper">
      
      <form onSubmit={handleSubmit} className="signup-box">
        <div className="back-home">
          <button
            type="button"
            className="home-button"
            onClick={() => {
              if (typeof onLoginClick === 'function') onLoginClick();
              else if (window && window.history) window.history.back();
            }}
            aria-label="Go back"
          >
            <FaArrowLeft aria-hidden="true" style={{ marginRight: '8px' }} />
          </button>
        </div>
        <h2>PC Planner</h2>
        <h3>Create an Account</h3>
        <p>Sign up to save your PC Builds and get personalized recommendations</p>

        {/* Full Name */}
        <label>Full Name</label>
        <div className="fullNameInput">
          <input
            type="text"
            placeholder="Enter your full name"
            value={Fullname}
            onChange={(e) => setFullName(e.target.value)}
            
          />
        </div>

        {/* Email */}
        <label>Email</label>
        {emailError && <p style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>{emailError}</p>}
        <div className="E_Input">
          <input
            type="email"
            placeholder="Enter your email"
            value={Email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
        
          />
        </div>

        {/* Password */}
        <div className="Pass-btn">
          <label>Password</label>
          <div className="Pass_Input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={Password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                setShowPasswordRequirements(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const hasMinLength = Password.length >= 8;
                  const hasLowerCase = /[a-z]/.test(Password);
                  const hasUpperCase = /[A-Z]/.test(Password);
                  const hasNumber = /[0-9]/.test(Password);
                  const hasSpecialChar = /[@#$]/.test(Password);
                  if (!hasMinLength || !hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
                    setShowPasswordRequirements(true);
                  }
                }
              }}

              style={{ paddingRight: Password ? '36px' : undefined }}
             
            />
            {Password && (
              <button
                type="button"
                className="toggle-button-icon"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password"
              >
                {showPassword ? <FaRegEye style={{ color: "black" }} /> : <FaRegEyeSlash style={{ color: "black" }} />}
              </button>
            )}
          </div>
          {showPasswordRequirements && (
            <div style={{ backgroundColor: '#f0f0f0', padding: '2px', borderRadius: '2px', marginTop: '2px', fontSize: '8px', maxWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1px 0' }}>
                <span style={{ color: Password.length >= 8 ? 'green' : 'gray', marginRight: '2px' }}>✓</span>
                <span style={{ color: Password.length >= 8 ? 'green' : 'gray' }}>Minimum 8 characters in length</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1px 0' }}>
                <span style={{ color: /[a-z]/.test(Password) ? 'green' : 'gray', marginRight: '2px' }}>✓</span>
                <span style={{ color: /[a-z]/.test(Password) ? 'green' : 'gray' }}>At least one lower case letter (a-z)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1px 0' }}>
                <span style={{ color: /[A-Z]/.test(Password) ? 'green' : 'gray', marginRight: '2px' }}>✓</span>
                <span style={{ color: /[A-Z]/.test(Password) ? 'green' : 'gray' }}>At least one upper case letter (A-Z)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1px 0' }}>
                <span style={{ color: /[0-9]/.test(Password) ? 'green' : 'gray', marginRight: '2px' }}>✓</span>
                <span style={{ color: /[0-9]/.test(Password) ? 'green' : 'gray' }}>At least one number (0-9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1px 0' }}>
                <span style={{ color: /[@#$]/.test(Password) ? 'green' : 'gray', marginRight: '2px' }}>✓</span>
                <span style={{ color: /[@#$]/.test(Password) ? 'green' : 'gray' }}>At least one special character (@# $)</span>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <label>Confirm Password</label>
          {confirmPasswordError && <p style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>{confirmPasswordError}</p>}
          <div className="Confirm_Input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              style={{ paddingRight: confirmPassword ? '36px' : undefined }}
             
            />
            {confirmPassword && (
              <button
                type="button"
                className="toggle-button-icon"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Toggle confirm password"
              >
                 {showConfirmPassword ? <FaRegEye style={{ color: "black" }} /> : <FaRegEyeSlash style={{ color: "black" }} />}
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="signUp-btn">
          Sign Up
        </button>

        {/* Switch to Login */}
        <p className="signUp">
          Already have an Account?{' '}
          <a className="signUp-link" onClick={onLoginClick} style={{ cursor: 'pointer', color: '#2196f3' }}>
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
