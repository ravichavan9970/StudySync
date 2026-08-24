import React, { useState } from 'react';
import { Modal } from '../common/UIElements';
import ImageCropperModal from '../common/ImageCropperModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudySync } from '../../context/StudySyncContext';

const themeOptions = [
  { id: 'violet', label: 'Violet Indigo', color: '#6366f1' },
  { id: 'teal', label: 'Emerald Teal', color: '#0d9488' },
  { id: 'rose', label: 'Sunset Rose', color: '#e11d48' },
  { id: 'amber', label: 'Amber Gold', color: '#d97706' },
  { id: 'cyan', label: 'Cyan Wave', color: '#0891b2' },
];

const avatarBadges = ['🎓', '💻', '🔬', '📚', '🎨', '🚀', '⚡', '🏆'];

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const { accent, setAccent } = useTheme();
  const { showToast } = useStudySync();

  const [tab, setTab] = useState('general');
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

  return (
    <>
      <Modal title="Profile & Account Settings" onClose={onClose}>
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'general' ? 'active' : ''}`}
            onClick={() => setTab('general')}
          >
            Personal Info
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'appearance' ? 'active' : ''}`}
            onClick={() => setTab('appearance')}
          >
            Theme & Avatar
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${tab === 'preferences' ? 'active' : ''}`}
            onClick={() => setTab('preferences')}
          >
            Study Preferences
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'general' && (
            <>
              <div className="field-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Full Name"
                />
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
              </div>

              <div className="field-group">
                <label>Bio / Study Target</label>
                <textarea
                  className="textarea-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Computer Science major aiming for 3.9 GPA & mastering Spring Boot + React!"
                />
              </div>

              <div className="field-group">
                <label>Daily Target Study Hours</label>
                <input
                  type="number"
                  className="text-input"
                  value={dailyTargetHours}
                  onChange={(e) => setDailyTargetHours(e.target.value)}
                  min="1"
                  max="16"
                />
              </div>
            </>
          )}

          {tab === 'appearance' && (
            <>
              <div className="field-group">
                <label>Profile Photo (From Device)</label>
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
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Choose image from device</span>
                      </div>
                    )}
                  </label>
                  {profilePictureUrl && (
                    <button
                      type="button"
                      className="btn-link text-danger"
                      style={{ marginTop: '8px' }}
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
                <label>Accent Theme Color</label>
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
            </>
          )}

          {tab === 'preferences' && (
            <>
              <div className="field-group">
                <label>Default Focus Duration</label>
                <select
                  className="select-input"
                  value={defaultFocusMinutes}
                  onChange={(e) => setDefaultFocusMinutes(Number(e.target.value))}
                >
                  <option value={15}>15 Minutes (Quick Sprint)</option>
                  <option value={25}>25 Minutes (Standard Pomodoro)</option>
                  <option value={50}>50 Minutes (Deep Work)</option>
                  <option value={90}>90 Minutes (Intensive Study)</option>
                </select>
              </div>

              <label className="checkbox-field" style={{ marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                />
                <span>Enable daily study notifications and overdue alerts</span>
              </label>

              <label className="checkbox-field" style={{ marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span>Play audio chime when Pomodoro focus session finishes</span>
              </label>
            </>
          )}

          <button className="btn-primary full-width modal-submit" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile & Settings ✨'}
          </button>
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
