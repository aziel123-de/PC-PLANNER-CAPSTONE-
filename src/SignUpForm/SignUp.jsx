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
  const [showEmailError, setShowEmailError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] = useState(false);
  const [showEmailExistsDialog, setShowEmailExistsDialog] = useState(false);
  const [showAccountCreatedDialog, setShowAccountCreatedDialog] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Fullname) {
      setShowNameError(true);
      return;
    }
    setShowNameError(false);

    if (!Email.includes('@')) {
      setShowEmailError(true);
      return;
    }
    setShowEmailError(false);

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
      setShowConfirmPasswordError(true);
      return;
    }
    setShowConfirmPasswordError(false);

    let hasErrors = false;

    if (!Fullname) {
      setShowNameError(true);
      hasErrors = true;
    } else {
      setShowNameError(false);
    }

    if (!Email.includes('@')) {
      setShowEmailError(true);
      hasErrors = true;
    } else {
      setShowEmailError(false);
    }

    if (!hasMinLength || !hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      setShowPasswordRequirements(true);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    if (!Email || !Password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    

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
        setShowAccountCreatedDialog(true);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        if (data.error && data.error.includes('already')) {
          setShowEmailExistsDialog(true);
        } else {
          alert(`Error: ${data.error || JSON.stringify(data)}`);
        }
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
            onChange={(e) => {
              setFullName(e.target.value);
              setShowNameError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!Fullname.trim()) {
                  setShowNameError(true);
                }
              }
            }}
            
          />
        </div>
        {showNameError && (
          <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '5px', marginTop: '5px', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
            <span style={{ color: 'orange', marginRight: '5px' }}>⚠</span>
            <span style={{ color: 'black' }}>Enter your full name</span>
          </div>
        )}

        {/* Email */}
        <label>Email</label>
        <div className="E_Input">
          <input
            type="text"
            placeholder="Enter your email"
            value={Email}
            onChange={(e) => {
              setEmail(e.target.value);
              setShowEmailError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!Email.includes('@')) {
                  setShowEmailError(true);
                }
              }
            }}
        
          />
        </div>
        {showEmailError && (
          <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '5px', marginTop: '5px', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
            <span style={{ color: 'orange', marginRight: '5px' }}>⚠</span>
            <span style={{ color: 'black' }}>Enter valid email</span>
          </div>
        )}

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
          <div className="Confirm_Input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setShowConfirmPasswordError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (Password !== confirmPassword) {
                    setShowConfirmPasswordError(true);
                  }
                }
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
          {showConfirmPasswordError && (
            <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '5px', marginTop: '5px', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
              <span style={{ color: 'orange', marginRight: '5px' }}>⚠</span>
              <span style={{ color: 'black' }}>Passwords do not match</span>
            </div>
          )}
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
      
      {showEmailExistsDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Email Already Registered</h3>
            <p>That email's already in use. Try another one or sign in.</p>
            <button
              onClick={() => setShowEmailExistsDialog(false)}
              className="dialog-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {showAccountCreatedDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Account Created Successfully!</h3>
            <p>Your account has been created. You can now sign in with your credentials.</p>
            <button 
              onClick={() => {
                setShowAccountCreatedDialog(false);
                if (typeof onLoginClick === 'function') onLoginClick();
              }}
              className="dialog-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;
