import React from 'react';

export function Loading({ message = 'Loading your StudySync workspace...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export function Empty({ text = 'No items found.', icon = '📂' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast-notification">{message}</div>;
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
