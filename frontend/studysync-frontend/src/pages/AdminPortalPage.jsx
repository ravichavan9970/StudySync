import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/common/TopHeader';
import AdminSystemStats from '../components/admin/AdminSystemStats';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import { useAuth } from '../context/AuthContext';
import { useStudySync } from '../context/StudySyncContext';
import { api } from '../api';

export default function AdminPortalPage() {
  const { token, user, logout } = useAuth();
  const { showToast } = useStudySync();
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

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch system statistics
      const sysStats = await api('/admin/system/stats', { token }).catch(() => null);
      if (sysStats) {
        setStats((prev) => ({ ...prev, ...sysStats }));
      }

      // 2. Fetch users list
      const usersData = await api('/admin/users?page=0&size=50', { token }).catch(() => null);
      if (usersData && Array.isArray(usersData.content)) {
        setUsersList(usersData.content);
      } else {
        setUsersList(user ? [user] : []);
      }
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
    if (!window.confirm(`Are you sure you want to permanently delete account "${targetUser.email}"?`)) return;
    try {
      await api(`/admin/users/${targetUser.id}`, { method: 'DELETE', token });
      const nextList = usersList.filter((u) => u.id !== targetUser.id && u.email !== targetUser.email);
      setUsersList(nextList);
      showToast(`Account "${targetUser.email}" permanently removed.`);

      const isSelf = user && (user.id === targetUser.id || user.email?.toLowerCase() === targetUser.email?.toLowerCase());
      if (isSelf || nextList.length === 0) {
        logout();
        navigate('/');
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
      navigate('/');
    } catch (err) {
      showToast(`Purge action: ${err.message}`);
    }
  };

  return (
    <div className="view-container">
      <TopHeader
        title="Admin Hub"
        subtitle="Manage registered student accounts and system overview."
      />

      <div className="page-section">
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={fetchAdminData}
            title="Refresh system stats"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Clean Metric Stats Cards */}
        <AdminSystemStats stats={stats} userCount={usersList.length} />

        {/* Clean Users Management Table */}
        <AdminUsersTable
          users={usersList}
          onDeleteUser={handleDeleteUser}
          onDeleteAllUsers={handleDeleteAllUsers}
        />
      </div>
    </div>
  );
}
