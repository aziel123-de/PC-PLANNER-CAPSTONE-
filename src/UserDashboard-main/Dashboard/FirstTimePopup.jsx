import React from 'react';
import './FirstTimePopup.css';

function FirstTimePopup({ isOpen, onClose, onNewUser, onExperiencedUser, onLearnMore }) {
  if (!isOpen) return null;

  return (
    <div className="first-time-popup-overlay">
      <div className="first-time-popup">
        <div className="popup-header">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
          <h1>Let's Find Your Perfect PC</h1>
          <p>Tell us about your experience level so we can guide you to the best solution</p>
        </div>
        
        <div className="popup-options">
          <div className="option-card new-user">
            <div className="option-icon">
              <div className="icon-star">⭐</div>
            </div>
            <h2>I'm New to PCBuilding</h2>
            <p className="option-subtitle">Show me pre-built systems ready to go</p>
            <ul className="option-features">
              <li>Curated pre-built PCs for different needs</li>
              <li>No assembly required</li>
              <li>Perfect for gaming, work, or everyday use</li>
            </ul>
            <button className="option-button primary" onClick={onNewUser}>
              Show Me Pre-Builts
            </button>
          </div>

          <div className="option-card experienced-user">
            <div className="option-icon">
              <div className="icon-wrench">🔧</div>
            </div>
            <h2>I Know My Way Around</h2>
            <p className="option-subtitle">Let me build a custom configuration</p>
            <ul className="option-features">
              <li>Choose every component yourself</li>
              <li>Compatibility checking included</li>
              <li>Maximum customization and control</li>
            </ul>
            <button className="option-button secondary" onClick={onExperiencedUser}>
              Start Custom Build
            </button>
          </div>

          <div className="option-card learn-user">
            <div className="option-icon">
              <div className="icon-book">📚</div>
            </div>
            <h2>Explore PC Building</h2>
            <p className="option-subtitle">I want to learn about components</p>
            <ul className="option-features">
              <li>What are the different components</li>
              <li>What are different compatibilities</li>
              <li>Learn about bottlenecking</li>
            </ul>
            <button className="option-button learn" onClick={onLearnMore}>
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstTimePopup;