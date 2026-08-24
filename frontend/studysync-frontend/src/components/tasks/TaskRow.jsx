import React from 'react';

const fmtDate = (date) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date';

export default function TaskRow({ task, onToggle, onEdit, onDelete, onStartFocus }) {
  const done = task.status === 'COMPLETED';
  const mins = Number(task.durationMinutes) || 25;

  return (
    <div className={`task-row-item ${done ? 'completed' : ''}`}>
      <button
        type="button"
        className={`check-box-btn ${done ? 'checked' : ''}`}
        onClick={onToggle}
        title={done ? 'Mark as pending' : 'Mark as completed'}
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      <div className="task-row-content">
        <strong className="task-row-title">{task.title}</strong>
        <span className="task-row-meta">
          {task.categoryName || 'General'} · {fmtDate(task.dueDate)} · ⏱️ {mins}m
        </span>
      </div>

      <span className={`priority-pill ${task.priority?.toLowerCase() || 'medium'}`}>
        {task.priority?.toLowerCase() || 'medium'}
      </span>

      {!done && onStartFocus && (
        <button
          type="button"
          className="start-task-focus-btn"
          title={`Start ${mins}-minute focus session for this task`}
          onClick={(e) => {
            e.stopPropagation();
            onStartFocus(task);
          }}
        >
          ▶ Focus
        </button>
      )}

      {onEdit && (
        <div className="task-row-actions">
          <button
            type="button"
            title="Edit task"
            className="icon-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            ✏️
          </button>
          {onDelete && (
            <button
              type="button"
              title="Delete task"
              className="icon-btn-sm danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id, task.title);
              }}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}
