import React from 'react';
import { Link } from 'react-router-dom';
import TaskRow from '../tasks/TaskRow';
import { Empty } from '../common/UIElements';

export default function PriorityTasksCard({ tasks = [], onToggle, onStartFocus }) {
  return (
    <article className="card-box">
      <div className="section-header-bar">
        <div>
          <span className="card-eyebrow">PRIORITIES</span>
          <h2 className="section-header-title">Today’s Tasks</h2>
        </div>
        <Link to="/tasks" className="btn-link" style={{ fontWeight: '700' }}>
          View All →
        </Link>
      </div>

      {tasks.length > 0 ? (
        <div className="task-stack">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => onToggle(task)}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      ) : (
        <Empty text="No pending tasks for today! Take a break or map out a new goal." />
      )}
    </article>
  );
}
