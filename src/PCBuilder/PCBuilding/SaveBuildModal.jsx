import React from 'react';
import './SaveBuildModal.css';

function SaveBuildModal({ isOpen, onClose, buildId, buildName, hasIssues, warnings }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="save-build-modal-backdrop" onClick={handleBackdropClick}>
      <div className="save-build-modal">
        <div className="save-build-modal-header">
          <div className="save-build-modal-icon">
            {hasIssues ? (
              <div className="warning-icon"></div>
            ) : (
              <div className="success-icon"></div>
            )}
          </div>
          <h2 className="save-build-modal-title">
            {hasIssues ? 'Build Saved with Warnings' : 'Build Saved Successfully'}
          </h2>
          <button className="save-build-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="save-build-modal-content">
          <div className="success-message">
            <p className="success-text">
              Your PC build has been successfully saved! You can view it in your dashboard.
            </p>
          </div>
          
          <div className="build-id-section">
            <span className="build-id-label">Build Name:</span>
            <span className="build-id-value">{buildName || 'Untitled Build'}</span>
          </div>
          
          {hasIssues && warnings && warnings.length > 0 ? (
            <div className="warnings-section">
              <h3 className="warnings-title">Compatibility Warnings:</h3>
              <ul className="warnings-list">
                {warnings.map((warning, index) => (
                  <li key={index} className="warning-item">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="no-issues-section">
              <p className="no-issues-text">No compatibility issues detected!</p>
            </div>
          )}
        </div>
        
        <div className="save-build-modal-footer">
          <button className="save-build-modal-ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveBuildModal;