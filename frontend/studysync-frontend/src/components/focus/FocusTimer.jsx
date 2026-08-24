import React from 'react';

const modePresets = [
  [25, 'Pomodoro (25m)'],
  [50, 'Deep Work (50m)'],
  [5, 'Short Break (5m)']
];

export default function FocusTimer({ seconds, minutes, running, onMode, onStart, onReset }) {
  const totalSecs = minutes * 60;
  const progressPct = totalSecs > 0 ? ((totalSecs - seconds) / totalSecs) * 100 : 0;
  const strokeDash = 565; // 2 * pi * 90
  const strokeOffset = strokeDash - (strokeDash * (100 - progressPct)) / 100;

  const displayMinutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const displaySeconds = String(seconds % 60).padStart(2, '0');

  return (
    <article className="card-box focus-main-card">
      <span className="card-eyebrow">POMODORO & DEEP WORK</span>
      <h2>Study Focus Room</h2>
      <p className="focus-subtitle">Minimize context switching and enter a deep study flow state.</p>

      <div className="timer-ring-wrapper">
        <svg width="220" height="220" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--line)" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="10"
            strokeDasharray={strokeDash}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="timer-text-display">
          {displayMinutes}:{displaySeconds}
        </div>
      </div>

      <div className="focus-mode-tabs">
        {modePresets.map(([num, label]) => (
          <button
            key={num}
            type="button"
            className={`mode-pill ${minutes === num ? 'active' : ''}`}
            onClick={() => onMode(num)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="focus-controls">
        <button
          type="button"
          className={`btn-primary large ${running ? 'running' : ''}`}
          onClick={onStart}
        >
          {running ? '⏸️ Pause Session' : '▶️ Start Session'}
        </button>
        <button
          type="button"
          className="btn-outline large"
          onClick={onReset}
        >
          🔄 Reset
        </button>
      </div>
    </article>
  );
}
