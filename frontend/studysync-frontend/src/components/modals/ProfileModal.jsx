import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/UIElements';
import ImageCropperModal from '../common/ImageCropperModal';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudySync } from '../../context/StudySyncContext';

const themeOptions = [
  { id: 'violet', label: 'Violet', color: '#6366f1' },
  { id: 'teal', label: 'Teal', color: '#0d9488' },
  { id: 'rose', label: 'Rose', color: '#e11d48' },
  { id: 'amber', label: 'Amber', color: '#d97706' },
  { id: 'cyan', label: 'Cyan', color: '#0891b2' },
];

const avatarBadges = ['🎓', '💻', '🔬', '📚', '🚀', '⚡', '🏆', '🔥'];

export default function ProfileModal({ onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const { accent, setAccent, darkMode, toggleDarkMode } = useTheme();
  const { data, showToast } = useStudySync();
  const navigate = useNavigate();

  const [tab, setTab] = useState('account');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyTargetHours, setDailyTargetHours] = useState(user?.dailyTargetHours || 4);
  const [theme, setThemeState] = useState(user?.theme || accent || 'violet');
  const [avatarBadge, setAvatarBadge] = useState(user?.avatarBadge || '🎓');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [cropperSrc, setCropperSrc] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setDailyTargetHours(user.dailyTargetHours || 4);
      setThemeState(user.theme || accent || 'violet');
      setAvatarBadge(user.avatarBadge || '🎓');
      setProfilePictureUrl(user.profilePictureUrl || '');
    }
  }, [user, accent]);

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
      });
      showToast('Profile saved! ✨');
      onClose();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Log out of StudySync?')) {
      logout();
      onClose();
      showToast('Logged out securely 👋');
      navigate('/login');
    }
  };

  const streak = data.dashboard?.streakCount || user?.streakCount || 0;

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '8px' }}>
            <span>Profile & Settings</span>
            <button
              type="button"
              className="btn-danger-xs"
              onClick={handleLogout}
              title="Sign out of account"
            >
              🚪 Logout
            </button>
          </div>
        }
        onClose={onClose}
      >
        {/* Compact User Identity Strip */}
        <div className="profile-compact-header">
          <div className="profile-hero-avatar-wrap">
            <Avatar user={{ ...user, profilePictureUrl, avatarBadge }} />
            <input
              type="file"
              id="quick-photo-change"
              accept="image/*"
              onChange={handleModalDevicePhoto}
              style={{ display: 'none' }}
            />
            <label htmlFor="quick-photo-change" className="photo-edit-badge" title="Change photo">
              📷
            </label>
          </div>

          <div className="profile-hero-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong className="profile-hero-name">{name || 'Student'}</strong>
              <span className={`role-badge ${user?.role === 'ADMIN' ? 'admin' : 'user'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                {user?.role === 'ADMIN' ? 'ADMIN' : 'STUDENT'}
              </span>
            </div>
            <p className="profile-hero-email">{email}</p>
            <div className="profile-hero-badges">
              <span className="hero-stat-pill">🔥 {streak}d streak</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="profile-tabs compact">
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
            🎨 Appearance
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          {/* TAB 1: ACCOUNT DETAILS */}
          {tab === 'account' && (
            <div className="profile-tab-content">
              <div className="field-group compact">
                <label>Display Name</label>
                <input
                  type="text"
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Full Name"
                />
              </div>

              <div className="field-group compact">
                <label>Email Address</label>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="field-group compact">
                <label>Academic Goal / Bio</label>
                <input
                  type="text"
                  className="text-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. CS Student mastering Spring Boot"
                />
              </div>

              <div className="field-group compact">
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

          {/* TAB 2: APPEARANCE */}
          {tab === 'appearance' && (
            <div className="profile-tab-content">
              <div className="field-group compact">
                <label>Avatar Badge</label>
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

              <div className="field-group compact">
                <label>Theme Accent</label>
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

              <div className="field-group compact">
                <label>Mode</label>
                <button
                  type="button"
                  className="btn-outline full-width btn-sm"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                </button>
              </div>
            </div>
          )}


          {/* Action Row */}
          <div className="modal-footer-actions">
            <button className="btn-primary flex-1" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings ✨'}
            </button>
            <button
              type="button"
              className="btn-danger-outline"
              onClick={handleLogout}
              title="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </form>
      </Modal>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          onCrop={async (croppedData) => {
            setProfilePictureUrl(croppedData);
            setCropperSrc(null);
            try {
              await updateProfile({ profilePictureUrl: croppedData });
              showToast('Profile photo updated & synced across devices! 📸✨');
            } catch {}
          }}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </>
  );
}
