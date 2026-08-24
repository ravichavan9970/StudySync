import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/common/TopHeader';
import AdminSystemStats from '../components/admin/AdminSystemStats';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import AdminDisasterRecovery from '../components/admin/AdminDisasterRecovery';
import { useAuth } from '../context/AuthContext';
import { useStudySync } from '../context/StudySyncContext';
import { api } from '../api';

export default function AdminPortalPage() {
  const { token, user } = useAuth();
  const { showToast } = useStudySync();

  const [stats, setStats] = useState({
    totalUsers: 1,
    activeUsers: 1,
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalCategories: 0,
    totalSessions: 0,
    usedMemoryMb: 85,
    totalMemoryMb: 512,
    serverStatus: 'ONLINE (RENDER READY)',
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
      if (usersData && usersData.content) {
        setUsersList(usersData.content);
      } else {
        // Fallback user roster for offline / local display
        const localUser = user || {
          id: 'usr-admin-1',
          name: 'Administrator',
          email: 'admin@studysync.io',
          role: 'ADMIN',
          streakCount: 5,
          createdAt: new Date().toISOString(),
        };
        setUsersList([localUser]);
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
    if (!window.confirm(`Are you sure you want to delete user account "${targetUser.email}"?`)) return;
    try {
      await api(`/admin/users/${targetUser.id}`, { method: 'DELETE', token });
      setUsersList((prev) => prev.filter((u) => u.id !== targetUser.id));
      showToast(`Account "${targetUser.email}" removed.`);
    } catch (err) {
      showToast(`Delete action: ${err.message}`);
    }
  };

  return (
    <div className="view-container">
      <TopHeader
        title="🛡️ Enterprise Admin Command Hub"
        subtitle="Operations auditor, user roster, cloud health metrics, and disaster recovery."
      />

      <div className="page-section">
        {/* Top Operations Banner */}
        <div className="admin-hero-banner">
          <div>
            <span className="badge-pill light">ENTERPRISE AUDIT & CONTROLS</span>
            <h2>StudySync System Operations & Cloud Resilience</h2>
            <p>
              Java 21 Spring Boot 3 Engine · Render Cloud Web Service · Dual-Cloud Disaster Recovery
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchAdminData}
            >
              🔄 Refresh System
            </button>
            <Link to="/dashboard" className="btn-outline" style={{ background: 'rgba(255,255,255,0.1)' }}>
              ← Return to Workspace
            </Link>
          </div>
        </div>

        {/* System Stats Grid */}
        <AdminSystemStats stats={stats} />

        {/* Disaster Recovery Engine */}
        <AdminDisasterRecovery />

        {/* Users Audit Table */}
        <AdminUsersTable
          users={usersList}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  );
}
