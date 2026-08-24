import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudySync } from '../context/StudySyncContext';
import ImageCropperModal from '../components/common/ImageCropperModal';

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [cropRawImg, setCropRawImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { showToast } = useStudySync();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || '/dashboard';
  const isRegister = mode === 'register';

  const handleDevicePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropRawImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, profilePictureUrl);
        showToast('🎉 Account created successfully! Welcome to StudySync.');
      } else {
        await login(email.trim(), password);
        showToast('✨ Welcome back! Workspace loaded.');
      }
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Brand Hero Side */}
      <section className="auth-side">
        <Link to="/" className="auth-side-brand" style={{ textDecoration: 'none' }}>
          <div className="brand-logo"><span>S</span></div>
          <h2>StudySync</h2>
        </Link>

        <span className="badge-pill">STUDENT PRODUCTIVITY PLATFORM</span>
        <h1 className="auth-hero-title">
          Plan with clarity.<br />Study with focus.
        </h1>
        <p className="auth-hero-subtitle">
          Your all-in-one workspace for organized tasks, rich notes, deep focus sessions, and productivity analytics.
        </p>

        <div className="auth-feature-list">
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Smart Task & Weekly Planner</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Pomodoro Focus Timer & History</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Real-time Momentum Analytics</span>
          </div>
        </div>
      </section>

      {/* Auth Card Form Wrap */}
      <section className="auth-form-wrap">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-logo-header">
            <div className="brand-logo large"><span>S</span></div>
            <div>
              <strong>StudySync</strong>
              <small>Study Command Center</small>
            </div>
          </div>

          <span className="auth-mode-eyebrow">
            {isRegister ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}
          </span>
          <h2 className="auth-heading">
            {isRegister ? 'Start your journey' : 'Sign in to continue'}
          </h2>

          {isRegister && (
            <div className="auth-name-avatar-row">
              <div className="avatar-upload-compact">
                <input
                  type="file"
                  id="auth-profile-pic"
                  accept="image/*"
                  onChange={handleDevicePicChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="auth-profile-pic"
                  className="avatar-upload-circle"
                  title="Upload & Crop Profile Picture"
                >
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Avatar" />
                  ) : (
                    <span className="avatar-placeholder-icon">📷</span>
                  )}
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="text-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            </div>
          )}

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
            <label>Password *</label>
            <input
              type="password"
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>

          {error && <div className="form-error-alert">{error}</div>}

          <button className="btn-primary full-width" type="submit" disabled={busy}>
            {busy ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            className="btn-link full-width"
            onClick={() => {
              setMode(isRegister ? 'login' : 'register');
              setError('');
            }}
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : 'New to StudySync? Create account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link to="/" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Return to Home
            </Link>
          </div>
        </form>
      </section>

      {cropRawImg && (
        <ImageCropperModal
          imageSrc={cropRawImg}
          onCrop={(croppedData) => {
            setProfilePictureUrl(croppedData);
            setCropRawImg(null);
          }}
          onCancel={() => setCropRawImg(null)}
        />
      )}
    </div>
  );
}
