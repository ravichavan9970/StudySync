import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from './Avatar';

export default function Navbar({ onOpenAdminModal }) {
  const { token, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="public-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo"><span>S</span></div>
          <span className="brand-title">StudySync</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          {token ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Tasks
              </NavLink>
              <NavLink to="/notes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Notes
              </NavLink>
              <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Planner
              </NavLink>
              <NavLink to="/focus" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Focus Room
              </NavLink>
              <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Analytics
              </NavLink>
            </>
          ) : (
            <>
              <a href="/#features" className="nav-link">Features</a>
              <a href="/#methods" className="nav-link">Methodology</a>
              <a href="/#reviews" className="nav-link">Reviews</a>
            </>
          )}
          <NavLink to="/admin" className={({ isActive }) => `nav-link admin-nav-link ${isActive ? 'active' : ''}`}>
            🛡️ Admin
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            type="button"
            className="icon-btn theme-toggle"
            title="Toggle theme"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {token ? (
            <div className="user-nav-dropdown">
              <button
                className="user-nav-avatar-btn"
                onClick={() => navigate('/dashboard')}
                title="Go to workspace"
              >
                <Avatar user={user} />
                <span className="user-nav-name">{user?.name || 'Workspace'}</span>
              </button>
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <Link to="/login" className="btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {token ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/tasks" onClick={() => setMobileMenuOpen(false)}>Tasks</Link>
              <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>Notes</Link>
              <Link to="/planner" onClick={() => setMobileMenuOpen(false)}>Planner</Link>
              <Link to="/focus" onClick={() => setMobileMenuOpen(false)}>Focus Room</Link>
              <Link to="/analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Portal</Link>
              <button
                className="btn-link text-danger"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <a href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="/#methods" onClick={() => setMobileMenuOpen(false)}>Methodology</a>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Portal</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
