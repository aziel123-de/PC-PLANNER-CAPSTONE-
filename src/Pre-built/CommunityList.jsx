import React, { useEffect, useState, useCallback } from 'react';
import './community.css';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import CommunityBuildModal from './CommunityBuildModal';
import { FaUser } from 'react-icons/fa';

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


      <section className="community-panel">
        <div className="community-header">
          <div className="header-content">
            <div className="header-text">
              <h2 className='title-header-prebuild'>🌎PC Planner Community Builds</h2>
              <p className='subtitle-header-prebuilt'>Discover Great PC Builds from our Community</p>
            </div>
            <div className="header-actions">
              <div className="stats-badge">
                <span className="stats-number">{builds.length}</span>
                <span className="stats-label">Builds</span>
              </div>
              <button className="refresh-btn" disabled={loading} onClick={() => setRefreshIndex(i => i + 1)}>
                <span className="refresh-icon">↻</span>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading && !builds.length ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading amazing builds...</p>
          </div>
        ) : (
          <div className="builds-showcase">
            {builds.map(b => (
              <div key={b.id} className="modern-build-card">
                <div className="card-gradient-border"></div>
                
                <div className="card-header-modern">
                  <div className="build-title-container">
                    <div className="build-icon">🖥️</div>
                    <h3 className="build-title-modern">{b.title}</h3>
                  </div>
                  <div className="vote-badge">
                    <span className="vote-count">{(b.up_votes||0)-(b.down_votes||0)}</span>
                    <span className="vote-label">votes</span>
                  </div>
                </div>

                <div className="build-metadata">
                  <div className="creator-info">
                    <div className="creator-avatar">
                      <FaUser />
                    </div>
                    <div className="creator-details">
                      <span className="creator-name">{b.username || 'Anonymous'}</span>
                      <span className="creator-label">Builder</span>
                    </div>
                  </div>
                  
                  <div className="price-display">
                    <div className="price-amount">₱{b.total_price?.toLocaleString() || '0'}</div>
                    <div className="price-label">Total Cost</div>
                  </div>
                </div>

                <div className="build-description-modern">
                  <p>{(b.description||'No description available').slice(0,140)}{b.description && b.description.length > 140 ? '...' : ''}</p>
                </div>

                <div className="card-actions-modern">
                  <button className="modern-btn primary-btn" onClick={() => openModal(b.id)}>
                  
                    <span>View Details</span>
                  </button>
                  <button className="modern-btn secondary-btn" onClick={() => loadIntoBuilder(b)}>
                    
                    <span>Load Build</span>
                  </button>
                  {currentUserId && currentUserId === b.user_id && (
                    <button className="modern-btn danger-btn" onClick={() => handleDelete(b.id)}>
                      <span className="btn-icon">🗑️</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && builds.length === 0 && !error && (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <h3>No builds shared yet</h3>
                <p>Be the first to share your amazing PC build with the community!</p>
              </div>
            )}
          </div>
        )}
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
