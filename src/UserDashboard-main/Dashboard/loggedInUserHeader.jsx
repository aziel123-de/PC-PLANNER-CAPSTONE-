import React, { useState, useRef, useEffect } from 'react';
import './loggedInUserHeader.css';
import profDefault from './profDefault.webp';
import logo from '../../HomepageForm/LOGO.png';
import { FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { SiPcgamingwiki } from 'react-icons/si';
import { TbDeviceDesktopCog } from 'react-icons/tb';
import { CgComponents } from 'react-icons/cg';
import { GiBrain } from 'react-icons/gi';
import { ChevronDown, User, Mail, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function LoggedInUserHeader({ isSmallScreen, onClickSettings, onLogout, onClickSignIn, onClickSignUp }) {
  // authUser read from localStorage (matches Header.jsx pattern)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const hamburgerRef = useRef(null);
  const headerNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => setAuthUser(e?.detail || null);
    window.addEventListener('authChanged', handler);
    return () => window.removeEventListener('authChanged', handler);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    // propagate to parent first
    try {
      localStorage.removeItem('user');
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    setOpenDropdown(false);
    setShowConfirm(false);
    setMenuOpen(false);
    if (typeof onLogout === 'function') onLogout();
    navigate('/');
  };

  return (
    <header className="header-bar">
      <div className="header-logo-container">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="LOGO" className="header-logo" />
        </Link>
        <h1 className="header-title">PC Planner</h1>
      </div>

      {isSmallScreen && (
        <button className="hamburger-db" onClick={toggleMenu} ref={hamburgerRef} aria-label="Toggle menu">
          {menuOpen ? <FaTimes size={24} color="#fff" /> : <FaBars size={24} color="#fff" />}
        </button>
      )}

      {/* Desktop Navigation */}
      {!isSmallScreen && (
        <nav className="desktop-nav">
          <Link to="/" className="header-nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/builder" className="header-nav-link" onClick={closeMenu}>PC Builder</Link>
          <Link to="/prebuilt" className="header-nav-link" onClick={closeMenu}>Pre-built PCs</Link>
          <Link to="/components" className="header-nav-link" onClick={closeMenu}>Components</Link>
          <Link to="/learn" className="header-nav-link" onClick={closeMenu}>Learn</Link>

          <div className="header-dropdown" ref={dropdownRef}>
            <button className="header-profile-btn" onClick={() => setOpenDropdown(!openDropdown)}>
              <div className="profile-box">
                <img src={authUser?.profile_picture || authUser?.photoURL || profDefault} alt="Profile" className="header-profile-img" />
                <div className="profile-info">
                  <span className="profile-name">{authUser?.username || authUser?.displayName || ''}</span>
                </div>
                <div className={`dropdown-icon ${openDropdown ? 'rotate' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </button>

            {openDropdown && (
              <div className="header-dropdown-content">
                <div className="dropdown-arrow" />
                <div className="dropdown-header">
                  <img src={authUser?.profile_picture || authUser?.photoURL || profDefault} alt="Profile" className="avatar-img-large" />
                  <div className="user-info">
                    <p className="user-name">{authUser?.username || authUser?.displayName || ''}</p>
                    <p className="user-email">{authUser?.email || ''}</p>
                  </div>
                </div>
                <div className="dropdown-body">
                  <div className="signed-in"><span>Signed in as</span></div>
                  <div className="user-detail">
                    <div className="user-line"><User size={14} /> {authUser?.username || authUser?.displayName || ''}</div>
                    <div className="user-line"><Mail size={12} /> {authUser?.email || ''}</div>
                  </div>
                </div>

                <div className="dropdown-footer">
                  <button className="dropdown-btn" onClick={() => { setOpenDropdown(false); navigate('/dashboard'); }}>
                    <FaHome size={14} style={{ marginRight: 6 }} /> Dashboard
                  </button>
                  <button className="dropdown-btn" onClick={() => { setOpenDropdown(false); onClickSettings && onClickSettings(); navigate('/settings'); }}>
                    <Settings size={14} /> Account Settings
                  </button>
                  <button
                    className="dropdown-btn logout"
                    onClick={() => setShowConfirm(true)}
                  >
                    <LogOut size={14} /> Log Out
                  </button>

                  {showConfirm && (
                    <div className="signout-modal-overlay">
                      <div className="signout-modal-box">
                        <p className="signout-modal-message">Are you sure you want to log out?</p>
                        <div className="signout-modal-actions">
                          <button
                            onClick={handleLogout}
                            className="signout-confirm-btn"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="signout-cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Visual overlay */}
      <div className={`overlay ${menuOpen ? 'show' : ''}`}></div>

      {/* Mobile Navigation */}
      <div className={`slide-down-menu ${menuOpen ? 'show' : ''}`}>
        <nav className="navM" ref={headerNavRef}>
          <Link to="/" className="navM-link" onClick={closeMenu}>
            <FaHome size={20} style={{ marginRight: 12, verticalAlign: 'middle' }} /> Home
          </Link>
          <hr />
          <Link to="/builder" className="navM-link" onClick={closeMenu}>
            <SiPcgamingwiki size={20} style={{ marginRight: 12, verticalAlign: 'middle' }} /> PC Builder
          </Link>
          <hr />
          <Link to="/prebuilt" className="navM-link" onClick={closeMenu}>
            <TbDeviceDesktopCog size={20} style={{ marginRight: 12, verticalAlign: 'middle' }} /> Pre-built PCs
          </Link>
          <hr />
          <Link to="/components" className="navM-link" onClick={closeMenu}>
            <CgComponents size={20} style={{ marginRight: 12, verticalAlign: 'middle' }} /> Components
          </Link>
          <hr />
          <Link to="/learn" className="navM-link" onClick={closeMenu}>
            <GiBrain size={20} style={{ marginRight: 12, verticalAlign: 'middle' }} /> Learn
          </Link>
          <hr />

          <div className="mobile-actions">
            {authUser ? (
              <>
                <button className="mobile-link" onClick={() => { closeMenu(); navigate('/dashboard'); }}>Dashboard</button>
                <button className="mobile-link" onClick={() => { closeMenu(); navigate('/settings'); }}>Settings</button>
                <button className="mobile-link logout" onClick={() => { setShowConfirm(true); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-nav-link" onClick={closeMenu}>Sign In</Link>
                <Link to="/signup" className="header-nav-link" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="signout-modal-overlay">
          <div className="signout-modal-box">
            <p className="signout-modal-message">Are you sure you want to log out?</p>
            <div className="signout-modal-actions">
              <button onClick={handleLogout} className="signout-confirm-btn">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="signout-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default LoggedInUserHeader;