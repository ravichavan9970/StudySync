import React, { useState, useMemo } from 'react';
import TopHeader from '../components/common/TopHeader';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskRow from '../components/tasks/TaskRow';
import { Empty } from '../components/common/UIElements';
import { useStudySync } from '../context/StudySyncContext';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TasksPage() {
  const {
    data,
    setTaskModal,
    toggleTask,
    deleteTask,
    startTaskFocus,
  } = useStudySync();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((task) => {
      const matchSearch = `${task.title} ${task.description || ''} ${task.categoryName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchSearch) return false;

      const today = todayStr();
      if (filter === 'TODAY') {
        return task.dueDate && task.dueDate <= today && task.status !== 'COMPLETED';
      }
      if (filter === 'UPCOMING') {
        return task.dueDate > today && task.status !== 'COMPLETED';
      }
      if (filter === 'COMPLETED') {
        return task.status === 'COMPLETED';
      }
      return true;
    });
  }, [data.tasks, filter, search]);

  return (
    <div className="view-container">
      <TopHeader
        title="Task Management Workspace"
        subtitle="Keep your momentum going. Organize, prioritize, and conquer."
      />

      <div className="page-section">
        <div className="section-header-bar">
          <div>
            <span className="card-eyebrow">WORKSPACE</span>
            <h2 className="section-header-title">My Study Tasks</h2>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setTaskModal({})}
          >
            + Add Task
          </button>
        </div>

        <TaskToolbar
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />

        <article className="card-box task-list-card">
          {filteredTasks.length > 0 ? (
            <div className="task-stack">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task)}
                  onEdit={(t) => setTaskModal(t)}
                  onDelete={(id, title) => deleteTask(id, title)}
                  onStartFocus={startTaskFocus}
                />
              ))}
            </div>
          ) : (
            <Empty text="No tasks found matching your selected filter or search query." />
          )}
        </article>
      </div>
    </div>
  );
}
