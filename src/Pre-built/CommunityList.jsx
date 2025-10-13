import React, { useEffect, useState, useCallback } from 'react';
import './community.css';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import CommunityBuildModal from './CommunityBuildModal';
import AlertModal from '../components/AlertModal';
import { FaUser, FaEye, FaDownload, FaTrash, FaCaretUp, FaDollarSign, FaClock, FaTools, FaWrench } from 'react-icons/fa';

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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, buildId: null, buildTitle: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Alert' });

  const fetchBuilds = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_PREFIX}`);
      if (!res.ok) throw new Error('Failed to load builds');
      const data = await res.json();
      // Sort by score (upvotes - downvotes) in descending order (highest first)
      const sortedData = data.sort((a, b) => {
        const scoreA = (a.up_votes || 0) - (a.down_votes || 0);
        const scoreB = (b.up_votes || 0) - (b.down_votes || 0);
        return scoreB - scoreA; // Descending order
      });
      setBuilds(sortedData);
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

  const handleDelete = (buildId, buildTitle) => {
    setDeleteConfirm({ 
      show: true, 
      buildId: buildId, 
      buildTitle: buildTitle || 'Untitled Build' 
    });
  };

  const confirmDelete = async () => {
    const buildId = deleteConfirm.buildId;
    setDeleteConfirm({ show: false, buildId: null, buildTitle: '' });
    
    const token = localStorage.getItem('token');
    if (!token) { 
      setAlertModal({ show: true, message: 'Login required', title: 'Authentication Required' }); 
      return; 
    }
    
    try {
      const res = await fetch(`${API_PREFIX}/${buildId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Delete failed');
      }
      setBuilds(prev => prev.filter(b => b.id !== buildId));
    } catch (e) {
      console.error('delete community build failed', e);
      setAlertModal({ show: true, message: e.message || 'Delete failed', title: 'Delete Error' });
    }
  };

  return (
    <div className="community-builds-wrapper" style={{ padding: '1.25rem 1rem 3rem', maxWidth: 1220, margin: '0 auto' }}>


      <section className="community-panel">
        <div className="community-header">
          <div className="header-content">
            <div className="header-text">
              <h2 className='title-header-prebuild'>PC Planner Community Builds</h2>
              <p className='subtitle-header-prebuilt'>Discover Great PC Builds from our Community</p>
            </div>
            <div className="header-actions">
              <button className="share-build-btn" onClick={() => {
                const token = localStorage.getItem('token');
                if (!token || token === 'null' || token === 'undefined') {
                  window.location.href = '/login';
                } else {
                  window.location.href = '/dashboard?section=saved';
                }
              }}>
                SHARE BUILD
              </button>
              <button className="refresh-btn" disabled={loading} onClick={() => setRefreshIndex(i => i + 1)}>
                <span className="refresh-icon">↻</span>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon"></span>
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
            {builds.map(build => (
              <div key={build.id} className="build-card">
                <div className="creator-row">
                  <div className="profile-picture">
                    {build.profile_picture ? (
                      <img 
                        src={build.profile_picture} 
                        alt={`${build.username}'s profile`}
                        className="profile-img"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        <FaUser className="placeholder-icon" />
                      </div>
                    )}
                  </div>
                  <span className="creator-name">{build.username || 'hazel sadangsal'}</span>
                </div>
                
                <div className="card-top-row">
                  <h3 className="card-title">{build.title}</h3>
                  <div className="card-right">
                    <div className="votes">
                      <FaCaretUp className="vote-triangle" />
                      <span className="vote-count">{(build.up_votes || 0) - (build.down_votes || 0)}</span>
                    </div>
                    {currentUserId && currentUserId === build.user_id && (
                      <button className="delete-button" onClick={() => handleDelete(build.id, build.title)}>
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="price-box">
                  ₱{build.total_price?.toLocaleString() || '5,995'}
                </div>
                
                <p className="description-text">
                  {(build.description || 'No description provided.').length > 100 
                    ? (build.description || 'No description provided.').substring(0, 100) + '...' 
                    : (build.description || 'No description provided.')}
                </p>

                <div className="button-row">
                  <button className="details-btn" onClick={() => openModal(build.id)}>
                    View Details
                  </button>
                  <button className="load-builds-btn" onClick={() => loadIntoBuilder(build)}>
                    Load Builds
                  </button>
                </div>
              </div>
            ))}
            
            {!loading && builds.length === 0 && !error && (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaTools style={{ fontSize: '3.5rem', color: '#3b5998', marginRight: '0.5rem' }} />
                  <FaWrench style={{ fontSize: '2.8rem', color: '#4a6cf7', transform: 'rotate(-45deg)', marginLeft: '-0.8rem' }} />
                </div>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog">
            <div className="delete-dialog-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="delete-dialog-body">
              <p>Are you sure you want to delete this build?</p>
              <p className="build-title-confirm">"{deleteConfirm.buildTitle}"</p>
            </div>
            <div className="delete-dialog-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setDeleteConfirm({ show: false, buildId: null, buildTitle: '' })}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={() => confirmDelete()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModal.show}
        onClose={() => setAlertModal({ show: false, message: '', title: 'Alert' })}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}

export default CommunityList;
