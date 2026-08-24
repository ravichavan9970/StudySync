import React, { useMemo } from 'react';
import TopHeader from '../components/common/TopHeader';
import PlannerDayCard from '../components/planner/PlannerDayCard';
import { useStudySync } from '../context/StudySyncContext';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function PlannerPage() {
  const {
    data,
    setTaskModal,
    toggleTask,
    deleteTask,
    startTaskFocus,
  } = useStudySync();

  const days = useMemo(() => {
    const first = new Date();
    const offset = (first.getDay() + 6) % 7; // Start Monday
    first.setDate(first.getDate() - offset);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(first);
      d.setDate(first.getDate() + idx);
      return d;
    });
  }, []);

  const today = todayStr();

  return (
    <div className="view-container">
      <TopHeader
        title="Weekly Study Planner"
        subtitle="Map out your study schedule day-by-day and execute with clarity."
      />

      <div className="page-section">
        <div className="section-header-bar">
          <div>
            <span className="card-eyebrow">SCHEDULE</span>
            <h2 className="section-header-title">7-Day Study Calendar</h2>
          </div>
          <span className="header-meta-text">Monday - Sunday Week View</span>
        </div>

        <div className="planner-grid">
          {days.map((date) => {
            const dateKey = date.toISOString().slice(0, 10);
            const isToday = dateKey === today;
            const dayTasks = data.tasks.filter((t) => t.dueDate === dateKey);

            return (
              <PlannerDayCard
                key={dateKey}
                date={date}
                isToday={isToday}
                tasks={dayTasks}
                onAddForDate={(d) => setTaskModal({ dueDate: d })}
                onToggle={toggleTask}
                onEdit={(t) => setTaskModal(t)}
                onDelete={(id, title) => deleteTask(id, title)}
                onStartFocus={startTaskFocus}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
