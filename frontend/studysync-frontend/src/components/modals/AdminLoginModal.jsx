import React, { useState } from 'react';
import { Modal } from '../common/UIElements';
import { useAuth } from '../../context/AuthContext';
import { useStudySync } from '../../context/StudySyncContext';
import { api } from '../../api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { unlockAdmin } = useAuth();
  const { showToast } = useStudySync();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the administrator master passcode.');
      return;
    }
    setBusy(true);
    setError('');

    try {
      // 1. Try local master passcode check
      const localOk = unlockAdmin(passcode.trim());
      if (localOk) {
        showToast('🛡️ Master Admin Passcode Verified! Full access unlocked.');
        if (onLoginSuccess) onLoginSuccess();
        onClose();
        return;
      }

      // 2. Try online server verification
      const res = await api('/admin/verify-passcode', {
        method: 'POST',
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res && res.valid) {
        unlockAdmin('StudySync#*&Master2026!Admin');
        showToast('🛡️ Server Admin Passcode Verified! Full access unlocked.');
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        setError('Incorrect administrator master passcode. Access denied.');
      }
    } catch {
      // Check fallback passcode
      if (passcode.trim() === 'StudySync#*&Master2026!Admin') {
        unlockAdmin('StudySync#*&Master2026!Admin');
        showToast('🛡️ Admin Passcode Verified! Full access unlocked.');
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        setError('Invalid master passcode. Please check credentials.txt.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="🛡️ Enterprise Admin Command Hub" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Enter Master Admin Passcode for system operations, user auditing, database inspection, and disaster recovery.
          </p>
        </div>

        <div className="field-group">
          <label>Master Admin Passcode</label>
          <input
            type="password"
            className="text-input"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError('');
            }}
            required
            autoFocus
            placeholder="Enter master passcode..."
          />
        </div>

        {error && <div className="form-error-alert" style={{ marginBottom: '16px' }}>{error}</div>}

        <button
          type="submit"
          className="btn-primary full-width modal-submit"
          disabled={busy}
        >
          {busy ? 'Verifying Security Token...' : 'Unlock Admin Operations Center 🚀'}
        </button>
      </form>
    </Modal>
  );
}
