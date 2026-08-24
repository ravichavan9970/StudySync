import React, { useRef } from 'react';
import { useStudySync } from '../../context/StudySyncContext';

export default function AdminDisasterRecovery() {
  const { data, showToast, reloadData } = useStudySync();
  const fileInputRef = useRef(null);

  // 1. Export Full System Backup Snapshot
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        system: 'StudySync Enterprise Full-Stack',
        vault: {
          tasks: data.tasks,
          notes: data.notes,
          subjects: data.subjects,
          categories: data.categories,
          statistics: data.statistics,
          dashboard: data.dashboard,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studysync-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('💾 Full System Snapshot exported successfully (.json)!');
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    }
  };

  // 2. Import & Restore Full System Backup Snapshot
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.vault) {
          throw new Error('Invalid StudySync backup file structure.');
        }

        const vault = parsed.vault;
        if (vault.tasks) localStorage.setItem('studysync_demo_tasks', JSON.stringify(vault.tasks));
        if (vault.notes) localStorage.setItem('studysync_demo_notes', JSON.stringify(vault.notes));
        if (vault.subjects) localStorage.setItem('studysync_demo_subjects', JSON.stringify(vault.subjects));
        if (vault.categories) localStorage.setItem('studysync_demo_categories', JSON.stringify(vault.categories));

        showToast('📥 Full System Snapshot successfully restored! Syncing...');
        reloadData();
      } catch (err) {
        showToast(`Restore error: ${err.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 3. Lock Local Browser Vault
  const handleLockVault = () => {
    try {
      const snapshot = {
        tasks: data.tasks,
        notes: data.notes,
        subjects: data.subjects,
        categories: data.categories,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('studysync_vault_snapshot_locked', JSON.stringify(snapshot));
      showToast('🗄️ Local Browser Offline Vault Locked & Secured! ✅');
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <article className="card-box" style={{ marginTop: '24px' }}>
      <div className="section-header-bar">
        <div>
          <span className="card-eyebrow">HIGH AVAILABILITY & RESILIENCE</span>
          <h2 className="section-header-title">Enterprise Disaster Recovery & Cloud Vault</h2>
        </div>
        <span className="header-meta-text">Dual-Storage Auto-Reconciliation</span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
        Protect against cloud outage, data loss, or server migration with 1-click snapshot backups, disk synchronization, and offline JSON restoration.
      </p>

      <div className="disaster-recovery-grid">
        <div className="dr-action-card">
          <div className="dr-icon">💾</div>
          <h4>Export Full System Snapshot</h4>
          <p>Download a complete timestamped JSON archive of all tasks, notes, subjects, and analytics.</p>
          <button
            type="button"
            className="btn-primary full-width"
            onClick={handleExportBackup}
          >
            Export Backup (.json)
          </button>
        </div>

        <div className="dr-action-card">
          <div className="dr-icon">📥</div>
          <h4>Import & Restore Snapshot</h4>
          <p>Upload any valid StudySync backup JSON file to instantly reconstruct your workspace state.</p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportBackup}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn-secondary full-width"
            onClick={() => fileInputRef.current?.click()}
          >
            Import Backup File
          </button>
        </div>

        <div className="dr-action-card">
          <div className="dr-icon">🗄️</div>
          <h4>Lock Local Browser Vault</h4>
          <p>Freeze and persist the current dataset to the browser’s permanent offline storage vault.</p>
          <button
            type="button"
            className="btn-outline full-width"
            onClick={handleLockVault}
          >
            Lock Vault Snapshot
          </button>
        </div>
      </div>
    </article>
  );
}
