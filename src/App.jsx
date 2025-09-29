import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { forceUnlockAllScroll } from './utils/scrollLock.js';
import Login from './LoginForm/Login.jsx';
import SignUp from './SignUpForm/SignUp.jsx';
import ForgotPassword from './LoginForm/ForgotPassword.jsx';
import NewPassword from './LoginForm/NewPassword.jsx';
import Header from './HomepageForm/Header.jsx';
import LoggedInUserHeader from './UserDashboard-main/Dashboard/loggedInUserHeader';
import Section from './HomepageForm/Section.jsx';
import Footer from './HomepageForm/Footer.jsx';
import BuilderPage from "./PCBuilder/BuildingPCPage/BuilderPage.jsx";
import BuilderPageEdit from "./PCBuilderEdit/BuildingPCPage/BuilderPageEdit.jsx";
// Legacy Pre-built components removed; community builds now replace them
import ComponentPage from './Components/ComponentPage.jsx';
import LearnPage from "./Learn/Navigation/LearnPage.jsx";
import ComponentsPage from './Learn/Navigation/ComponentsPage.jsx';
import CompatibilityPage from './Learn/Navigation/CompatibilityPage.jsx';
import BottlenecksPage from './Learn/Navigation/BottlenecksPage.jsx';
import BudgettipsPage from './Learn/Navigation/BudgettipsPage.jsx';
import UserOverview from './UserDashboard-main/Dashboard/UserOverview.jsx';
import UserSettings from './UserDashboard-main/Dashboard/UserSettings.jsx';
import CommunityList from './Pre-built/CommunityList';
import CommunityBuildModal from './Pre-built/CommunityBuildModal';

// removed Dashboard (UserOverview/UserSettings) imports and routes

function App() {
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // hide header on these routes
  const hideHeaderOn = ['/login', '/signup', '/forgot-password', '/newpassword'];
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
  const isAuthPage = hideHeaderOn.includes(location.pathname); // login or signup

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
            isSmallScreen={isSmallScreen}
            onClickSettings={() => navigate('/settings')}
            onLogout={topLogout}
            onClickSignIn={() => navigate('/login')}
            onClickSignUp={() => navigate('/signup')}
          />
        ) : (
          <Header />
        )
      ) }

      {/* Only wrap with header classes and main-content if NOT on auth pages */}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/signup" element={<SignUpWrapper />} />
          <Route path="/forgot-password" element={<ForgotPasswordWrapper />} />
          <Route path="/newpassword" element={<NewPasswordWrapper />} />
        </Routes>
      ) : (
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

              {/* PCBUILDER routes */}
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/builder/edit" element={<BuilderPageEdit />} />

              {/* Prebuilt legacy paths now redirect/show CommunityList */}
              <Route path="/prebuilt" element={<CommunityList />} />
              <Route path="/prebuilt/" element={<CommunityList />} />
              <Route path="/prebuilt/all" element={<CommunityList />} />
              <Route path="/prebuilt/gaming" element={<CommunityList />} />
              <Route path="/prebuilt/productivity" element={<CommunityList />} />
              <Route path="/prebuilt/generaluse" element={<CommunityList />} />

              <Route path="/components" element={<ComponentPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/learn/components" element={<ComponentsPage />} />
              <Route path="/learn/compatibility" element={<CompatibilityPage />} />
              <Route path="/learn/bottlenecks" element={<BottlenecksPage />} />
              <Route path="/learn/budget-tips" element={<BudgettipsPage />} />

              {/* Dashboard routes */}
              <Route path="/dashboard" element={<DashboardWrapper />} />
              <Route path="/settings" element={<SettingsWrapper />} />
              <Route path="/community" element={<CommunityList />} />
            </Routes>
          </main>
        </div>
      )}
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

function ForgotPasswordWrapper() {
  const navigate = useNavigate();
  return (
    <ForgotPassword
      // ForgotPassword uses its own back button; still provide a prop if needed
      onBack={() => navigate(-1)}
    />
  );
}

function NewPasswordWrapper() {
  const navigate = useNavigate();
  return (
    <NewPassword
      onBack={() => navigate(-1)}
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