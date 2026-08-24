import React from 'react';
import Avatar from '../common/Avatar';

function formatUserId(id) {
  if (!id || id.includes('demo')) {
    return 'Active Member';
  }
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  return `ID: #${clean}`;
}

export default function AdminUsersTable({ users = [], onDeleteUser }) {
  return (
    <article className="card-box" style={{ marginTop: '24px' }}>
      <div className="section-header-bar">
        <div>
          <span className="card-eyebrow">USER ROSTER & AUDIT</span>
          <h2 className="section-header-title">Registered Student & Admin Accounts</h2>
        </div>
        <span className="header-meta-text">{users.length} accounts indexed</span>
      </div>

      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Streak</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => {
                const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active';
                const isAdmin = u.role === 'ADMIN';

                return (
                  <tr key={u.id || u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar user={u} />
                        <div>
                          <strong>{u.name || 'Student'}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {formatUserId(u.id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                        {isAdmin ? '🛡️ ADMIN' : '🎓 STUDENT'}
                      </span>
                    </td>
                    <td>🔥 {u.streakCount ?? 0} days</td>
                    <td>{joinDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      {!isAdmin ? (
                        <button
                          type="button"
                          className="btn-danger-sm"
                          title="Delete user account"
                          onClick={() => onDeleteUser(u)}
                        >
                          🗑️ Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                          SYSTEM PROTECTED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
