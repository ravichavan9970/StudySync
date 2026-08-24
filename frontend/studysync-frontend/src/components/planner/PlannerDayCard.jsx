import React from 'react';

export default function PlannerDayCard({ date, isToday, tasks = [], onAddForDate, onToggle, onEdit, onDelete, onStartFocus }) {
  const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
  const dayNum = date.getDate();
  const dateKey = date.toISOString().slice(0, 10);

  return (
    <div className={`planner-day-card ${isToday ? 'current-day' : ''}`}>
      <div className="day-header">
        <div className="day-header-info">
          <span className="day-name">{dayName}</span>
          <span className="day-num">{dayNum}</span>
        </div>
        <button
          type="button"
          className="add-day-task-btn"
          title={`Add task for ${date.toLocaleDateString(undefined, { weekday: 'long' })}`}
          onClick={() => onAddForDate(dateKey)}
        >
          +
        </button>
      </div>

      <div className="day-tasks-stack">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`planner-task-card ${isCompleted ? 'completed' : ''}`}
              >
                <button
                  type="button"
                  className={`planner-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(task);
                  }}
                  title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted && '✓'}
                </button>

                <span
                  className="planner-task-title"
                  onClick={() => onEdit(task)}
                  title={task.title}
                >
                  {task.title}
                </span>

                <div className="planner-item-actions">
                  {!isCompleted && onStartFocus && (
                    <button
                      type="button"
                      className="icon-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFocus(task);
                      }}
                      title={`Start Focus Mode (${task.durationMinutes || 25}m)`}
                    >
                      ▶
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-btn-sm"
                    onClick={() => onEdit(task)}
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="icon-btn-sm danger"
                    onClick={() => onDelete(task.id, task.title)}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <button
            type="button"
            className="empty-day-btn"
            onClick={() => onAddForDate(dateKey)}
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
}
