import React from 'react';

export default function MetricCard({ label, value, sub, icon }) {
  return (
    <article className="card-box metric-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className="card-eyebrow" style={{ margin: 0 }}>{label}</span>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      </div>
      <strong className="metric-value">{value}</strong>
      <small className="metric-sub">{sub}</small>
    </article>
  );
}
