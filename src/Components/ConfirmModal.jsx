import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm", message, confirmText = "OK", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
          <button className="confirm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">
            {message.includes('"') ? (
              <>
                {message.split('"')[0]}
                <span className="build-name-highlight">
                  "{message.split('"')[1]}"
                </span>
                {message.split('"')[2]}
              </>
            ) : (
              message
            )}
          </p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-cancel-btn" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-modal-ok-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;