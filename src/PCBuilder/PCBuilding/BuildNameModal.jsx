import React, { useState, useEffect } from 'react';
import './BuildNameModal.css';

function BuildNameModal({ isOpen, onClose, onSave, initialName = '', initialDescription = '' }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setNameError('');
    }
  }, [isOpen, initialName, initialDescription]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setNameError('');
    onClose();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setNameError('Build name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Build name must be at least 2 characters long');
      return;
    }

    if (trimmedName.length > 50) {
      setNameError('Build name must be 50 characters or less');
      return;
    }

    onSave(trimmedName, description.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="build-name-modal-backdrop" onClick={handleBackdropClick}>
      <div className="build-name-modal" onKeyDown={handleKeyDown}>
        <div className="build-name-modal-header">
          <h2 className="build-name-modal-title">Save Your Build</h2>
          <button className="build-name-modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="build-name-modal-content">
          <div className="form-group">
            <label htmlFor="build-name" className="form-label">
              Build Name <span className="required">*</span>
            </label>
            <input
              id="build-name"
              type="text"
              className={`form-input ${nameError ? 'form-input-error' : ''}`}
              placeholder="Enter a name for your build"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              onKeyDown={handleKeyPress}
              maxLength={50}
              autoFocus
            />
            {nameError && <div className="form-error">{nameError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="build-description" className="form-label">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="build-description"
              className="form-textarea"
              placeholder="Add a description for your build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <div className="character-count">
              {description.length}/200
            </div>
          </div>
        </div>
        
        <div className="build-name-modal-footer">
          <button className="build-name-modal-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button 
            className="build-name-modal-save-btn" 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Build
          </button>
        </div>
        
        <div className="keyboard-hint">
          Press <kbd>Enter</kbd> to save quickly
        </div>
      </div>
    </div>
  );
}

export default BuildNameModal;