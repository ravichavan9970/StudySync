import React from 'react';

export default function DailyTargetCard({ completed = 0, total = 0, progress = 0 }) {
  const dashStrokeDash = 283;
  const dashStrokeOffset = dashStrokeDash - (dashStrokeDash * progress) / 100;

  return (
    <section className="hero-banner daily-target-hero">
      <div className="hero-content">
        <div className="hero-top-badge-row">
          <span className="badge-pill light">DAILY TARGET</span>
        </div>
        <h2 className="hero-title-text">
          <b>{completed}</b> of <b>{total || 1}</b> tasks completed today
        </h2>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="hero-subtext">
          {progress === 100
            ? '🎉 All done! Outstanding discipline today!'
            : progress > 50
            ? 'Great momentum, more than halfway there!'
            : 'Start small, build your daily study streak.'}
        </p>
      </div>

      <div className="ring-graphic">
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
            strokeDasharray={dashStrokeDash}
            strokeDashoffset={dashStrokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="ring-text">
          <strong>{progress}%</strong>
          <small>done</small>
        </div>
      </div>
    </section>
  );
}
