import React, { useEffect, useState, useCallback } from 'react';
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

  const escHandler = useCallback((e) => { if (e.key === 'Escape') onClose && onClose(); }, [onClose]);
  useEffect(() => { document.addEventListener('keydown', escHandler); return () => document.removeEventListener('keydown', escHandler); }, [escHandler]);
  useEffect(() => { lockScroll(); return () => unlockScroll(); }, []);

  if (!build) return null;
  const parts = build.parts || {};

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
      `}</style>
    </div>
  );
}
