import React, { useEffect, useState, useCallback } from 'react';
import { lockScroll, unlockScroll } from '../utils/scrollLock'; // corrected path
import './community.css';

const API_PREFIX = '/api/community/builds';

/*
  Props:
    buildId (string)
    onClose () => void
    onLoaded () => optional callback after load into builder
*/
export default function CommunityBuildModal({ buildId, onClose, onLoaded }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchDetail = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_PREFIX}/${buildId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to fetch build');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [buildId, token]);

  useEffect(() => { lockScroll(); fetchDetail(); return () => unlockScroll(); }, [fetchDetail]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    if (!token) { alert('Login required'); return; }
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_PREFIX}/${buildId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: commentText.trim() })
      });
      if (!res.ok) throw new Error('Failed to comment');
      setCommentText('');
      await fetchDetail();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Comment error');
    } finally { setSubmittingComment(false); }
  };

  const castVote = async (direction) => {
    if (!token) { setShowLoginDialog(true); return; }
    if (voteBusy) return;
    setVoteBusy(true);
    try {
      // optimistic update
      setData(prev => {
        if (!prev) return prev;
        let { up_votes, down_votes, user_vote } = prev;
        up_votes = up_votes || 0; down_votes = down_votes || 0;
        if (direction === 'unvote') {
          if (user_vote === 'up') up_votes = Math.max(0, up_votes - 1);
          if (user_vote === 'down') down_votes = Math.max(0, down_votes - 1);
          user_vote = null;
        } else if (direction === 'up') {
          if (user_vote === 'down') { down_votes = Math.max(0, down_votes - 1); up_votes += 1; }
          else if (user_vote === 'up') { /* same -> treat as unvote optimistically? keep until server returns */ }
          else { up_votes += 1; }
          user_vote = 'up';
        } else if (direction === 'down') {
          if (user_vote === 'up') { up_votes = Math.max(0, up_votes - 1); down_votes += 1; }
            else if (user_vote === 'down') { /* same -> keep */ }
            else { down_votes += 1; }
          user_vote = 'down';
        }
        return { ...prev, up_votes, down_votes, user_vote };
      });
      const res = await fetch(`${API_PREFIX}/${buildId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ direction })
      });
      if (!res.ok) throw new Error('Vote failed');
      const json = await res.json();
      setData(prev => prev ? { ...prev, up_votes: json.up_votes, down_votes: json.down_votes, user_vote: json.user_vote } : prev);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Vote error');
      // refetch to correct state
      fetchDetail();
    } finally { setVoteBusy(false); }
  };

  const loadIntoBuilder = () => {
    if (!data) return;
    try {
      localStorage.setItem('loadedBuild', JSON.stringify(data.parts || {}));
      if (data.id) localStorage.setItem('editingBuildId', data.id);
      if (data.title) localStorage.setItem('editingBuildName', data.title);
    } catch (e) {
      console.error('Failed to set loadedBuild', e);
    }
    window.location.href = '/builder';
    if (onLoaded) onLoaded();
  };

  if (!buildId) return null;

  return (
    <div className="community-modal-overlay" onClick={onClose}>
      <div className="community-modal" style={{ width: 'min(1080px,95%)', padding: '1.4rem 1.35rem 2rem', borderRadius: '14px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="cb-btn secondary" style={{ position: 'absolute', top: 10, right: 10, padding: '.4rem .65rem', fontSize: '.65rem' }}>Close</button>
        {loading && <div style={{ fontSize: '.85rem' }}>Loading build…</div>}
        {error && <div style={{ color: '#c62828', fontSize: '.8rem' }}>{error}</div>}
        {data && !loading && (
          <>
            <header style={{ marginBottom: '1.1rem' }}>
              <h2 style={{ margin: '0 0 .4rem', fontSize: '1.45rem' }}>{data.title}</h2>
              <div className="cb-small-label">
                By {data.username || 'Unknown'} · Score {(data.up_votes||0)-(data.down_votes||0)} · Like {data.up_votes||0} · Dislike {data.down_votes||0}
              </div>
            </header>
            {data.description && <p style={{ whiteSpace: 'pre-line', fontSize: '.85rem', lineHeight: 1.45, color: 'var(--cb-text-light)', margin: '0 0 1.1rem' }}>{data.description}</p>}
            <section>
              <h3 style={{ margin: '0 0 .6rem', fontSize: '1rem' }}>Parts</h3>
              <div className="parts-grid">
                {Object.entries(data.parts || {}).map(([k, v]) => {
                  const renderPartValue = (val) => {
                    if (val == null) return <div className="v" style={{ opacity: .5 }}>Empty</div>;
                    // Arrays (multiple items like gpus, rams, m2s, storage)
                    if (Array.isArray(val)) {
                      if (val.length === 0) return <div className="v" style={{ opacity: .5 }}>Empty</div>;
                      return (
                        <div className="part-items">
                          {val.map((item, idx) => (
                            <div key={idx} className="part-item-row">
                              <div className="v">{(item && (item.name || item.model || item.title || item.sku)) || (typeof item === 'string' || typeof item === 'number' ? String(item) : 'Unnamed')}</div>
                              {item && item.price != null && <div className="price">₱{item.price}</div>}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    // Objects (single selected part)
                    if (typeof val === 'object') {
                      return (
                        <>
                          <div className="v">{val.name || val.model || val.title || '—'}</div>
                          {val.price != null && <div className="price">₱{val.price}</div>}
                        </>
                      );
                    }
                    // Fallback primitives
                    return <div className="v">{String(val)}</div>;
                  };

                  return (
                    <div key={k} className="part-tile">
                      <div className="k">{k}</div>
                      {renderPartValue(v)}
                    </div>
                  );
                })}
              </div>
            </section>
            <div className="vote-buttons" style={{ display: 'flex', gap: '.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button disabled={voteBusy} className={` ${data.user_vote === 'up' ? 'active up' : ''}`} onClick={() => castVote(data.user_vote === 'up' ? 'unvote' : 'up')}>👍 {data.up_votes||0}</button>
              <button disabled={voteBusy} className={` ${data.user_vote === 'down' ? 'active down' : ''}`} onClick={() => castVote(data.user_vote === 'down' ? 'unvote' : 'down')}>👎 {data.down_votes||0}</button>
              <button className="cb-btn" onClick={loadIntoBuilder}>Load Into Builder</button>
            </div>
            <section style={{ marginTop: '2rem' }}>
              <h3 style={{ margin: '0 0 .7rem', fontSize: '1rem' }}>Comments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  <textarea className="cb-comment-input" placeholder={token ? 'Leave a comment' : 'Login required to comment'} disabled={!token || submittingComment} value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="cb-btn" disabled={submittingComment || !commentText.trim()} onClick={submitComment}>{submittingComment ? 'Posting…' : 'Post Comment'}</button>
                  </div>
                </div>
                <div className="comments-box">
                  {(data.comments || []).length === 0 && <div style={{ fontSize: '.7rem', opacity: .6 }}>No comments yet.</div>}
                  {(data.comments || []).map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="author">{c.username || c.user_id}</div>
                      <div className="body">{c.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      
      {/* Login Required Dialog */}
      {showLoginDialog && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog">
            <div className="delete-dialog-header">
              <h3>Login Required</h3>
            </div>
            <div className="delete-dialog-body">
              <p>You need to be logged in to vote on builds.</p>
            </div>
            <div className="delete-dialog-actions">
              <button className="cancel-btn" onClick={() => setShowLoginDialog(false)}>Close</button>
              <button className="confirm-delete-btn" onClick={() => window.location.href = '/login'}>Login</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
