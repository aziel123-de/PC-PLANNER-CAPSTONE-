import React from 'react';
import './AlertModal.css';

function AlertModal({ isOpen, onClose, title = "AlertifyJS", message, type = "info" }) {
  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal-header">
          <h3 className="alert-modal-title">{title}</h3>
          <button className="alert-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="alert-modal-body">
          <p className="alert-modal-message">{message}</p>
        </div>
        <div className="alert-modal-footer">
          <button className="alert-modal-ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;