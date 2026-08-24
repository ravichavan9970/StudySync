import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudySync } from '../../context/StudySyncContext';
import Avatar from './Avatar';

function QuickCreateDropdown({ onNewTask, onCreateSubject, onCreateCategory }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="quick-create-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOpen(!open)}
        title="Quick Create Menu"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="hide-on-mobile-text">Create New</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="create-dropdown-menu">
          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onNewTask();
            }}
          >
            <span className="menu-item-icon">📝</span>
            <div className="menu-item-text">
              <strong>New Task</strong>
              <small>Add a target study item or goal</small>
            </div>
          </button>

          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onCreateSubject();
            }}
          >
            <span className="menu-item-icon">📚</span>
            <div className="menu-item-text">
              <strong>Create Subject</strong>
              <small>Add a new course or subject</small>
            </div>
          </button>

          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onCreateCategory();
            }}
          >
            <span className="menu-item-icon">🏷️</span>
            <div className="menu-item-text">
              <strong>Create Category</strong>
              <small>Add a new category or tag</small>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopHeader({ title, subtitle }) {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { data, showToast, setTaskModal, setSubjectModal, setCategoryModal, setProfileModalOpen } = useStudySync();

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  const handleNotificationsClick = () => {
    if (data.notifications && data.notifications.length > 0) {
      showToast(data.notifications.map((n) => n.message).join(' · '));
    } else {
      showToast('No pending notifications or overdue items! 🌟');
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-info">
        <span className="date-pill">{formattedDate}</span>
        <h1 className="page-title">{title || `Welcome back, ${user?.name || 'Student'} ✨`}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="top-actions">
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

        <button
          type="button"
          className="icon-btn notif-btn"
          title="Notifications"
          onClick={handleNotificationsClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {data.notifications && data.notifications.length > 0 && (
            <span className="notif-badge">{data.notifications.length}</span>
          )}
        </button>

        <QuickCreateDropdown
          onNewTask={() => setTaskModal({})}
          onCreateSubject={() => setSubjectModal({})}
          onCreateCategory={() => setCategoryModal({})}
        />

        {/* Mobile profile avatar button */}
        <button
          type="button"
          className="mobile-avatar-btn"
          onClick={() => setProfileModalOpen(true)}
          title="Profile & Settings"
        >
          <Avatar user={user} />
        </button>
      </div>
    </header>
  );
}
