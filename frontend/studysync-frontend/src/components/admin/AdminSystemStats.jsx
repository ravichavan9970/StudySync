import React from 'react';

export default function AdminSystemStats({ stats = {} }) {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <span className="admin-stat-label">TOTAL REGISTERED USERS</span>
        <strong className="admin-stat-value">{stats.totalUsers ?? 0}</strong>
        <small className="admin-stat-sub">🟢 {stats.activeUsers ?? 0} active accounts</small>
      </div>

      <div className="admin-stat-card">
        <span className="admin-stat-label">TOTAL MANAGED TASKS</span>
        <strong className="admin-stat-value">{stats.totalTasks ?? 0}</strong>
        <small className="admin-stat-sub">✅ {stats.completedTasks ?? 0} completed</small>
      </div>

      <div className="admin-stat-card">
        <span className="admin-stat-label">KNOWLEDGE BASE NOTES</span>
        <strong className="admin-stat-value">{stats.totalNotes ?? 0}</strong>
        <small className="admin-stat-sub">Across {stats.totalCategories ?? 0} categories</small>
      </div>

      <div className="admin-stat-card">
        <span className="admin-stat-label">JVM MEMORY & CLOUD STATUS</span>
        <strong className="admin-stat-value">{stats.serverStatus ?? 'ONLINE'}</strong>
        <small className="admin-stat-sub">
          {stats.usedMemoryMb ? `${stats.usedMemoryMb} MB / ${stats.totalMemoryMb} MB` : 'Render Cloud Engine'}
        </small>
      </div>
    </div>
  );
}
