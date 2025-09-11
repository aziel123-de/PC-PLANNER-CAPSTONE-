import React, { useState, useEffect, useRef } from 'react';
import './UserSettings.css';
import profDefault from './profDefault.webp';
import { RiDashboardFill } from 'react-icons/ri';
import { FiLogOut } from 'react-icons/fi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../HomepageForm/LOGO.png';
import LoggedInUserHeader from './loggedInUserHeader';

function UserSettings({ onBack, onLogout, userId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  // Header is rendered globally; no local nav state needed
  const [formData, setFormData] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          fullName: u.full_name || u.username || u.displayName || '',
          email: u.email || '',
          profilePicture: null
        };
      }
    } catch (e) {
      // ignore
    }
    return { fullName: '', email: '', profilePicture: null };
  });

  // Fetch user data from MySQL database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Only try to fetch if userId is provided and we want to load real data
      if (!userId) {
        return; // Use default example data if no userId
      }
      
      try {
        setLoading(true);
        // MySQL API endpoint to fetch user by ID
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            fullName: userData.full_name || userData.fullName || userData.username || 'Hazel Ann Sadangsal',
            email: userData.email || 'user@example.com',
            profilePicture: null
          });
        } else {
          const error = await response.json();
          console.error('Failed to fetch user data:', error.message);
          // Keep default values if fetch fails
        }
      } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        // Keep default values if there's a connection error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Hide the global site header while settings is visible
  useEffect(() => {
    document.body.classList.add('hide-global-header');
    return () => document.body.classList.remove('hide-global-header');
  }, []);

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
        setSidebarCollapsed(userCollapsed);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [userCollapsed]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Prevent email changes
    if (name === 'email') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // For MySQL, we'll send JSON data for user info (excluding email)
      const updateData = {
        full_name: formData.fullName,
        updated_at: new Date().toISOString()
      };

      // Update user data in MySQL
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Profile updated successfully in MySQL:', updatedUser);

        // Update local form state with the returned values (if any)
        const newFullName = updatedUser.full_name || updatedUser.fullName || formData.fullName;
        const newEmail = updatedUser.email || formData.email;
        setFormData((prev) => ({ ...prev, fullName: newFullName, email: newEmail }));

        // Merge changes into localStorage user so header updates immediately
        try {
          const rawLocal = localStorage.getItem('user');
          const localUser = rawLocal ? JSON.parse(rawLocal) : {};
          const merged = {
            ...localUser,
            full_name: newFullName,
            username: newFullName,
            displayName: newFullName,
            email: newEmail
          };
          localStorage.setItem('user', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('authChanged', { detail: merged }));
        } catch (e) {
          console.warn('Failed to update localStorage user:', e);
        }

        // Handle profile picture upload separately if needed
        if (formData.profilePicture) {
          await handleProfilePictureUpload();
        }

        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to update profile in MySQL:', error.message);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile in MySQL database:', error);
      alert('An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profilePicture', formData.profilePicture);
      formDataToSend.append('userId', userId);

      const uploadResponse = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formDataToSend,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        
        // Update user record with new profile picture path
        await fetch(`/api/users/${userId}/profile-picture`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile_picture: uploadResult.filePath,
            updated_at: new Date().toISOString()
          }),
        });
        
        console.log('Profile picture updated in MySQL:', uploadResult.filePath);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  return (
  <div className="user-settings-wrapper">
    <LoggedInUserHeader isSmallScreen={window.innerWidth <= 1024} onClickSettings={() => {}} onLogout={onLogout} />

      <div className="profile-page-container">
        {/* Sidebar  */}
        <aside className={`sidebar-settings ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Removed decorative elements */}
          <div className="sidebar-content-settings">
            <div className="profile-header-settinds" style={isSmallScreen ? { position: 'relative', width: '100%' } : {}}>
              {isSmallScreen && (
                <button
                  className="sidebar-toggle-btn-settings"
                  onClick={toggleSidebar}
                  style={{ position: 'absolute', top: 0, right: 0 }}
                >
                  {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              )}
              <img src={profDefault} alt="User" className="profile-avatar" />
              {!sidebarCollapsed && (
                <>
                  {formData.fullName && (
                    <h2 className="profile-name-settings">
                      {loading ? 'Loading...' : formData.fullName}
                    </h2>
                  )}
                  {formData.email && (
                    <p className="profile-email">
                      {loading ? 'Loading...' : formData.email}
                    </p>
                  )}
                </>
              )}
              
              <button className="back-to-db" onClick={onBack} title="Back to Dashboard">
                <RiDashboardFill className="button-icon" />
                {!sidebarCollapsed && <span>Back to Dashboard</span>}
              </button>
            </div>
            {!sidebarCollapsed && <div className="settings-underline"></div>}

            <div className="buttons-container-settings">
              <button
                className="log-out-acc"
                onClick={() => setShowConfirm(true)}
                title="Log Out"
              >
                <FiLogOut className="button-icon" />
                {!sidebarCollapsed && <span>Log Out</span>}
              </button>
            </div>
          </div>

          {showConfirm && (
            <div className="popup-overlay">
              <div className="popup-box">
                <p className='popup-message'>Are you sure you want to log out?</p>
                <div className="popup-buttons">
                  <button
                    onClick={() => {
                      console.log('Yes button clicked');
                      setShowConfirm(false);
                      if (onLogout) {
                        console.log('Calling onLogout function');
                        onLogout();
                      } else {
                        console.log('onLogout function not provided');
                      }
                    }}
                    className="signout-confirm-btn-settings"
                  >
                    Yes
                  </button>
                  
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="signout-cancel-btn-settings"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
       
        {/* Main Content */}
        <main className="profile-content">
          <h2>Edit Profile</h2>
          <p>Update your personal information</p>

          {loading ? (
            <div className="loading-container">
              <p>Loading user data...</p>
            </div>
          ) : (
            <form className="edit-profile-form" onSubmit={handleSubmit}>
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={saving}
              />

              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                readOnly
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small>Email address cannot be changed for security reasons</small>

              <label>Profile Picture</label>
              <input 
                type="file" 
                name="profilePicture"
                onChange={handleInputChange}
                accept="image/jpeg,image/png"
                disabled={saving}
              />
              <small>Maximum file size: 2MB. Supported formats: JPEG, PNG</small>

              <button type="submit" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserSettings;
