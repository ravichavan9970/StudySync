import React from 'react';

export default function FocusIntentionCard({ tasks = [], taskId, setTaskId }) {
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <article className="card-box intention-card">
      <span className="card-eyebrow">SESSION GOAL</span>
      <h3>What are you focusing on?</h3>

      <div className="field-group">
        <label>Link to Target Task</label>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="select-input"
        >
          <option value="">General Focus / Self-Study Session</option>
          {pendingTasks.map((task) => (
            <option value={task.id} key={task.id}>
              {task.title} ({task.durationMinutes || 25}m)
            </option>
          ))}
        </select>
      </div>

      <div className="tip-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <span>
          Linking your session automatically marks the task as completed when the countdown completes and adds momentum points!
        </span>
      </div>

      <div className="focus-tips-list" style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '10px' }}>
          🧠 Flow State Guidelines
        </h4>
        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.7', margin: 0 }}>
          <li>Put phone on Do Not Disturb or out of sight.</li>
          <li>Keep one primary notebook / browser tab open.</li>
          <li>Take a deep breath and commit for the full interval.</li>
        </ul>
      </div>
    </article>
  );
}
