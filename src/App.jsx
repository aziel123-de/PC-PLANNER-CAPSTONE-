import PreBuilt_Nav from './Pre-built/PreBuilt_Nav.jsx';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { forceUnlockAllScroll } from './utils/scrollLock.js';
import Login from './LoginForm/Login.jsx';
import SignUp from './SignUpForm/SignUp.jsx';
import Header from './HomepageForm/Header.jsx';
import LoggedInUserHeader from './UserDashboard-main/Dashboard/loggedInUserHeader';
import Section from './HomepageForm/Section.jsx';
import Footer from './HomepageForm/Footer.jsx';
import BuilderPage from "./PCBuilder/BuildingPCPage/BuilderPage.jsx";
import BuilderPageEdit from "./PCBuilderEdit/BuildingPCPage/BuilderPageEdit.jsx";
import All from "./Pre-built/All.jsx";
import Gaming from "./Pre-built/Gaming.jsx";
import Productivity from './Pre-built/Productivity.jsx';
import GeneralUse from './Pre-built/GeneralUse.jsx';
import ComponentPage from './Components/ComponentPage.jsx';
import LearnPage from "./Learn/Navigation/LearnPage.jsx";
import ComponentsPage from './Learn/Navigation/ComponentsPage.jsx';
import CompatibilityPage from './Learn/Navigation/CompatibilityPage.jsx';
import BottlenecksPage from './Learn/Navigation/BottlenecksPage.jsx';
import BudgettipsPage from './Learn/Navigation/BudgettipsPage.jsx';
import UserOverview from './UserDashboard-main/Dashboard/UserOverview.jsx';
import UserSettings from './UserDashboard-main/Dashboard/UserSettings.jsx';

// removed Dashboard (UserOverview/UserSettings) imports and routes

function App() {
  const location = useLocation();

  // hide header on these routes
  const hideHeaderOn = ['/login', '/signup'];
  const navigate = useNavigate();

  // decide logged-in by token in localStorage (matches other components)
  const rawToken = (localStorage.getItem('token') || '').trim();
  const isLoggedIn = !!rawToken && rawToken !== 'null' && rawToken !== 'undefined';

  const topLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    } catch (e) {}
    navigate('/');
  };

  const showHeader = !hideHeaderOn.includes(location.pathname);
  const isDashboard = location.pathname === '/dashboard';

  // On every route change, ensure body scroll isn't accidentally locked
  useEffect(() => {
    forceUnlockAllScroll();
  }, [location.pathname]);

  return (
    <>
      {/* render header except on login/signup; choose logged-in header when token exists */}
      { showHeader && (
        isLoggedIn ? (
          <LoggedInUserHeader
            isSmallScreen={false}
            onClickSettings={() => navigate('/settings')}
            onLogout={topLogout}
            onClickSignIn={() => navigate('/login')}
            onClickSignUp={() => navigate('/signup')}
          />
        ) : (
          <Header />
        )
      ) }

      <div className={showHeader && !isDashboard ? 'with-global-header' : ''}>
        <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Section />
                <Footer />
              </>
            }
          />

          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/signup" element={<SignUpWrapper />} />

          {/* PCBUILDER routes */}
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/builder/edit" element={<BuilderPageEdit />} />

          {/* Prebuilt routes with navigation */}
          <Route path="/prebuilt/" element={<><PreBuilt_Nav /><All /></>} />
          <Route path="/prebuilt/all" element={<><PreBuilt_Nav /><All /></>} />
          <Route path="/prebuilt/gaming" element={<><PreBuilt_Nav /><Gaming /></>} />
          <Route path="/prebuilt/productivity" element={<><PreBuilt_Nav /><Productivity /></>} />
          <Route path="/prebuilt/generaluse" element={<><PreBuilt_Nav /><GeneralUse /></>} />

          <Route path="/components" element={<ComponentPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/components" element={<ComponentsPage />} />
          <Route path="/learn/compatibility" element={<CompatibilityPage />} />
          <Route path="/learn/bottlenecks" element={<BottlenecksPage />} />
          <Route path="/learn/budget-tips" element={<BudgettipsPage />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/settings" element={<SettingsWrapper />} />
        </Routes>
      </main>
      </div>
    </>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <Login
      onBackClick={() => navigate('/')}
      onSignUpClick={() => navigate('/signup')}
      onLoginSuccess={() => navigate('/')} // go home after login
    />
  );
}

function SignUpWrapper() {
  const navigate = useNavigate();
  return (
    <SignUp
      onBackClick={() => navigate('/')}
      onLoginClick={() => navigate('/login')}
      onLoginSuccess={() => navigate('/')} // go home after signup
    />
  );
}

export default App;

function DashboardWrapper() {
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    } catch {}
    navigate('/');
  };
  return (
    <UserOverview
      onClickSettings={() => navigate('/settings')}
      onLogout={handleLogout}
      onClickSignIn={() => navigate('/login')}
      onClickSignUp={() => navigate('/signup')}
      onBackClick={() => navigate('/')}
    />
  );
}

function SettingsWrapper() {
  const navigate = useNavigate();
  let userId = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) userId = JSON.parse(raw)?.id || null;
  } catch {}
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    } catch {}
    navigate('/');
  };
  return (
    <UserSettings
      userId={userId}
      onBack={() => navigate('/dashboard')}
      onLogout={handleLogout}
    />
  );
}