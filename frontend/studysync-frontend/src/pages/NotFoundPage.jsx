import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '450px', textAlign: 'center', padding: '40px', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧭</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Page Not Found (404)</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
          The requested page route could not be located in your StudySync workspace.
        </p>
        <Link to="/" className="btn-primary">
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
