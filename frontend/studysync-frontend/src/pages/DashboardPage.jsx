import React from 'react';
import TopHeader from '../components/common/TopHeader';
import DailyTargetCard from '../components/dashboard/DailyTargetCard';
import PriorityTasksCard from '../components/dashboard/PriorityTasksCard';
import SubjectBreakdownCard from '../components/dashboard/SubjectBreakdownCard';
import FocusPromoCard from '../components/dashboard/FocusPromoCard';
import { useAuth } from '../context/AuthContext';
import { useStudySync } from '../context/StudySyncContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    data,
    toggleTask,
    startTaskFocus,
    setSubjectModal,
    deleteSubject,
  } = useStudySync();

  const completed = Number(data.dashboard?.completedToday || 0);
  const dueToday = Number(data.dashboard?.dueToday || 0);
  const total = completed + dueToday;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const upcomingTasks = data.tasks.filter((task) => task.status !== 'COMPLETED').slice(0, 4);

  return (
    <div className="view-container">
      <TopHeader
        title={`Welcome back, ${user?.name || 'Student'} ✨`}
        subtitle="Here is your daily study momentum and priority overview."
      />

      <div className="dashboard-grid">
        <DailyTargetCard
          completed={completed}
          total={total}
          progress={progress}
        />

        <section className="two-column-layout">
          <PriorityTasksCard
            tasks={upcomingTasks}
            onToggle={toggleTask}
            onStartFocus={startTaskFocus}
          />
          <FocusPromoCard />
        </section>

        <SubjectBreakdownCard
          subjects={data.subjects}
          tasks={data.tasks}
          onAddSubject={() => setSubjectModal({})}
          onEditSubject={(sub) => setSubjectModal(sub)}
          onDeleteSubject={deleteSubject}
        />
      </div>
    </div>
  );
}
