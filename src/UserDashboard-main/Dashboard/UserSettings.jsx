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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showReservedNameModal, setShowReservedNameModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  // Header is rendered globally; no local nav state needed
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
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
          if (userData.profile_picture) {
            // Handle both Base64 data and old file paths
            if (userData.profile_picture.startsWith('data:')) {
              // Base64 data - use directly
              setProfilePictureUrl(userData.profile_picture);
            } else if (userData.profile_picture.startsWith('http')) {
              // Full URL - use directly
              setProfilePictureUrl(userData.profile_picture);
            } else {
              // File path - construct URL
              setProfilePictureUrl(`${window.location.origin}${userData.profile_picture}`);
            }
          }
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
    
    // Prevent non-authorized users from using PCPlannerMain
    if (name === 'fullName' && value === 'PCPlannerMain' && formData.email !== 'pcplannermain@gmail.com') {
      setShowReservedNameModal(true);
      return;
    }
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setProfilePictureUrl(previewUrl);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      let newProfilePicture = profilePictureUrl;

      // Upload profile picture FIRST if selected
      if (formData.profilePicture) {
        try {
          const uploadResult = await handleProfilePictureUpload();
          newProfilePicture = uploadResult;
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          setSaving(false);
          alert(`Profile picture upload failed: ${uploadError.message}`);
          return;
        }
      }

      // Then update user name
      const updateData = {
        full_name: formData.fullName
      };

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
        const newFullName = updatedUser.full_name || updatedUser.fullName || formData.fullName;
        const newEmail = updatedUser.email || formData.email;
        
        setFormData((prev) => ({ ...prev, fullName: newFullName, email: newEmail, profilePicture: null }));

        // Update profile picture URL in state
        if (newProfilePicture) {
          setProfilePictureUrl(newProfilePicture);
        }

        // Update localStorage
        try {
          const rawLocal = localStorage.getItem('user');
          const localUser = rawLocal ? JSON.parse(rawLocal) : {};
          const merged = {
            ...localUser,
            full_name: newFullName,
            username: newFullName,
            displayName: newFullName,
            email: newEmail,
            profile_picture: newProfilePicture,
            photoURL: newProfilePicture
          };
          localStorage.setItem('user', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('authChanged', { detail: merged }));
        } catch (e) {
          console.warn('Failed to update localStorage user:', e);
        }

        setShowSuccessDialog(true);
      } else {
        const error = await response.json();
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!formData.profilePicture || !userId) {
      throw new Error('No file selected or user ID missing');
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('profilePicture', formData.profilePicture);

    const token = localStorage.getItem('token');
    const uploadResponse = await fetch(`/api/users/${userId}/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formDataToSend,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      let errorMessage = 'Upload failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const uploadResult = await uploadResponse.json();
    const picUrl = uploadResult.profile_picture; // Base64 data from server
    
    setProfilePictureUrl(picUrl);
    return picUrl;
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
              <img src={profilePictureUrl || profDefault} alt="User" className="profile-avatar" />
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

          {/* Success Dialog */}
          {showSuccessDialog && (
            <div className="success-modal-overlay">
              <div className="success-modal-box">
                <h3>Success!</h3>
                <p>Profile updated successfully!</p>
                <div className="success-modal-actions">
                  <button 
                    onClick={() => setShowSuccessDialog(false)}
                    className="success-ok-btn"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reserved Name Modal */}
          {showReservedNameModal && (
            <div className="success-modal-overlay">
              <div className="success-modal-box">
                <h3>⚠️ Reserved Name</h3>
                <p>The name "PCPlannerMain" is reserved for official PC Planner accounts only and cannot be used by regular users.</p>
                <div className="success-modal-actions">
                  <button 
                    onClick={() => setShowReservedNameModal(false)}
                    className="success-ok-btn"
                  >
                    Understood
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
