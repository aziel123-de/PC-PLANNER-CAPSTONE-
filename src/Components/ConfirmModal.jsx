import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      if (typeof onConfirm === 'function') onConfirm();
    } finally {
      if (typeof onClose === 'function') onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-cancel" onClick={onClose}>{cancelText}</button>
          <button className="confirm-modal-confirm" onClick={handleConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
