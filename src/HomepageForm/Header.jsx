import React, { useState, useEffect, useRef } from "react";
import './Header.css';
import logo from './LOGO.png';
import { PiSignInBold } from 'react-icons/pi';
import { FaUserPlus, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { TbDeviceDesktopCog } from 'react-icons/tb';
import { SiPcgamingwiki } from 'react-icons/si';
import { CgComponents } from 'react-icons/cg';
import { GiBrain } from 'react-icons/gi';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closedByScroll, setClosedByScroll] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // build a safe CSS class suffix from the user's displayName or email prefix
  const userCssClass = (user) => {
    try {
      // prefer backend username, then firebase displayName, then email prefix
      const raw = user?.username || user?.displayName || (user?.email || '').split('@')[0] || '';
      const slug = String(raw)
        .toLowerCase()
        .trim()
        // replace non-alphanumeric with dash
        .replace(/[^a-z0-9]+/g, '-')
        // collapse multiple dashes
        .replace(/-+/g, '-')
        // remove leading/trailing dashes
        .replace(/^-|-$/g, '');
      return slug ? `user-name user-${slug}` : 'user-name';
    } catch (e) {
      return 'user-name';
    }
  };

  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
    setClosedByScroll(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setClosedByScroll(false);
  };

  useEffect(() => {
    // listen for manual auth changes (localStorage updates) for non-Firebase login
    const handler = (e) => setAuthUser(e?.detail || null);
    window.addEventListener('authChanged', handler);

    // also keep Firebase state if project uses it
    let unsub;
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        if (user) setAuthUser(user);
      });
    } catch (e) {
      // firebase not configured or not used
      unsub = null;
    }

    return () => {
      window.removeEventListener('authChanged', handler);
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        if (menuOpen) {
          setMenuOpen(false);
          setClosedByScroll(true);
        }
      } else if (scrollTop < lastScrollTop - 10) {
        if (!menuOpen && closedByScroll) {
          setMenuOpen(true);
          setClosedByScroll(false);
        }
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        if (menuOpen) {
          setMenuOpen(false);
          setClosedByScroll(true);
        }
      } else if (e.deltaY < 0) {
        if (!menuOpen && closedByScroll) {
          setMenuOpen(true);
          setClosedByScroll(false);
        }
      }
    };

    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.slide-down-menu') && !e.target.closest('.hamburger')) {
        setMenuOpen(false);
        setClosedByScroll(false);
      }
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, closedByScroll, userMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
  // clear local storage user and notify listeners
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
  setUserMenuOpen(false);
  navigate('/');
    } catch (e) {
      console.warn('Logout failed', e);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <img src={logo} alt="LOGO.png" className="logo" />
          </Link>
          <h1 className="app-title">PC Planner</h1>
        </div>

        <div className="hamburger" onClick={toggleMenu} role="button" aria-label="Toggle menu">
          {/* when logged in, show only the avatar inside the hamburger (no bars icon) */}
          {authUser ? (
            <img
              src={authUser.photoURL || '/profDefault.webp'}
              alt="avatar"
              className="hamburger-avatar"
              style={{ width: 28, height: 28, borderRadius: 6, marginRight: 8 }}
            />
          ) : null}

          {/* show bars/times icons only when user is NOT logged in */}
          {!authUser && (
            <>
              <span className={`icon ${menuOpen ? 'hide' : 'show'}`}><FaBars /></span>
              <span className={`icon ${menuOpen ? 'show' : 'hide'}`}><FaTimes /></span>
            </>
          )}
        </div>

        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/builder" className="nav-link">PC Builder</Link>
          <Link to="/prebuilt" className="nav-link">Pre-built PCs</Link>
          <Link to="/components" className="nav-link">Components</Link>
          <Link to="/learn" className="nav-link">Learn</Link>

          {/* desktop sign-in replaced by avatar when logged in */}
          {authUser ? (
            <div ref={userMenuRef} className="desktop-user-wrapper">
              <button
                className="sign-in user-inline"
                onClick={() => setUserMenuOpen(v => !v)}
                type="button"
                aria-expanded={userMenuOpen}
              >
                <img
                  src={authUser.photoURL || '/profDefault.webp'}
                  alt="avatar"
                  className="user-avatar"
                  style={{ width: 28, height: 28, borderRadius: 6, marginRight: 8 }}
                />
                <span className={userCssClass(authUser)}>{authUser.username || authUser.displayName || (authUser.email || '').split('@')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown" style={{ right: 0, left: 'auto' }}>
                  <div className="user-dropdown-info">
                    <div className="user-dropdown-name">{authUser.username || authUser.displayName || (authUser.email || '').split('@')[0]}</div>
                    <div className="user-dropdown-email">{authUser.email}</div>
                  </div>
                  <div className="user-dropdown-actions">
                    <button className="dashboard-btn" onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}>Dashboard</button>
                    <button className="settings-btn" onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}>Settings</button>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="sign-in-link">
              <button className="sign-in">
                Sign In <PiSignInBold style={{ marginLeft: 5, verticalAlign: 'middle' }} />
              </button>
            </Link>
          )}
        </nav>
      </header>

      {/* Visual overlay */}
      <div className={`overlay ${menuOpen ? 'show' : ''}`}></div>

      {/* Fixed sidebar menu */}
      <div className={`slide-down-menu ${menuOpen ? 'show' : ''}`}>
        <nav className="navM">
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
        </nav>

        <div className="menu-buttons">
          {authUser ? (
            <div className="menu-user-block">
              <div style={{ marginLeft: 0 }}>
                <div style={{ color: '#fff', fontWeight: 700 }}>
                  {authUser.username || authUser.displayName || (authUser.email || '').split('@')[0]}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>{authUser.email}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="sign-in" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button className="sign-in" onClick={() => { closeMenu(); navigate('/login'); }}>
                Sign In <PiSignInBold style={{ marginLeft: 5, verticalAlign: 'middle' }} />
              </button>
             
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;