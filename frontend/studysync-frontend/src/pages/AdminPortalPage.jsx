import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSystemStats from '../components/admin/AdminSystemStats';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import { useAuth } from '../context/AuthContext';
import { useStudySync } from '../context/StudySyncContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api';

export default function AdminPortalPage() {
  const { token, user, logout } = useAuth();
  const { showToast } = useStudySync();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 1,
    activeUsers: 1,
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalCategories: 0,
    totalSessions: 0,
    serverStatus: 'ONLINE',
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch system statistics
      const sysStats = await api('/admin/system/stats', { token }).catch(() => null);
      if (sysStats) {
        setStats((prev) => ({ ...prev, ...sysStats }));
      }

      // 2. Fetch users list
      const usersData = await api('/admin/users?page=0&size=100', { token }).catch(() => null);
      let combined = [];
      if (usersData && Array.isArray(usersData.content)) {
        combined = [...usersData.content];
      }
      try {
        const map = JSON.parse(localStorage.getItem('studysync_users_map') || '{}');
        const localList = Object.values(map).filter((u) => u && u.email);
        localList.forEach((lu) => {
          if (!combined.some((cu) => cu.email?.toLowerCase() === lu.email?.toLowerCase() || (cu.id && cu.id === lu.id))) {
            combined.push(lu);
          }
        });
      } catch {}
      setUsersList(combined);
    } catch (err) {
      showToast(`Admin sync notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [showToast, token, user]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete account "${targetUser.email}" from the database?`)) return;
    try {
      await api(`/admin/users/${targetUser.id}`, { method: 'DELETE', token });
      const nextList = usersList.filter((u) => u.id !== targetUser.id && u.email !== targetUser.email);
      setUsersList(nextList);
      showToast(`Account "${targetUser.email}" permanently removed.`);

      const isSelf = user && (user.id === targetUser.id || user.email?.toLowerCase() === targetUser.email?.toLowerCase());
      if (isSelf || nextList.length === 0) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      showToast(`Delete action: ${err.message}`);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!window.confirm('⚠️ DANGER: Are you sure you want to permanently delete ALL student accounts and reset the database?')) return;
    try {
      await api('/admin/users/all', { method: 'DELETE', token });
      setUsersList([]);
      showToast('All student accounts permanently purged from database.');
      logout();
      navigate('/login');
    } catch (err) {
      showToast(`Purge action: ${err.message}`);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.id && u.id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="admin-portal-standalone" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Dedicated Admin Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-logo" style={{ width: '36px', height: '36px', fontSize: '18px' }}>
            <span>S</span>
          </div>
          <div>
            <strong style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              StudySync
              <span className="badge-pill" style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                🛡️ ADMIN HUB
              </span>
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            Cloud Database Connected
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Ravi@7447</span>
            <span style={{ fontSize: '10px', padding: '1px 5px', background: 'var(--accent)', color: '#fff', borderRadius: '4px' }}>
              ROOT
            </span>
          </div>

          <button
            type="button"
            className="icon-btn theme-toggle"
            onClick={toggleDarkMode}
            title="Toggle theme"
            style={{ width: '36px', height: '36px' }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={fetchAdminData}
            title="Refresh system stats"
          >
            🔄 Refresh
          </button>

          <button
            type="button"
            className="btn-danger-sm"
            style={{ padding: '7px 14px', borderRadius: '6px' }}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </header>

      {/* Admin Content Viewport */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Title & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              User Management & Database
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
              Direct control center for registered accounts, activity statistics, and database reset.
            </p>
          </div>

          <div style={{ width: '280px' }}>
            <input
              type="text"
              className="text-input"
              style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', fontSize: '13px' }}
              placeholder="🔍 Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Clean Metric Stats Cards */}
        <AdminSystemStats stats={stats} userCount={usersList.length} />

        {/* Clean Users Management Table */}
        <AdminUsersTable
          users={filteredUsers}
          onDeleteUser={handleDeleteUser}
          onDeleteAllUsers={handleDeleteAllUsers}
        />
      </main>
    </div>
  );
}
