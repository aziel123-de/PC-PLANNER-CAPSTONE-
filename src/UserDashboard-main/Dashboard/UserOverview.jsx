import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserOverview.css';
import pcImage from './PC.png';
import { BarChart3, Eye, Save, History, Settings, Cpu, Clock3, TriangleAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import SavedBuildCard from './SavedBuildCard';
import { MdWavingHand } from 'react-icons/md';
import { FaTools, FaCheckCircle, FaBoxOpen, FaHistory } from 'react-icons/fa';
import LoggedInUserHeader from './loggedInUserHeader';
import SavedBuildModal from './SavedBuildModal';
import ShareSavedBuildModal from './ShareSavedBuildModal';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../HomepageForm/Footer';
import FirstTimePopup from './FirstTimePopup';



function UserOverview({ onClickSettings, onLogout, onClickSignIn, onClickSignUp,onBackClick }) {
  const navigate = useNavigate();
// -------------------------- GET USERNAME FROM LOCALSTORAGE --------------------------------------
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const displayName = userData.full_name || userData.fullName || userData.username || userData.email || 'User';
        setUserName(displayName);
      } catch (e) {
        setUserName('User');
      }
    } else {
      setUserName('User');
    }
  }, []);
  
  // data in backend

// ------------------------------- CURRENT DATE UPDATED ---------------------------------
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// ----------------------------------------------------------------


  const [activeSection, setActiveSection] = useState('overview');

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section && ['overview', 'saved', 'history'].includes(section)) {
      setActiveSection(section);
    }
  }, []);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [buildHistory, setBuildHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1024);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [viewingBuild, setViewingBuild] = useState(null);
  const [sharingBuild, setSharingBuild] = useState(null);
  const [justSharedId, setJustSharedId] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Alert' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', title: 'Confirm', onConfirm: null });
  const [showFirstTimePopup, setShowFirstTimePopup] = useState(false);
  const [buildsLoaded, setBuildsLoaded] = useState(false);

  // Calculate average build cost and price range
  const calculateAverageCost = () => {
    if (savedBuilds.length === 0) return { average: 0, estimatedMin: 0, estimatedMax: 0, actualMin: 0, actualMax: 0 };
    
    const prices = savedBuilds.map(build => build.total_price || 0);
    const total = prices.reduce((sum, price) => sum + price, 0);
    const average = Math.round(total / savedBuilds.length);
    const range = Math.round(average * 0.4); // 40% range
    const actualMin = Math.min(...prices);
    const actualMax = Math.max(...prices);
    
    return {
      average,
      estimatedMin: Math.max(0, average - range),
      estimatedMax: average + range,
      actualMin,
      actualMax
    };
  };

  // Calculate bottleneck builds
  const calculateBottlenecks = () => {
    return savedBuilds.filter(build => 
      build.has_issues || (build.warnings && build.warnings.length > 0)
    ).length;
  };

  const { average, estimatedMin, estimatedMax, actualMin, actualMax } = calculateAverageCost();
  const bottleneckCount = calculateBottlenecks();

  // Get builds with issues for detected issues section
  const buildsWithIssues = savedBuilds.filter(build => 
    build.has_issues || (build.warnings && build.warnings.length > 0)
  );

  // Get recent builds (most recently created/modified)
  const recentBuilds = savedBuilds
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 3); // Show only the 3 most recent

  // Header is rendered by LoggedInUserHeader component


  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!isSmallScreen) {
      setUserCollapsed(!sidebarCollapsed); // Track user preference on large screens
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const smallScreen = window.innerWidth <= 1024;
      setIsSmallScreen(smallScreen);
      
      if (smallScreen) {
        setSidebarCollapsed(true);
        setUserCollapsed(false);
      } else {
        setSidebarCollapsed(userCollapsed);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [userCollapsed]);

  

  // Show popup if user has no saved builds (only after builds are loaded)
  useEffect(() => {
    if (buildsLoaded) {
      if (savedBuilds.length === 0) {
        setShowFirstTimePopup(true);
      } else {
        setShowFirstTimePopup(false);
      }
    }
  }, [savedBuilds, buildsLoaded]);

  // Load saved builds from backend on mount
  useEffect(() => {
    let mounted = true;
    async function loadBuilds() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const resp = await fetch('/api/builds', { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error('fetch builds failed');
        const json = await resp.json();
        if (mounted) {
          setSavedBuilds(Array.isArray(json) ? json : []);
          setBuildsLoaded(true);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load builds', e.message);
        if (mounted) setBuildsLoaded(true);
      }
    }
    loadBuilds();
    return () => { mounted = false; };
  }, []);

  // Build history derived from saved builds
  useEffect(() => {
    const history = savedBuilds.map(build => ({
      title: build.name || 'Untitled Build',
      date: build.createdAt ? new Date(build.createdAt).toLocaleDateString() : new Date(build.created_at || Date.now()).toLocaleDateString(),
      price: (build.total_price || 0).toLocaleString(),
      buildId: build.id,
      hasIssues: build.has_issues || (build.warnings && build.warnings.length > 0)
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    setBuildHistory(history);
  }, [savedBuilds]);

  const handleDeleteBuild = (build) => {
    setConfirmModal({
      show: true,
      title: 'Delete Build',
      message: `Are you sure you want to delete "${build.name || 'Untitled Build'}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteBuild(build.id)
    });
  };

  const confirmDeleteBuild = async (id) => {
    setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null });
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertModal({ show: true, message: 'Please log in', title: 'Login Required' });
      return;
    }
    try {
      const resp = await fetch(`/api/builds/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error('delete failed');
      setSavedBuilds(b => b.filter(x => x.id !== id));
    } catch (e) {
      setAlertModal({ show: true, message: 'Delete failed: ' + (e.message || 'unknown'), title: 'Delete Error' });
    }
  };

  const handleLoadBuild = (build) => {
    if (!build || !build.parts) return;
    try {
      localStorage.setItem('loadedBuild', JSON.stringify(build.parts));
      localStorage.setItem('editingBuildId', build.id);
      if (build.name) localStorage.setItem('editingBuildName', build.name);
      if (build.description) localStorage.setItem('editingBuildDescription', build.description);
      navigate('/builder/edit');
    } catch (e) {
      setAlertModal({ show: true, message: 'Failed to load build into builder', title: 'Load Error' });
    }
  };

  const handleViewBuild = (build) => {
    if (!build) return;
    setViewingBuild(build);
  };

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Hide the global site header while dashboard is visible
  useEffect(() => {
    document.body.classList.add('hide-global-header');
    return () => document.body.classList.remove('hide-global-header');
  }, []);

  const getButtonClass = (section) =>
    `sidebar-button ${activeSection === section ? 'active' : ''}`;

  const handleFirstTimePopupClose = () => {
    setShowFirstTimePopup(false);
  };

  const handleNewUser = () => {
    handleFirstTimePopupClose();
    // Navigate to pre-built systems or show pre-built options
    navigate('/prebuilt');
  };

  const handleExperiencedUser = () => {
    handleFirstTimePopupClose();
    // Navigate to custom builder
    navigate('/builder');
  };

  const handleLearnMore = () => {
    handleFirstTimePopupClose();
    // Navigate to learn page
    navigate('/learn');
  };

  return (
       <div className="header-parent">
      <div className="header-app">
        <LoggedInUserHeader
          isSmallScreen={isSmallScreen}
          onClickSettings={onClickSettings}
          onLogout={onLogout}
          onClickSignIn={onClickSignIn}
          onClickSignUp={onClickSignUp}
        />




<div className="dashboard-container">
       {/*----------------------------- Sidebar------------------------------------------- */}
  <aside className={`sidebar-db ${sidebarCollapsed ? 'collapsed' : ''}`}>
  <div className="sidebar-content">
    <div className="dashboard-title">
      <div className="dashboard-header">
        <h2 className="dashboard-title-text">
          <BarChart3 className="dashboard-icon" />
          {!sidebarCollapsed && <span className='db-text'>Dashboard</span>}
        </h2>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>

    <div className="buttons-container">
      <button
        className={getButtonClass('overview')}
        onClick={() => setActiveSection('overview')}
        title="Overview"
      >
        <Eye className="button-icon" size={18} />
        {!sidebarCollapsed && <span>Overview</span>}
      </button>

      <button
        className={getButtonClass('saved')}
        onClick={() => setActiveSection('saved')}
        title="Saved Builds"
      >
        <Save className="button-icon" size={18} />
        {!sidebarCollapsed && <span>Saved Builds</span>}
      </button>

      <button
        className={getButtonClass('history')}
        onClick={() => setActiveSection('history')}
        title="Build History"
      >
        <History className="button-icon" size={18} />
        {!sidebarCollapsed && <span>Build History</span>}
      </button>
          {/* Settings button for mobile view */}
          {isSmallScreen && (
            <button
              className="sidebar-button"
              onClick={onClickSettings}
              title="Settings"
            >
              <Settings className="button-icon" size={18} />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          )}
    </div>
  </div>

  {/* Bottom CTA Section */}

</aside>
        {/*------------------------------------------- Main Content Placeholder------------------- */}

{activeSection === 'overview' && (
<main className="main-content-overview">
  
<div className="welcome-box">
  <div className="welcome-content">
    <div className="welcome-text">
      <h2 className="gradientName">
        <span className="gradientText">Hello, {userName}!</span>
        <MdWavingHand className="wave-Icon" />
      </h2>
      <h3 className="text-h3">Welcome to your Dashboard</h3>
    </div>
  </div>
</div>


{/*---------------------------------------------OVERVIEW--------------------------------------- */}
<div className='container-1'>
  <div className='box box-1'>
    <div className="box-top">
      <p className="box-label">Total Builds
        <Save size={20}className="box-icon-1" />
      </p>
      <h2 className="box-value">{savedBuilds.length}</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">{savedBuilds.length === 0 ? 'No builds saved yet' : `${savedBuilds.length} build${savedBuilds.length !== 1 ? 's' : ''} saved`}</p>
    </div>
  </div>

  <div className='box box-2'>
    <div className="box-top">
      <p className="box-label">Average Build Cost
        <Cpu size={20} className="box-icon-2" />
      </p>
      <h2 className="box-value">{savedBuilds.length === 0 ? 'No Data' : `₱${average.toLocaleString()}`}</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">{savedBuilds.length === 0 ? 'No cost data yet' : `Est: ₱${estimatedMin.toLocaleString()} - ₱${estimatedMax.toLocaleString()} | Low to Highest: ₱${actualMin.toLocaleString()} - ₱${actualMax.toLocaleString()}`}</p>
    </div>
  </div>

  <div className='box box-4'>
    <div className="box-top">
      <p className="box-label">Bottlenecks & Warnings
       <TriangleAlert size={20} className="box-icon-4" />

      </p>
      <h2 className="box-value">{bottleneckCount}</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">{bottleneckCount === 0 ? 'No bottlenecks detected' : `${bottleneckCount} build${bottleneckCount !== 1 ? 's' : ''} with issues`}</p>
    </div>
  </div>
</div>

<div className='container-2'>

  {/* Recent Builds */}
  <div className="box-recentBuilds">
  <div className="box-header">
    <h3><FaTools /> Recent Builds</h3>
    <p>Your most recently created or modified PC builds</p>
  </div>

  {recentBuilds.length === 0 ? (
    <div className="no-data-box">
      <div className="no-data-icon"><FaTools /></div>
      <p className="no-data-msg">You haven’t saved any builds yet.</p>
      <p className="no-data-subtext">Start building your custom PC now!</p>
    </div>
  ) : (
    <>
      <ul className="build-list">
        {recentBuilds.map((build, index) => (
          <li key={index}>
            <strong>{build.name || 'Untitled Build'}</strong><br />
            Created: {build.createdAt ? new Date(build.createdAt).toLocaleDateString() : 'Unknown'} — ₱{(build.total_price || 0).toLocaleString()}
          </li>
        ))}
      </ul>
      <button className="view-button" onClick={() => setActiveSection('saved')}>View all Builds</button>
    </>
  )}
</div>


  {/* Detected Issues */}
  <div className='box-detectedIssues'>
  <div className="box-header">
    <h3><TriangleAlert size={20} /> Detected Issues</h3>
    <p>Bottlenecks and warnings in your builds</p>
  </div>

  {buildsWithIssues.length === 0 ? (
    <div className="no-data-box">
      <div className="no-data-icon"><FaCheckCircle /></div>
      <p className="no-data-msg">No issues detected yet.</p>
      <p className="no-data-subtext">Your builds are looking good so far.</p>
    </div>
  ) : (
    <>
      <ul className="issue-list">
        {buildsWithIssues.map((build, index) => (
          <li key={index}>
            <strong>Build name:</strong> {build.name || 'Untitled Build'}<br />
            <strong>Warnings:</strong> {build.warnings && build.warnings.length > 0 ? build.warnings.join(', ') : 'General issues detected'}
          </li>
        ))}
      </ul>
      <button className="view-button" onClick={() => setActiveSection('saved')}>View all Issues</button>
    </>
  )}
</div>
</div>

</main>
  )}

  {/*-----------------------------------SAVED HISTORY----------------------------------------------------- */}
{activeSection === 'saved' && (
  <main className="user-saved-builds">
    <div className="welcome-box">
  <div className="welcome-content">
    <div className="welcome-text">
      <h2 className="gradientName">
        <span className="gradientText">Hello, {userName}!</span>
        <MdWavingHand className="wave-Icon" />
      </h2>
      <h3 className="text-h3">Welcome to your Saved Builds</h3>
    </div>
  </div>
</div>


   <div className="saved-builds-container">
  {savedBuilds.length === 0 ? (
    <div className="saved-build-box empty">
      <div className="empty-icon"><FaBoxOpen /></div>
      <h3>No Saved Builds</h3>
      <p>You haven't saved any builds yet.</p>
      <p>Start creating one from the builder!</p>
    </div>
  ) : (
    <div style={{ maxWidth: 720, width: '100%' }}>
      {savedBuilds.map(b => (
        <SavedBuildCard
          key={b.id}
          build={b}
          onDelete={handleDeleteBuild}
          onLoad={handleLoadBuild}
          onView={handleViewBuild}
          onShare={(build) => setSharingBuild(build)}
        />
      ))}
    </div>
  )}
</div>
<SavedBuildModal
      build={viewingBuild}
      onClose={() => setViewingBuild(null)}
      onLoad={(b) => { handleLoadBuild(b); setViewingBuild(null); }}
    />
    <ShareSavedBuildModal
      build={sharingBuild}
      onClose={() => setSharingBuild(null)}
      onShared={(resp) => { setSharingBuild(null); setJustSharedId(resp?.id); /* could toast */ }}
    />
  </main>
)}

     {/*------------------------------------------- HISTORY------------------- */}
     {activeSection === 'history' && (
      <main className="user-history-builds">
        <div className="welcome-box">
          <div className="welcome-content">
            <div className="welcome-text">
              <h2 className="gradientName">
                <span className="gradientText">Hello, {userName}!</span>
                <MdWavingHand className="wave-Icon" />
              </h2>
              <h3 className="text-h3">Welcome to your Build History</h3>
            </div>
          </div>
        </div>


<div className="box-buildHistory">
      <div className="box-header">
        <h3><FaHistory /> Build History</h3>
        <p>Track your saved builds over time</p>
      </div>

      {buildHistory.length === 0 ? (
        <div className="no-data-box">
          <div className="no-data-icon"><FaHistory /></div>
          <p className="no-data-msg">No build history yet.</p>
          <p className="no-data-subtext">Start creating builds to track your progress.</p>
        </div>
      ) : (
        <>
          <ul className="history-list">
            {buildHistory.map((history, index) => (
              <li key={index}>
                <strong>{history.title}</strong>
                {history.hasIssues && <span className="issue-indicator"> ⚠️</span>}<br />
                {history.date} — ₱{history.price}
              </li>
            ))}
          </ul>
          <button className="view-button" onClick={() => setActiveSection('saved')}>View All Builds</button>
        </>
      )}
    </div>

      </main>




     )}
  
  




  
</div>

      </div>
    
      
      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModal.show}
        onClose={() => setAlertModal({ show: false, message: '', title: 'Alert' })}
        title={alertModal.title}
        message={alertModal.message}
      />
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      {/* First Time Popup */}
      <FirstTimePopup
        isOpen={showFirstTimePopup}
        onClose={handleFirstTimePopupClose}
        onNewUser={handleNewUser}
        onExperiencedUser={handleExperiencedUser}
        onLearnMore={handleLearnMore}
      />
    </div>
    

    
  );
}

export default UserOverview;
