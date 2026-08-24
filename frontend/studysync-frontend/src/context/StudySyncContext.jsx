import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

const StudySyncContext = createContext();

export function StudySyncProvider({ children }) {
  const { token, user, logout } = useAuth();

  const [data, setData] = useState({
    dashboard: null,
    tasks: [],
    notes: [],
    subjects: [],
    categories: [],
    statistics: null,
    notifications: []
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [taskModal, setTaskModal] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);

  // Focus Timer state
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState('');
  const [focusSessionId, setFocusSessionId] = useState(null);

  const request = useCallback((path, options = {}) => {
    return api(path, { token, ...options });
  }, [token]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const loadAllPages = useCallback(async (path) => {
    const records = [];
    let p = 0;
    while (true) {
      const separator = path.includes('?') ? '&' : '?';
      const response = await request(`${path}${separator}page=${p}&size=100`);
      records.push(...(response.content || []));
      const totalPages = response.totalPages ?? 1;
      p += 1;
      if (p >= totalPages) break;
    }
    return records;
  }, [request]);

  const reloadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tasks, activeNotes, archivedNotes, subjects, categories, dashboard, statistics, notifications] = await Promise.allSettled([
        loadAllPages('/tasks?sort=createdAt'),
        loadAllPages('/notes?archived=false'),
        loadAllPages('/notes?archived=true'),
        request('/subjects'),
        request('/categories'),
        request('/dashboard'),
        request('/statistics?range=weekly'),
        request('/notifications'),
      ]);

      setData((current) => ({
        ...current,
        tasks: tasks.status === 'fulfilled' ? tasks.value : current.tasks,
        notes: activeNotes.status === 'fulfilled' && archivedNotes.status === 'fulfilled' ? [...activeNotes.value, ...archivedNotes.value] : current.notes,
        subjects: subjects.status === 'fulfilled' && Array.isArray(subjects.value) ? subjects.value : current.subjects,
        categories: categories.status === 'fulfilled' && Array.isArray(categories.value) ? categories.value : current.categories,
        dashboard: dashboard.status === 'fulfilled' ? dashboard.value : current.dashboard,
        statistics: statistics.status === 'fulfilled' ? statistics.value : current.statistics,
        notifications: notifications.status === 'fulfilled' ? notifications.value || [] : current.notifications,
      }));
    } catch (error) {
      if (error.status === 401 || error.status === 403) logout();
      else showToast(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadAllPages, logout, request, showToast, token]);

  useEffect(() => {
    if (token) {
      reloadData();
    } else {
      setData({
        dashboard: null,
        tasks: [],
        notes: [],
        subjects: [],
        categories: [],
        statistics: null,
        notifications: []
      });
    }
  }, [reloadData, token]);

  // Tasks actions
  const saveTask = async (form) => {
    try {
      let categoryId = form.categoryId || null;
      if (!categoryId && form.newCategory?.trim()) {
        categoryId = (await request('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: form.newCategory.trim(), color: '#6366f1' })
        })).id;
      }
      const saved = await request(form.task.id ? `/tasks/${form.task.id}` : '/tasks', {
        method: form.task.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form.task, categoryId, subjectId: form.subjectId || null })
      });
      setData((old) => ({
        ...old,
        tasks: form.task.id ? old.tasks.map((task) => (task.id === saved.id ? saved : task)) : [...old.tasks, saved]
      }));
      setTaskModal(null);
      showToast(form.task.id ? 'Task updated successfully! ✨' : 'Task created successfully! 📝');
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const toggleTask = async (task) => {
    try {
      const isNowCompleted = task.status !== 'COMPLETED';
      const saved = await request(`/tasks/${task.id}/complete?completed=${isNowCompleted}`, { method: 'PATCH' });
      setData((old) => ({
        ...old,
        tasks: old.tasks.map((item) => (item.id === saved.id ? saved : item))
      }));
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const deleteTask = async (taskId, taskTitle = 'this task') => {
    if (!window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) return;
    try {
      await request(`/tasks/${taskId}`, { method: 'DELETE' });
      setData((old) => ({ ...old, tasks: old.tasks.filter((item) => item.id !== taskId) }));
      showToast('Task deleted.');
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  // Notes actions
  const saveNote = async (form) => {
    try {
      let categoryId = form.categoryId || null;
      if (!categoryId && form.newCategory?.trim()) {
        categoryId = (await request('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: form.newCategory.trim(), color: '#10b981' })
        })).id;
      }
      const saved = await request(form.note.id ? `/notes/${form.note.id}` : '/notes', {
        method: form.note.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form.note, categoryId, subjectId: form.subjectId || null })
      });
      setData((old) => ({
        ...old,
        notes: form.note.id ? old.notes.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...old.notes]
      }));
      setNoteModal(null);
      showToast(form.note.id ? 'Note updated! ✨' : 'Note saved! 📚');
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const reviseNote = async (note, patch) => {
    try {
      const saved = await request(`/notes/${note.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: note.title,
          content: note.content || '',
          categoryId: note.categoryId || null,
          subjectId: note.subjectId || null,
          pinned: patch.pinned ?? note.pinned
        })
      });
      setData((old) => ({
        ...old,
        notes: old.notes.map((item) => (item.id === saved.id ? saved : item))
      }));
    } catch (error) {
      showToast(error.message);
    }
  };

  const archiveNote = async (note) => {
    try {
      const saved = await request(`/notes/${note.id}/archive?archived=${!note.archived}`, { method: 'PATCH' });
      setData((old) => ({
        ...old,
        notes: old.notes.map((item) => (item.id === saved.id ? saved : item))
      }));
      showToast(saved.archived ? 'Note moved to archive 📦' : 'Note restored from archive 📂');
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const deleteNote = async (note) => {
    if (!window.confirm(`Delete note "${note.title}"?`)) return;
    try {
      await request(`/notes/${note.id}`, { method: 'DELETE' });
      setData((old) => ({ ...old, notes: old.notes.filter((item) => item.id !== note.id) }));
      showToast('Note deleted.');
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  // Subjects actions
  const saveSubject = async (payload) => {
    try {
      const isEdit = Boolean(payload.id);
      const saved = await request(isEdit ? `/subjects/${payload.id}` : '/subjects', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setData((old) => ({
        ...old,
        subjects: isEdit
          ? old.subjects.map((s) => (s.id === saved.id ? saved : s))
          : [...(old.subjects || []), saved]
      }));
      setSubjectModal(null);
      showToast(isEdit ? `Subject "${saved.name}" updated! ✨` : `Subject "${saved.name}" created! 🎉`);
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const deleteSubject = async (sub) => {
    if (!window.confirm(`Delete subject "${sub.name}"?`)) return;
    try {
      await request(`/subjects/${sub.id}`, { method: 'DELETE' });
      setData((old) => ({
        ...old,
        subjects: old.subjects.filter((s) => s.id !== sub.id)
      }));
      showToast(`Subject "${sub.name}" deleted.`);
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  // Categories actions
  const saveCategory = async (payload) => {
    try {
      const isEdit = Boolean(payload.id);
      const saved = await request(isEdit ? `/categories/${payload.id}` : '/categories', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setData((old) => ({
        ...old,
        categories: isEdit
          ? old.categories.map((c) => (c.id === saved.id ? saved : c))
          : [...(old.categories || []), saved]
      }));
      setCategoryModal(null);
      showToast(isEdit ? `Category "${saved.name}" updated! ✨` : `Category "${saved.name}" created! 🎉`);
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await request(`/categories/${cat.id}`, { method: 'DELETE' });
      setData((old) => ({
        ...old,
        categories: old.categories.filter((c) => c.id !== cat.id)
      }));
      showToast(`Category "${cat.name}" deleted.`);
      reloadData();
    } catch (error) {
      showToast(error.message);
    }
  };

  // Focus Timer actions
  const startTaskFocus = useCallback(async (task) => {
    const mins = Number(task.durationMinutes) || 25;
    setFocusTaskId(task.id);
    setFocusMinutes(mins);
    setFocusSeconds(mins * 60);

    try {
      const created = await request('/study-sessions', {
        method: 'POST',
        body: JSON.stringify({
          taskId: task.id,
          subject: null,
          plannedMinutes: mins,
          completedMinutes: 0,
          completed: false
        })
      });
      if (created?.id) setFocusSessionId(created.id);
    } catch {}

    setFocusRunning(true);
    showToast(`Focus Mode started for "${task.title}" (${mins}m)! ⏱️`);
  }, [request, showToast]);

  const finishFocus = useCallback(async () => {
    setFocusRunning(false);
    const sessionDocId = focusSessionId;
    const currentTaskId = focusTaskId;
    setFocusSessionId(null);

    if (sessionDocId && focusMinutes !== 5) {
      try {
        await request(`/study-sessions/${sessionDocId}`, {
          method: 'PUT',
          body: JSON.stringify({
            taskId: currentTaskId || null,
            subject: null,
            plannedMinutes: focusMinutes,
            completedMinutes: focusMinutes,
            completed: true
          })
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (currentTaskId) {
      try {
        const saved = await request(`/tasks/${currentTaskId}/complete?completed=true`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: true, status: 'COMPLETED' })
        });

        setData((old) => ({
          ...old,
          tasks: old.tasks.map((t) => (t.id === currentTaskId ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t))
        }));

        const targetTask = data.tasks.find((t) => t.id === currentTaskId);
        const taskTitle = targetTask ? targetTask.title : (saved?.title || 'Task');
        showToast(`🎉 Focus timer finished! "${taskTitle}" marked as COMPLETED! ✅`);
        setFocusTaskId('');
      } catch (error) {
        showToast(`Timer finished! ${error.message}`);
      }
    } else {
      showToast('Focus session completed! Great effort 🎉');
    }

    reloadData();
  }, [data.tasks, focusMinutes, focusSessionId, focusTaskId, reloadData, request, showToast]);

  useEffect(() => {
    if (!focusRunning) return;
    const interval = window.setInterval(() => {
      setFocusSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          window.setTimeout(finishFocus, 0);
          return focusMinutes * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finishFocus, focusMinutes, focusRunning]);

  const startFocus = async () => {
    if (focusRunning) {
      setFocusRunning(false);
      return;
    }
    if (!focusSessionId && focusMinutes !== 5) {
      try {
        const created = await request('/study-sessions', {
          method: 'POST',
          body: JSON.stringify({
            taskId: focusTaskId || null,
            subject: null,
            plannedMinutes: focusMinutes,
            completedMinutes: 0,
            completed: false
          })
        });
        setFocusSessionId(created.id);
      } catch (error) {
        showToast(error.message);
        return;
      }
    }
    setFocusRunning(true);
  };

  const changeTimerMode = (nextMinutes) => {
    setFocusRunning(false);
    setFocusMinutes(nextMinutes);
    setFocusSeconds(nextMinutes * 60);
    setFocusSessionId(null);
  };

  const resetTimer = () => {
    setFocusRunning(false);
    setFocusSeconds(focusMinutes * 60);
    setFocusSessionId(null);
  };

  return (
    <StudySyncContext.Provider
      value={{
        data,
        loading,
        toastMessage,
        showToast,
        reloadData,
        // Modals
        taskModal,
        setTaskModal,
        noteModal,
        setNoteModal,
        subjectModal,
        setSubjectModal,
        categoryModal,
        setCategoryModal,
        profileModalOpen,
        setProfileModalOpen,
        adminLoginModalOpen,
        setAdminLoginModalOpen,
        // Task operations
        saveTask,
        toggleTask,
        deleteTask,
        // Note operations
        saveNote,
        reviseNote,
        archiveNote,
        deleteNote,
        // Subject & Category operations
        saveSubject,
        deleteSubject,
        saveCategory,
        deleteCategory,
        // Focus operations
        focusMinutes,
        focusSeconds,
        focusRunning,
        focusTaskId,
        setFocusTaskId,
        startTaskFocus,
        startFocus,
        changeTimerMode,
        resetTimer,
      }}
    >
      {children}
    </StudySyncContext.Provider>
  );
}

export function useStudySync() {
  const context = useContext(StudySyncContext);
  if (!context) {
    throw new Error('useStudySync must be used within a StudySyncProvider');
  }
  return context;
}
