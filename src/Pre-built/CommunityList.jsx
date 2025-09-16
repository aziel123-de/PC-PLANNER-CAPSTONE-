import React, { useEffect, useState, useCallback } from 'react';
import './community.css';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import CommunityBuildModal from './CommunityBuildModal';

/* Assumptions:
   - Auth token stored in localStorage under 'token'
   - Current build (in builder) structure stored under 'currentBuildParts' or we reuse 'loadedBuild'
   - Backend API prefix same as other endpoints: '/api'
*/

const API_PREFIX = '/api/community/builds';

function CommunityList() {
  const [builds, setBuilds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [modalBuildId, setModalBuildId] = useState(null); // placeholder until modal is implemented

  const fetchBuilds = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_PREFIX}`);
      if (!res.ok) throw new Error('Failed to load builds');
      const data = await res.json();
      setBuilds(data);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds, refreshIndex]);

  // derive current user id from stored user JSON
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) setCurrentUserId(parsed.id);
      }
    } catch {}
  }, []);


  const openModal = (id) => { setModalBuildId(id); lockScroll(); };
  const closeModal = () => { setModalBuildId(null); unlockScroll(); };

  const loadIntoBuilder = (build) => {
    if (!build) return;
    // BuilderPage expects the stored object to be the raw parts object (mobo, cpu, gpus, etc.)
    try {
      localStorage.setItem('loadedBuild', JSON.stringify(build.parts || {}));
      if (build.id) localStorage.setItem('editingBuildId', build.id);
      if (build.title) localStorage.setItem('editingBuildName', build.title);
    } catch (e) {
      console.error('Failed to serialize loaded build', e);
    }
    // navigate to builder
    window.location.href = '/builder';
  };

  const handleDelete = async (buildId) => {
    if (!window.confirm('Delete this community build? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) { alert('Login required'); return; }
    try {
      const res = await fetch(`${API_PREFIX}/${buildId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Delete failed');
      }
      setBuilds(prev => prev.filter(b => b.id !== buildId));
    } catch (e) {
      console.error('delete community build failed', e);
      alert(e.message || 'Delete failed');
    }
  };

  return (
    <div className="community-builds-wrapper" style={{ padding: '1.25rem 1rem 3rem', maxWidth: 1220, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.9rem' }}>Community Builds</h1>
      <section className="community-panel" style={{ marginTop: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Latest Builds</h2>
          <button className="cb-btn secondary" disabled={loading} onClick={() => setRefreshIndex(i => i + 1)}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error && <div style={{ color: '#c62828', marginTop: '.75rem', fontSize: '.8rem' }}>{error}</div>}
        {loading && !builds.length && <div style={{ marginTop: '.9rem', fontSize: '.8rem' }}>Loading builds...</div>}
        <div className="community-builds-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', marginTop: '1.1rem' }}>
          {builds.map(b => (
            <div key={b.id} className="community-build-card">
              <div className="cb-title">{b.title}</div>
              <div className="cb-meta">By {b.username || 'Unknown'} · Score {(b.up_votes||0)-(b.down_votes||0)} · ₱{b.total_price}</div>
              <div className="cb-description">{(b.description||'').slice(0,140)}{b.description && b.description.length>140 ? '…' : ''}</div>
              <div className="cb-btn-row" style={{ gap: '.4rem' }}>
                <button className="cb-btn secondary" onClick={() => openModal(b.id)} style={{ flex: 1 }}>View</button>
                <button className="cb-btn" onClick={() => loadIntoBuilder(b)} style={{ flex: 1 }}>Load</button>
                {currentUserId && currentUserId === b.user_id && (
                  <button className="cb-btn danger" onClick={() => handleDelete(b.id)} style={{ flex: 0.6, background: '#d32f2f' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {!loading && builds.length === 0 && !error && <div style={{ fontSize: '.8rem', opacity: .7 }}>No community builds yet.</div>}
        </div>
      </section>
      {modalBuildId && (
        <CommunityBuildModal
          buildId={modalBuildId}
          onClose={closeModal}
          onLoaded={closeModal}
        />
      )}
    </div>
  );
}

export default CommunityList;
