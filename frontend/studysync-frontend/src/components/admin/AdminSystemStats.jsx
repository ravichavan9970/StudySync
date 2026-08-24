import React from 'react';

export default function AdminSystemStats({ stats = {}, userCount = 0 }) {
  const displayUsers = userCount || stats.totalUsers || 0;

  return (
    <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <div className="admin-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="admin-stat-label">TOTAL USERS</span>
          <span style={{ fontSize: '18px' }}>👥</span>
        </div>
        <strong className="admin-stat-value">{displayUsers}</strong>
        <small className="admin-stat-sub" style={{ color: 'var(--accent)' }}>Registered accounts</small>
      </div>

      <div className="admin-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="admin-stat-label">TOTAL TASKS</span>
          <span style={{ fontSize: '18px' }}>📝</span>
        </div>
        <strong className="admin-stat-value">{stats.totalTasks ?? 0}</strong>
        <small className="admin-stat-sub">
          {stats.completedTasks ?? 0} completed
        </small>
      </div>

      <div className="admin-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="admin-stat-label">STUDY NOTES</span>
          <span style={{ fontSize: '18px' }}>📚</span>
        </div>
        <strong className="admin-stat-value">{stats.totalNotes ?? 0}</strong>
        <small className="admin-stat-sub">Knowledge base</small>
      </div>

      <div className="admin-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="admin-stat-label">SERVER STATUS</span>
          <span style={{ fontSize: '18px' }}>🟢</span>
        </div>
        <strong className="admin-stat-value" style={{ color: '#10b981', fontSize: '20px' }}>ONLINE</strong>
        <small className="admin-stat-sub">Render Cloud Engine</small>
      </div>
    </div>
  );
}
