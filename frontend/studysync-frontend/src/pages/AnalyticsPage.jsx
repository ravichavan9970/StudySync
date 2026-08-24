import React from 'react';
import TopHeader from '../components/common/TopHeader';
import MetricCard from '../components/analytics/MetricCard';
import ProductivityChart from '../components/analytics/ProductivityChart';
import { useStudySync } from '../context/StudySyncContext';

const fmtMinutes = (minutes = 0) =>
  minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;

export default function AnalyticsPage() {
  const { data } = useStudySync();

  const completedTasks = data.statistics?.completedTasks || 0;
  const focusMinutes = data.statistics?.focusMinutes || 0;
  const score = data.dashboard?.productivityScore || 0;
  const streak = data.dashboard?.streakCount || (completedTasks > 0 || focusMinutes > 0 ? 1 : 0);
  const points = data.statistics?.productivity || [];

  return (
    <div className="view-container">
      <TopHeader
        title="Productivity & Momentum Insights"
        subtitle="Visualizing your study habits, consistency, and cognitive output."
      />

      <div className="page-section">
        <div className="metrics-row">
          <MetricCard
            label="COMPLETED TASKS"
            value={completedTasks}
            sub="Academic items conquered"
            icon="✅"
          />
          <MetricCard
            label="RECORDED FOCUS TIME"
            value={fmtMinutes(focusMinutes)}
            sub="Deep work intervals logged"
            icon="⏱️"
          />
          <MetricCard
            label="PRODUCTIVITY SCORE"
            value={`${score}/100`}
            sub="Weekly momentum index"
            icon="⚡"
          />
          <MetricCard
            label="CURRENT STREAK"
            value={`🔥 ${streak} Days`}
            sub="Consecutive daily study days"
            icon="🏆"
          />
        </div>

        <ProductivityChart points={points} />
      </div>
    </div>
  );
}
