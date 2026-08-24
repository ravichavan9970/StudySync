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
        className="btn-primary create-btn-compact"
        onClick={() => setOpen(!open)}
        title="Quick Create Menu"
      >
        <span style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1 }}>+</span>
        <span className="hide-on-mobile-text">New</span>
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
              <small>Add a target study item</small>
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
              <small>Add course or syllabus</small>
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
              <small>Add tag or section</small>
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
      <div className="topbar-header-row">
        <div className="topbar-info">
          <span className="date-pill">{formattedDate}</span>
          <h1 className="page-title">{title || `Welcome back, ${user?.name || 'Student'} ✨`}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="icon-btn theme-toggle"
            title="Toggle dark mode"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="icon-btn notif-btn"
            title="Notifications"
            onClick={handleNotificationsClick}
          >
            🔔
            {data.notifications && data.notifications.length > 0 && (
              <span className="notif-badge">{data.notifications.length}</span>
            )}
          </button>

          <QuickCreateDropdown
            onNewTask={() => setTaskModal({})}
            onCreateSubject={() => setSubjectModal({})}
            onCreateCategory={() => setCategoryModal({})}
          />

          <button
            type="button"
            className="mobile-avatar-btn"
            onClick={() => setProfileModalOpen(true)}
            title="Profile & Settings"
          >
            <Avatar user={user} />
          </button>
        </div>
      </div>
    </header>
  );
}
