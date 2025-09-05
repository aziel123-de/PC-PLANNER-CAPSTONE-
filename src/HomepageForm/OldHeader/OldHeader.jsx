import { useState, useEffect } from "react";
import './Header.css';
import logo from './LOGO.png';
import { PiSignInBold } from 'react-icons/pi';
import { FaUserPlus, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { TbDeviceDesktopCog } from 'react-icons/tb';
import { SiPcgamingwiki } from 'react-icons/si';
import { CgComponents } from 'react-icons/cg';
import { GiBrain } from 'react-icons/gi';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closedByScroll, setClosedByScroll] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
    setClosedByScroll(false); // Reset when manually toggled
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setClosedByScroll(false); // Reset when manually closed
  };

  useEffect(() => {
    let lastScrollTop = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        // Scrolling down - close sidebar and mark as closed by scroll
        if (menuOpen) {
          setMenuOpen(false);
          setClosedByScroll(true);
        }
      } else if (scrollTop < lastScrollTop - 10) {
        // Scrolling up - only open sidebar if it was closed by scroll
        if (!menuOpen && closedByScroll) {
          setMenuOpen(true);
          setClosedByScroll(false);
        }
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        // Scrolling down - close sidebar and mark as closed by scroll
        if (menuOpen) {
          setMenuOpen(false);
          setClosedByScroll(true);
        }
      } else if (e.deltaY < 0) {
        // Scrolling up - only open sidebar if it was closed by scroll
        if (!menuOpen && closedByScroll) {
          setMenuOpen(true);
          setClosedByScroll(false);
        }
      }
    };

    const handleClickOutside = (e) => {
      // Close menu when clicking outside of sidebar
      if (menuOpen && !e.target.closest('.slide-down-menu') && !e.target.closest('.hamburger')) {
        setMenuOpen(false);
        setClosedByScroll(false); // Reset when closed by clicking outside
      }
    };

    // Try both scroll and wheel events
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    
    // Add wheel event listeners as backup
    window.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("wheel", handleWheel, { passive: true });
    
    // Listen for clicks outside the sidebar
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, closedByScroll]);


  const handleOverlayClick = (e) => {
    
    closeMenu();
  };

  const navigate = useNavigate();
  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="LOGO.png" className="logo" />
          <h1 className="app-title">PC Planner</h1>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span className={`icon ${menuOpen ? 'hide' : 'show'}`}>
            <FaBars />
          </span>
          <span className={`icon ${menuOpen ? 'show' : 'hide'}`}>
            <FaTimes />
          </span>
        </div>

        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/builder" className="nav-link">PC Builder</Link>
          <Link to="/prebuilt" className="nav-link">Pre-built PCs</Link>
          <Link to="/components" className="nav-link">Components</Link>
          <Link to="/learn" className="nav-link">Learn</Link>

          <Link to="/login" className="sign-in-link">
            <button className="sign-in">
              Sign In <PiSignInBold style={{ marginLeft: 5, verticalAlign: 'middle' }} />
            </button>
          </Link>
        </nav>
      </header>

      {/* Visual overlay - no click handling */}
      <div
        className={`overlay ${menuOpen ? 'show' : ''}`}
      ></div>

      {/* Fixed sidebar menu */}
      <div 
        className={`slide-down-menu ${menuOpen ? 'show' : ''}`}
      >
        <nav className="navM">
          <a href="#" className="navM-link" onClick={closeMenu}>
            <FaHome size={25} style={{ marginRight: 15, verticalAlign: 'middle' }} />Home
          </a>
          <hr />
          <a href="#" className="navM-link" onClick={closeMenu}>
            <SiPcgamingwiki size={25} style={{ marginRight: 15, verticalAlign: 'middle' }} /> PC Builder
          </a>
          <hr />
          <a href="#" className="navM-link" onClick={closeMenu}>
            <TbDeviceDesktopCog size={25} style={{ marginRight: 15, verticalAlign: 'middle' }} /> Pre-built PCs
          </a>
          <hr />
          <Link to="/components" className="navM-link" onClick={closeMenu}>
            <CgComponents size={25} style={{ marginRight: 15, verticalAlign: 'middle' }} /> Components
          </Link>
          <hr />
          <Link to="/navigation/components" className="navM-link" onClick={closeMenu}>
            <GiBrain size={25} style={{ marginRight: 15, verticalAlign: 'middle' }} /> Learn
          </Link>
          <hr />
        </nav>
        <div className="menu-buttons">
          <button className="sign-in" onClick={() => navigate('/login')}>
            Sign In <PiSignInBold style={{ marginLeft: 5, verticalAlign: 'middle' }} />
          </button>
         
        </div>
      </div>
    </div>
  );
}

export default Header;