import React, { useEffect, useState, useCallback, useRef } from 'react';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

/**
 * ShareSavedBuildModal
 * Props:
 *  - build: saved build object (must include parts, id, name, total_price)
 *  - onClose()
 *  - onShared({communityId}) called after success
 */
export default function ShareSavedBuildModal({ build, onClose, onShared }) {
  const [title, setTitle] = useState(build?.name || '');
  const [description, setDescription] = useState(build?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const fileInputRef = useRef(null);

  const escHandler = useCallback((e) => { if (e.key === 'Escape') onClose && onClose(); }, [onClose]);
  useEffect(() => { document.addEventListener('keydown', escHandler); return () => document.removeEventListener('keydown', escHandler); }, [escHandler]);
  useEffect(() => { lockScroll(); return () => unlockScroll(); }, []);

  if (!build) return null;
  const parts = build.parts || {};

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setTimeout(() => setError(''), 3000);
      setSelectedImage(null);
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setInputKey(prev => prev + 1);
  };

  async function handleShare(e) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title required'); return; }
    if (!parts || Object.keys(parts).length === 0) { setError('Build has no parts to share'); return; }
    const token = localStorage.getItem('token');
    if (!token) { setError('Login required'); return; }
    setSubmitting(true);
    try {
      const totalPrice = build.total_price || Object.values(parts).reduce((acc, v) => {
        if (!v) return acc;
        if (Array.isArray(v)) return acc + v.reduce((s,x)=> s + (x && x.price ? Number(x.price) : 0),0);
        return acc + (v.price ? Number(v.price) : 0);
      },0);
      const resp = await fetch('/api/community/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description, parts, total_price: Math.round(totalPrice) })
      });
      if (!resp.ok) throw new Error('Share failed');
      const json = await resp.json();
      
      // Upload image if selected
      if (selectedImage && json.id) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const imageResp = await fetch(`/api/community/builds/${json.id}/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!imageResp.ok) {
          console.warn('Image upload failed, but build was shared successfully');
        }
      }
      
      if (onShared) onShared(json);
    } catch (e) {
      setError(e.message || 'Share failed');
    } finally {
      setSubmitting(false);
    }
  }

  const section = (label, content) => (
    <div className="share-sec">
      <div className="share-sec-label">{label}</div>
      <div className="share-sec-body">{content}</div>
    </div>
  );

  const renderPart = (p) => {
    if (!p) return <div className="share-part empty">Empty</div>;
    const n = p.name || p.model || p.title || 'Unknown';
    return <div className="share-part">{n}{p.price != null && <span className="price">₱{p.price}</span>}</div>;
  };
  const renderArray = (arr) => !Array.isArray(arr) || arr.length === 0 ? <div className="share-part empty">None</div> : arr.filter(Boolean).map((x,i)=> <div className="share-part" key={i}>{(x.name||x.model||x.title||'Unknown')}{x.price!=null && <span className="price">₱{x.price}</span>}</div>);

  return (
    <div className="share-overlay" onClick={(e)=> { if (e.target===e.currentTarget) onClose && onClose(); }}>
      <div className="share-modal" role="dialog" aria-modal="true">
        <div className="share-header">
          <h2>Share Saved Build</h2>
          <button className="share-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleShare} className="share-form">
          <label className="share-label">Title
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Build title" />
          </label>
          <label className="share-label">Description (optional)
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Describe highlights, goals, etc." />
          </label>
          <label className="share-label">Image Attachment (optional)
            <div className="share-image-upload">
              <div className="share-image-placeholder" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => fileInputRef.current?.click(), 0);
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Build preview" className="share-preview-image" />
                ) : (
                  <div className="share-placeholder-content">
                    <div className="share-upload-icon">📷</div>
                    <p>Click to upload build image</p>
                    <span className="share-upload-hint">JPEG, PNG • Max 2MB</span>
                  </div>
                )}
              </div>
              {selectedImage && (
                <button type="button" className="share-remove-image" onClick={handleRemoveImage}>Remove Image</button>
              )}
              <input
                key={inputKey}
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageSelect}
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'none' }}
              />
            </div>
          </label>
          <div className="share-preview">
            <h3>Preview Parts</h3>
            <div className="share-parts-grid">
              {section('Motherboard', renderPart(parts.mobo))}
              {section('CPU', renderPart(parts.cpu))}
              {section('GPUs', renderArray(parts.gpus))}
              {section('RAM', renderArray(parts.rams))}
              {section('M.2 SSDs', renderArray(parts.m2s))}
              {section('Storage', renderArray(parts.storage))}
              {section('PSU', renderPart(parts.psu))}
              {section('Case', renderPart(parts.case))}
            </div>
          </div>
          {error && <div className="share-error">{error}</div>}
          <div className="share-actions">
            <button type="button" className="share-btn secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="share-btn primary" disabled={submitting}>{submitting ? 'Sharing…' : 'Share Build'}</button>
          </div>
        </form>
      </div>
      <style>{`
        .share-overlay { position: fixed; inset:0; background: rgba(0,0,0,.45); display:flex; justify-content:center; align-items:flex-start; padding:3rem 1rem; z-index:6500; overflow-y:auto; }
        .share-modal { background:#fff; border:1px solid #d9e2ef; border-radius:14px; width:min(980px,95%); padding:1.4rem 1.25rem 1.8rem; box-shadow:0 8px 30px -6px rgba(0,24,72,.15); position:relative; animation:fadeShare .25s ease; }
        @keyframes fadeShare { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
        .share-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
        .share-header h2 { margin:0; font-size:1.35rem; }
        .share-close { background:transparent; border:none; font-size:1.4rem; line-height:1; cursor:pointer; padding:.25rem .4rem; }
        .share-form { display:flex; flex-direction:column; gap:1rem; }
        .share-label { display:flex; flex-direction:column; font-size:.75rem; font-weight:600; letter-spacing:.5px; gap:.35rem; color:#1c2a39; }
        .share-label input, .share-label textarea { border:1px solid #d9e2ef; background:#fff; border-radius:8px; padding:.65rem .75rem; font-size:.85rem; resize:vertical; }
        .share-label input:focus, .share-label textarea:focus { outline:none; border-color:#1d5bff; box-shadow:0 0 0 3px rgba(29,91,255,.25); }
        .share-preview h3 { margin:.2rem 0 .6rem; font-size:1rem; }
        .share-parts-grid { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); }
        .share-sec { background:#f5f7fb; border:1px solid #d9e2ef; border-radius:10px; padding:.55rem .6rem .65rem; display:flex; flex-direction:column; gap:.4rem; }
        .share-sec-label { font-size:.6rem; text-transform:uppercase; font-weight:700; letter-spacing:.6px; color:#5b6b7c; }
        .share-part { background:#fff; border:1px solid #e4ebf3; border-radius:6px; padding:.25rem .4rem; font-size:.65rem; display:flex; justify-content:space-between; align-items:center; gap:.4rem; }
        .share-part.empty { opacity:.5; font-style:italic; }
        .share-part .price { font-weight:600; color:#1d5bff; }
        .share-error { color:#c62828; font-size:.75rem; }
        .share-actions { display:flex; justify-content:flex-end; gap:.65rem; }
        .share-btn { border:1px solid #1d5bff; padding:.6rem 1.05rem; font-size:.7rem; letter-spacing:.6px; border-radius:8px; cursor:pointer; font-weight:600; text-transform:uppercase; display:inline-flex; align-items:center; gap:.45rem; }
        .share-btn.primary { background:#1d5bff; color:#fff; }
        .share-btn.primary:hover:not(:disabled) { background:#0f4adb; }
        .share-btn.secondary { background:#fff; color:#1d5bff; }
        .share-btn.secondary:hover:not(:disabled) { background:#eef5ff; }
        .share-btn:disabled { opacity:.55; cursor:not-allowed; }
        .share-image-upload { display:flex; flex-direction:column; gap:.5rem; }
        .share-image-placeholder { border:2px dashed #d9e2ef; border-radius:8px; padding:1rem; cursor:pointer; text-align:center; transition:border-color .2s; }
        .share-image-placeholder:hover { border-color:#1d5bff; }
        .share-placeholder-content { display:flex; flex-direction:column; align-items:center; gap:.4rem; }
        .share-upload-icon { font-size:1.5rem; }
        .share-placeholder-content p { margin:0; font-size:.8rem; color:#5b6b7c; }
        .share-upload-hint { font-size:.65rem; color:#8a9ba8; }
        .share-preview-image { max-width:100%; max-height:200px; border-radius:6px; object-fit:cover; }
        .share-remove-image { background:#f44336; color:#fff; border:none; padding:.4rem .8rem; border-radius:6px; font-size:.65rem; cursor:pointer; align-self:flex-start; }
        .share-remove-image:hover { background:#d32f2f; }
        @media (max-width: 768px) {
          .share-overlay { padding:1rem .5rem; align-items:flex-start; }
          .share-modal { width:100%; max-width:100%; padding:1rem; max-height:90vh; overflow-y:auto; }
          .share-header h2 { font-size:1.2rem; }
          .share-parts-grid { grid-template-columns:1fr; }
          .share-actions { flex-direction:column; }
          .share-btn { width:100%; justify-content:center; }
          .share-image-placeholder { padding:.75rem; }
          .share-placeholder-content p { font-size:.75rem; }
          .share-upload-hint { font-size:.6rem; }
        }
        @media (max-width: 480px) {
          .share-overlay { padding:.25rem; align-items:flex-start; }
          .share-modal { padding:.75rem; max-height:95vh; }
          .share-header { flex-direction:row; gap:.5rem; align-items:center; }
          .share-close { position:static; }
          .share-preview-image { max-height:150px; }
        }
      `}</style>
    </div>
  );
}
