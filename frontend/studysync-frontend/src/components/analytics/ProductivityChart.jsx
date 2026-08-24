import React from 'react';
import { Empty } from '../common/UIElements';

export default function ProductivityChart({ points = [] }) {
  const highest = Math.max(1, ...points.map((pt) => Math.max(pt.focusMinutes || 0, (pt.completedTasks || 0) * 10)));

  return (
    <article className="card-box chart-card">
      <div className="section-header-bar">
        <div>
          <span className="card-eyebrow">DAILY TREND</span>
          <h2 className="section-header-title">Weekly Activity & Momentum</h2>
        </div>
        <span className="header-meta-text">Focus Minutes (Violet) vs Tasks Completed (Green)</span>
      </div>

      <div className="bar-chart-area">
        {points.length > 0 ? (
          points.map((pt) => {
            const dayLabel = new Date(`${pt.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <div className="chart-column" key={pt.date}>
                <div className="bars-container">
                  <div
                    className="bar focus-bar"
                    title={`${pt.focusMinutes} focus mins`}
                    style={{ height: pt.focusMinutes > 0 ? `${Math.max(10, (pt.focusMinutes / highest) * 100)}%` : '0%' }}
                  />
                  <div
                    className="bar task-bar"
                    title={`${pt.completedTasks} tasks done`}
                    style={{ height: pt.completedTasks > 0 ? `${Math.max(10, ((pt.completedTasks * 10) / highest) * 100)}%` : '0%' }}
                  />
                </div>
                <span className="column-label">{dayLabel}</span>
              </div>
            );
          })
        ) : (
          <Empty text="No productivity data logged yet for this week." />
        )}
      </div>

      <div className="chart-legend">
        <span className="legend-item focus">Focus Minutes</span>
        <span className="legend-item task">Completed Tasks</span>
      </div>
    </article>
  );
}
