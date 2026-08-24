import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/UIElements';
import ImageCropperModal from '../common/ImageCropperModal';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudySync } from '../../context/StudySyncContext';

const themeOptions = [
  { id: 'violet', label: 'Violet (Default)', color: '#6366f1' },
  { id: 'teal', label: 'Emerald Teal', color: '#0d9488' },
  { id: 'rose', label: 'Sunset Rose', color: '#e11d48' },
  { id: 'amber', label: 'Amber Gold', color: '#d97706' },
  { id: 'cyan', label: 'Cyan Wave', color: '#0891b2' },
];

const avatarBadges = ['🎓', '💻', '🔬', '📚', '🎨', '🚀', '⚡', '🏆', '🎯', '🔥'];

export default function ProfileModal({ onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const { accent, setAccent, darkMode, toggleDarkMode } = useTheme();
  const { data, showToast } = useStudySync();
  const navigate = useNavigate();

  const [tab, setTab] = useState('account');
  const [name, setName] = useState(user?.name || 'Chavan Ravindra');
  const [email, setEmail] = useState(user?.email || 'ravindrachavan265125@gmail.com');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyTargetHours, setDailyTargetHours] = useState(user?.dailyTargetHours || 4);
  const [theme, setThemeState] = useState(user?.theme || accent || 'violet');
  const [avatarBadge, setAvatarBadge] = useState(user?.avatarBadge || '🎓');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [cropperSrc, setCropperSrc] = useState(null);
  const [defaultFocusMinutes, setDefaultFocusMinutes] = useState(user?.defaultFocusMinutes || 25);
  const [enableReminders, setEnableReminders] = useState(user?.enableReminders ?? true);
  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleModalDevicePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeSelect = (themeId) => {
    setThemeState(themeId);
    setAccent(themeId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        dailyTargetHours: Number(dailyTargetHours),
        theme,
        avatarBadge,
        profilePictureUrl,
        defaultFocusMinutes: Number(defaultFocusMinutes),
        enableReminders,
        soundEnabled,
      });
      showToast('Profile & preferences saved successfully! ✨');
      onClose();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your StudySync workspace?')) {
      logout();
      onClose();
      showToast('Logged out securely. See you soon! 👋');
      navigate('/login');
    }
  };

  const streak = data.dashboard?.streakCount || user?.streakCount || 0;
  const productivityScore = data.dashboard?.productivityScore || 85;

  return (
    <>
      <Modal title="Student Profile & Settings" onClose={onClose}>
        {/* Top User Overview Summary Card */}
        <div className="profile-hero-card">
          <div className="profile-hero-avatar-wrap">
            <Avatar user={{ ...user, profilePictureUrl, avatarBadge }} />
            <input
              type="file"
              id="quick-photo-change"
              accept="image/*"
              onChange={handleModalDevicePhoto}
              style={{ display: 'none' }}
            />
            <label htmlFor="quick-photo-change" className="photo-edit-badge" title="Change profile photo">
              📷
            </label>
          </div>

          <div className="profile-hero-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="profile-hero-name">{name || 'Student'}</h3>
              <span className={`role-badge ${user?.role === 'ADMIN' ? 'admin' : 'user'}`}>
                {user?.role === 'ADMIN' ? '🛡️ ADMIN' : '🎓 STUDENT'}
              </span>
            </div>
            <p className="profile-hero-email">{email}</p>
            <div className="profile-hero-badges">
              <span className="hero-stat-pill">🔥 {streak} Day Streak</span>
              <span className="hero-stat-pill">⚡ {productivityScore}/100 Score</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'account' ? 'active' : ''}`}
            onClick={() => setTab('account')}
          >
            👤 Account
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'appearance' ? 'active' : ''}`}
            onClick={() => setTab('appearance')}
          >
            🎨 Theme & Avatar
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'study' ? 'active' : ''}`}
            onClick={() => setTab('study')}
          >
            ⚙️ Preferences
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          {/* TAB 1: ACCOUNT DETAILS */}
          {tab === 'account' && (
            <div className="profile-tab-content">
              <div className="field-group">
                <label>Full Display Name *</label>
                <input
                  type="text"
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Chavan Ravindra"
                />
                <small className="field-help-text">Used on your workspace header and certificates.</small>
              </div>

              <div className="field-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
                <small className="field-help-text">Used for sign-in and recovery notices.</small>
              </div>

              <div className="field-group">
                <label>Study Goal / Academic Bio</label>
                <textarea
                  className="textarea-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="2"
                  placeholder="e.g. Computer Science student mastering Algorithms & Spring Boot!"
                />
              </div>

              <div className="field-group">
                <label>Daily Study Target (Hours)</label>
                <input
                  type="number"
                  className="text-input"
                  value={dailyTargetHours}
                  onChange={(e) => setDailyTargetHours(e.target.value)}
                  min="1"
                  max="16"
                />
              </div>
            </div>
          )}

          {/* TAB 2: THEME & AVATAR */}
          {tab === 'appearance' && (
            <div className="profile-tab-content">
              <div className="field-group">
                <label>Profile Picture</label>
                <div className="file-upload-picker">
                  <input
                    type="file"
                    id="modal-device-pic"
                    accept="image/*"
                    onChange={handleModalDevicePhoto}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="modal-device-pic" className="file-upload-btn">
                    {profilePictureUrl ? (
                      <img src={profilePictureUrl} alt="Preview" className="avatar-preview-img" />
                    ) : (
                      <div className="file-upload-placeholder">
                        <span style={{ fontSize: '24px' }}>📷</span>
                        <span>Upload photo from device</span>
                      </div>
                    )}
                  </label>
                  {profilePictureUrl && (
                    <button
                      type="button"
                      className="btn-link text-danger"
                      style={{ marginTop: '8px', fontSize: '12px' }}
                      onClick={() => setProfilePictureUrl('')}
                    >
                      Remove custom photo
                    </button>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label>Avatar Badge Emoji</label>
                <div className="avatar-picker-grid">
                  {avatarBadges.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      className={`avatar-badge-option ${avatarBadge === badge ? 'active' : ''}`}
                      onClick={() => setAvatarBadge(badge)}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Theme Accent Color</label>
                <div className="theme-swatch-grid">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`theme-swatch-btn ${theme === opt.id ? 'active' : ''}`}
                      onClick={() => handleThemeSelect(opt.id)}
                    >
                      <span className="swatch-color-dot" style={{ background: opt.color }} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Theme Mode</label>
                <button
                  type="button"
                  className="btn-outline full-width"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={toggleDarkMode}
                >
                  {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY PREFERENCES */}
          {tab === 'study' && (
            <div className="profile-tab-content">
              <div className="field-group">
                <label>Default Pomodoro Interval</label>
                <select
                  className="select-input"
                  value={defaultFocusMinutes}
                  onChange={(e) => setDefaultFocusMinutes(Number(e.target.value))}
                >
                  <option value={15}>15 Minutes (Quick Sprint)</option>
                  <option value={25}>25 Minutes (Standard Pomodoro)</option>
                  <option value={50}>50 Minutes (Deep Work Flow)</option>
                  <option value={90}>90 Minutes (Intensive Study)</option>
                </select>
              </div>

              <label className="checkbox-field" style={{ marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                />
                <span>Daily study notifications & overdue task alerts</span>
              </label>

              <label className="checkbox-field" style={{ marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span>Play completion audio chime when Pomodoro timer ends</span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="profile-modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', flexDirection: 'column' }}>
            <button className="btn-primary full-width" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile & Settings ✨'}
            </button>

            <button
              type="button"
              className="btn-danger-outline full-width"
              onClick={handleLogout}
            >
              🚪 Log Out of StudySync
            </button>
          </div>
        </form>
      </Modal>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          onCrop={(croppedData) => {
            setProfilePictureUrl(croppedData);
            setCropperSrc(null);
          }}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </>
  );
}
