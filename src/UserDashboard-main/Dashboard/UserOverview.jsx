import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserOverview.css';
import pcImage from './PC.png';
import { BarChart3, Eye, Save, History, Settings, Cpu, Clock3, TriangleAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import SavedBuildCard from './SavedBuildCard';
import { MdWavingHand } from 'react-icons/md';
import LoggedInUserHeader from './loggedInUserHeader';
import SavedBuildModal from './SavedBuildModal';
import ShareSavedBuildModal from './ShareSavedBuildModal';



function UserOverview({ onClickSettings, onLogout, onClickSignIn, onClickSignUp,onBackClick }) {
  const navigate = useNavigate();
// -------------------------- PUT THE DROPDOWN ACCOUNT HERE --------------------------------------
  const userName = '';
  // data in backend
  const recentBuilds = [];
  const detectedIssues =[];

// ------------------------------- CURRENT DATE UPDATED ---------------------------------
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// ----------------------------------------------------------------
  
  const [activeSection, setActiveSection] = useState('overview');
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [buildHistory, setBuildHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false); // Track user manual collapse
  const [viewingBuild, setViewingBuild] = useState(null);
  const [sharingBuild, setSharingBuild] = useState(null);
  const [justSharedId, setJustSharedId] = useState(null);

  // Header is rendered by LoggedInUserHeader component


  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!isSmallScreen) {
      setUserCollapsed(!sidebarCollapsed); // Track user preference on large screens
    }
  };

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const smallScreen = window.innerWidth <= 1024;
      setIsSmallScreen(smallScreen);
      
      if (smallScreen) {
        setSidebarCollapsed(true);
        setUserCollapsed(false); // Reset user preference on small screen
      } else {
        // On large screen, use user preference or default to expanded
        setSidebarCollapsed(userCollapsed);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [userCollapsed]);

  

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
        if (mounted) setSavedBuilds(Array.isArray(json) ? json : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load builds', e.message);
      }
    }
    loadBuilds();
    return () => { mounted = false; };
  }, []);

  // Build history placeholder (could derive from saved builds in time)
  useEffect(() => {
    setBuildHistory([]);
  }, [savedBuilds]);

  const handleDeleteBuild = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in');
    try {
      const resp = await fetch(`/api/builds/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error('delete failed');
      setSavedBuilds(b => b.filter(x => x.id !== id));
    } catch (e) {
      alert('Delete failed: ' + (e.message || 'unknown'));
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
      alert('Failed to load build into builder');
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
  <div className="sidebar-overlay"></div>
  <div className="decorative-element"></div>
  <div className="decorative-element-2"></div>

  <div className="sidebar-content">
    <div className="dashboard-title">
      <div className="dashboard-header">
        <h2 className="dashboard-title-text">
          <BarChart3 className="dashboard-icon" />
          {!sidebarCollapsed && <span>Dashboard</span>}
        </h2>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {!sidebarCollapsed && (
        <>
          <div className="dashboard-underline"></div>
          <svg className="fancy-divider" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 C25,0 75,20 100,10" stroke="#1e3a8a" strokeWidth="3" fill="none" />
          </svg>
        </>
      )}
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

    <div className="welcome-image">
      <img src={pcImage} alt="PC Illustration" />
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
      <h2 className="box-value">No Data</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">No cost data yet</p>
    </div>
  </div>

  <div className='box box-2'>
    <div className="box-top">
      <p className="box-label">Average Build Cost
        <Cpu size={20} className="box-icon-2" />
      </p>
      <h2 className="box-value">No Data</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">No usage data</p>
    </div>
  </div>

  <div className='box box-3'>
    <div className="box-top">
      <p className="box-label">Builds
        <Clock3 size={20} className="box-icon-3" />
      </p>
      <h2 className="box-value">0</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">You haven't saved any</p>
    </div>
  </div>

  <div className='box box-4'>
    <div className="box-top">
      <p className="box-label">Bottlenecks & Warnings
       <TriangleAlert size={20} className="box-icon-4" />

      </p>
      <h2 className="box-value">No Data</h2>
    </div>
    <div className="box-bottom">
      <p className="box-note">No recent activity</p>
    </div>
  </div>
</div>

<div className='container-2'>

  {/* Recent Builds */}
  <div className="box-recentBuilds">
  <div className="box-header">
    <h3>Recent Builds</h3>
    <p>Your most recently created or modified PC builds</p>
  </div>

  {recentBuilds.length === 0 ? (
    <div className="no-data-box">
      <div className="no-data-icon">🛠️</div>
      <p className="no-data-msg">You haven’t saved any builds yet.</p>
      <p className="no-data-subtext">Start building your custom PC now!</p>
    </div>
  ) : (
    <>
      <ul className="build-list">
        {recentBuilds.map((build, index) => (
          <li key={index}>
            <strong>{build.name}</strong><br />
            {build.specs} — ₱{build.price}
          </li>
        ))}
      </ul>
      <button className="view-button">View all Builds</button>
    </>
  )}
</div>


  {/* Detected Issues */}
  <div className='box-detectedIssues'>
  <div className="box-header">
    <h3>Detected Issues</h3>
    <p>Bottlenecks and warnings in your builds</p>
  </div>

  {detectedIssues.length === 0 ? (
    <div className="no-data-box">
      <div className="no-data-icon">✅</div>
      <p className="no-data-msg">No issues detected yet.</p>
      <p className="no-data-subtext">Your builds are looking good so far.</p>
    </div>
  ) : (
    <>
      <ul className="issue-list">
        {detectedIssues.map((issue, index) => (
          <li key={index}>
            <strong>{issue.type}</strong>: {issue.message}
          </li>
        ))}
      </ul>
      <button className="view-button">View all Issues</button>
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

    <div className="welcome-image">
      <img src={pcImage} alt="PC Illustration" />
    </div>
  </div>
</div>


   <div className="saved-builds-container">
  {savedBuilds.length === 0 ? (
    <div className="saved-build-box empty">
      <div className="empty-icon">🗃️</div>
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

    <div className="welcome-image">
      <img src={pcImage} alt="PC Illustration" />
    </div>
  </div>
</div>


<div className="box-buildHistory">
      <div className="box-header">
        <h3>Build History</h3>
        <p>Track your saved builds over time</p>
      </div>

      {buildHistory.length === 0 ? (
        <div className="no-data-box">
          <div className="no-data-icon">📜</div>
          <p className="no-data-msg">No build history yet.</p>
          <p className="no-data-subtext">Start creating builds to track your progress.</p>
        </div>
      ) : (
        <>
          <ul className="history-list">
            {buildHistory.map((history, index) => (
              <li key={index}>
                <strong>{history.title}</strong><br />
                {history.date} — ₱{history.price}
              </li>
            ))}
          </ul>
          <button className="view-button">View Full History</button>
        </>
      )}
    </div>






      </main>




     )}
  
  




  
</div>

      </div>
      
    </div>
    

    
  );
}

export default UserOverview;
