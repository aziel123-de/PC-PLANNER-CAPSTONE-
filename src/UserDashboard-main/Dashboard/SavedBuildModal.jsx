import React, { useEffect, useCallback } from 'react';

/**
 * SavedBuildModal
 * Props:
 *  - build: full saved build object (id, name, description, total_price, warnings, has_issues, createdAt, updatedAt, parts)
 *  - onClose(): close modal
 *  - onLoad(build): optional load into builder
 */
export default function SavedBuildModal({ build, onClose, onLoad }) {
  if (!build) return null;
  const {
    name,
    description,
    total_price,
    warnings = [],
    has_issues,
    createdAt,
    updatedAt,
    parts = {}
  } = build;

  // Escape key close
  const escHandler = useCallback((e) => {
    if (e.key === 'Escape') onClose && onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [escHandler]);

  // Prevent scroll behind modal
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const formatDate = (d) => {
    try { return d ? new Date(d).toLocaleString() : ''; } catch { return ''; }
  };

  const section = (title, content) => (
    <div className="sbm-section">
      <h4>{title}</h4>
      <div className="sbm-section-body">{content}</div>
    </div>
  );

  const renderPart = (obj) => {
    if (!obj) return <span className="sbm-empty">—</span>;
    const name = obj.name || obj.model || obj.title || obj.part_name || obj.Part_name || obj.id || 'Unknown';
    const price = obj.price || obj.Price || obj.cost; // might be undefined
    return (
      <div className="sbm-part-line" key={name+price}>
        <span className="sbm-part-name">{name}</span>
        {price !== undefined && <span className="sbm-part-price">₱{Number(price).toLocaleString()}</span>}
      </div>
    );
  };

  const renderArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return <span className="sbm-empty">—</span>;
    return arr.filter(Boolean).map(renderPart);
  };

  return (
    <div className="sbm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="sbm-modal" role="dialog" aria-modal="true" aria-label={`Saved build ${name || 'details'}`}>        
        <div className="sbm-header">
          <div className="sbm-title-wrap">
            <h2 className="sbm-title">{name || 'Untitled Build'}</h2>
            <span className={"sbm-status-badge " + (has_issues ? 'issues' : 'ok')}>{has_issues ? 'Issues' : 'OK'}</span>
          </div>
          <button className="sbm-close-btn" onClick={onClose} aria-label="Close build details">×</button>
        </div>
        <div className="sbm-meta">
          <span>Created: {formatDate(createdAt)}</span>
          <span>Updated: {formatDate(updatedAt)}</span>
        </div>
        {description && description.trim() && (
          <div className="sbm-description">{description}</div>
        )}
        <div className="sbm-total">Total Price: <strong>₱{Number(total_price || 0).toLocaleString()}</strong></div>

        {/* Warnings */}
        <div className="sbm-warnings">
          <h4>Warnings</h4>
          {warnings.length === 0 ? (
            <div className="sbm-no-warnings">No warnings</div>
          ) : (
            <div className="sbm-warning-badges">
              {warnings.map((w, i) => (
                <span key={i} className="sbm-warning-badge">{w}</span>
              ))}
            </div>
          )}
        </div>

        {/* Parts */}
        <div className="sbm-parts-grid">
          {section('Motherboard', renderPart(parts.mobo))}
          {section('CPU', renderPart(parts.cpu))}
          {section('GPUs', renderArray(parts.gpus))}
          {section('RAM', renderArray(parts.rams))}
          {section('M.2 SSDs', renderArray(parts.m2s))}
          {section('Storage', renderArray(parts.storage))}
          {section('PSU', renderPart(parts.psu))}
          {section('Case', renderPart(parts.case))}
        </div>

        <div className="sbm-footer">
          {onLoad && (
            <button className="sbm-action-btn" onClick={() => onLoad(build)}>Load Into Builder</button>
          )}
          <button className="sbm-secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
