import React from 'react';
import TopHeader from '../components/common/TopHeader';
import FocusTimer from '../components/focus/FocusTimer';
import FocusIntentionCard from '../components/focus/FocusIntentionCard';
import { useStudySync } from '../context/StudySyncContext';

export default function FocusPage() {
  const {
    data,
    focusMinutes,
    focusSeconds,
    focusRunning,
    focusTaskId,
    setFocusTaskId,
    startFocus,
    changeTimerMode,
    resetTimer,
  } = useStudySync();

  return (
    <div className="view-container">
      <TopHeader
        title="Deep Focus & Pomodoro Zone"
        subtitle="Block out noise, conquer resistance, and achieve peak cognitive flow."
      />

      <div className="focus-room-layout">
        <FocusTimer
          seconds={focusSeconds}
          minutes={focusMinutes}
          running={focusRunning}
          onMode={changeTimerMode}
          onStart={startFocus}
          onReset={resetTimer}
        />

        <FocusIntentionCard
          tasks={data.tasks}
          taskId={focusTaskId}
          setTaskId={setFocusTaskId}
        />
      </div>
    </div>
  );
}
