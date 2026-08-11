import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, session, resolveImageUrl } from './api';

const sectionList = [
  { id: 'dashboard', label: 'Overview', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/>
    </svg>
  )},
  { id: 'tasks', label: 'My Tasks', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )},
  { id: 'notes', label: 'Study Notes', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { id: 'planner', label: 'Planner', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
  { id: 'focus', label: 'Focus Room', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { id: 'analytics', label: 'Analytics', icon: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )}
];

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (date) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date';

const fmtMinutes = (minutes = 0) =>
  minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;

const titleFor = (page, name) => ({
  dashboard: `Welcome back, ${name} ✨`,
  tasks: 'Keep your momentum going',
  notes: 'Your digital thinking space',
  planner: 'Map out your study targets',
  focus: 'Deep Focus & Pomodoro Zone',
  analytics: 'Visualizing your study trends'
})[page];

function QuickCreateDropdown({ onNewTask, onCreateSubject, onCreateCategory }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="quick-create-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOpen(!open)}
        title="Quick Create Menu"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Create New</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="create-dropdown-menu">
          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onNewTask();
            }}
          >
            <span className="menu-item-icon">📝</span>
            <div className="menu-item-text">
              <strong>New Task</strong>
              <small>Add a target study item or goal</small>
            </div>
          </button>

          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onCreateSubject();
            }}
          >
            <span className="menu-item-icon">📚</span>
            <div className="menu-item-text">
              <strong>Create Subject</strong>
              <small>Add a new course or subject</small>
            </div>
          </button>

          <button
            type="button"
            className="dropdown-menu-item"
            onClick={() => {
              setOpen(false);
              onCreateCategory();
            }}
          >
            <span className="menu-item-icon">🏷️</span>
            <div className="menu-item-text">
              <strong>Create Category</strong>
              <small>Add a new category or tag</small>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(session.get());
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({
    user: null,
    dashboard: null,
    tasks: [],
    notes: [],
    subjects: [],
    categories: [],
    statistics: null,
    notifications: []
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [notice, setNotice] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [taskModal, setTaskModal] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilter, setNoteFilter] = useState('ALL');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState('');
  const [focusSessionId, setFocusSessionId] = useState(null);

  const request = useCallback((path, options) => api(path, { token, ...options }), [token]);

  const toast = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setToken(null);
    setData({ user: null, dashboard: null, tasks: [], notes: [], categories: [], statistics: null, notifications: [] });
    setRunning(false);
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

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const user = await request('/users/me');
      const savedName = localStorage.getItem('studysync-user-name');
      if (savedName && (!user.name || user.name === 'Student')) {
        user.name = savedName;
      }
      setData((current) => ({ ...current, user }));

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
        user,
        tasks: tasks.status === 'fulfilled' ? tasks.value : current.tasks,
        notes: activeNotes.status === 'fulfilled' && archivedNotes.status === 'fulfilled' ? [...activeNotes.value, ...archivedNotes.value] : current.notes,
        subjects: subjects.status === 'fulfilled' && Array.isArray(subjects.value) ? subjects.value : current.subjects,
        categories: categories.status === 'fulfilled' && Array.isArray(categories.value) ? categories.value : current.categories,
        dashboard: dashboard.status === 'fulfilled' ? dashboard.value : current.dashboard,
        statistics: statistics.status === 'fulfilled' ? statistics.value : current.statistics,
        notifications: notifications.status === 'fulfilled' ? notifications.value || [] : current.notifications,
      }));

      if ([tasks, activeNotes, archivedNotes, categories, dashboard, statistics, notifications].some((result) => result.status === 'rejected')) {
        toast('Profile synced. Some secondary metrics could not be fetched.');
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) logout();
      else toast(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadAllPages, logout, request, toast, token]);

  const startTaskFocus = useCallback(async (task) => {
    const mins = Number(task.durationMinutes) || 25;
    setFocusTaskId(task.id);
    setMinutes(mins);
    setSeconds(mins * 60);
    setPage('focus');

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

    setRunning(true);
    toast(`Focus Mode started for "${task.title}" (${mins}m)! ⏱️`);
  }, [request, toast]);

  useEffect(() => {
    const id = window.setTimeout(reload, 0);
    return () => window.clearTimeout(id);
  }, [reload]);

  useEffect(() => {
    document.documentElement.dataset.theme = data.user?.darkMode ? 'dark' : 'light';
    document.documentElement.dataset.accent = data.user?.theme || 'violet';
  }, [data.user?.darkMode, data.user?.theme]);

  const authSuccess = (auth) => {
    session.set(auth.token);
    if (auth.name) {
      try { localStorage.setItem('studysync-user-name', auth.name); } catch {}
    }
    const displayName = auth.name || localStorage.getItem('studysync-user-name') || 'Chavan Ravindra';
    const picUrl = auth.profilePictureUrl || 'https://i.postimg.cc/wMf7YsRW/Ravindra-Chavan.png';
    setData((current) => ({
      ...current,
      user: {
        id: auth.userId,
        name: displayName,
        email: auth.email,
        role: auth.role,
        profilePictureUrl: picUrl,
        darkMode: false,
        theme: 'violet',
      },
    }));
    setLoading(true);
    setToken(auth.token);
  };

  const saveProfile = async (updates) => {
    try {
      const payload = {
        name: updates.name ?? data.user?.name ?? 'Chavan Ravindra',
        email: updates.email ?? data.user?.email ?? '',
        bio: updates.bio ?? data.user?.bio ?? '',
        dailyTargetHours: updates.dailyTargetHours ?? data.user?.dailyTargetHours ?? 4,
        profilePictureUrl: updates.profilePictureUrl ?? data.user?.profilePictureUrl ?? '',
        avatarBadge: updates.avatarBadge ?? data.user?.avatarBadge ?? '🎓',
        darkMode: updates.darkMode ?? data.user?.darkMode ?? false,
        theme: updates.theme ?? data.user?.theme ?? 'violet',
        defaultFocusMinutes: updates.defaultFocusMinutes ?? data.user?.defaultFocusMinutes ?? 25,
        enableReminders: updates.enableReminders ?? data.user?.enableReminders ?? true,
        soundEnabled: updates.soundEnabled ?? data.user?.soundEnabled ?? true,
      };

      const res = await request('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (updates.name) {
        try { localStorage.setItem('studysync-user-name', updates.name); } catch {}
      }

      setData((old) => ({ ...old, user: { ...old.user, ...payload, ...res } }));
      setProfileOpen(false);
      toast('Profile & preferences saved successfully! ✨');
    } catch (error) {
      toast(error.message);
    }
  };

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
      toast(isEdit ? `Subject "${saved.name}" updated! ✨` : `Subject "${saved.name}" created! 🎉`);
      reload();
    } catch (error) {
      toast(error.message);
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
      toast(`Subject "${sub.name}" deleted.`);
      reload();
    } catch (error) {
      toast(error.message);
    }
  };

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
      toast(isEdit ? `Category "${saved.name}" updated! ✨` : `Category "${saved.name}" created! 🎉`);
      reload();
    } catch (error) {
      toast(error.message);
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
      toast(`Category "${cat.name}" deleted.`);
      reload();
    } catch (error) {
      toast(error.message);
    }
  };

  const saveTask = async (form) => {
    try {
      let categoryId = form.categoryId || null;
      if (!categoryId && form.newCategory.trim()) {
        categoryId = (await request('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: form.newCategory.trim(), color: '#6366f1' })
        })).id;
      }
      const saved = await request(form.task.id ? `/tasks/${form.task.id}` : '/tasks', {
        method: form.task.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form.task, categoryId })
      });
      setData((old) => ({
        ...old,
        tasks: form.task.id ? old.tasks.map((task) => (task.id === saved.id ? saved : task)) : [...old.tasks, saved]
      }));
      setTaskModal(null);
      toast(form.task.id ? 'Task updated.' : 'Task created.');
      reload();
    } catch (error) {
      toast(error.message);
    }
  };

  const toggleTask = async (task) => {
    try {
      const saved = await request(`/tasks/${task.id}/complete?completed=${task.status !== 'COMPLETED'}`, { method: 'PATCH' });
      setData((old) => ({
        ...old,
        tasks: old.tasks.map((item) => (item.id === saved.id ? saved : item))
      }));
      reload();
    } catch (error) {
      toast(error.message);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await request(`/tasks/${task.id}`, { method: 'DELETE' });
      setData((old) => ({ ...old, tasks: old.tasks.filter((item) => item.id !== task.id) }));
      toast('Task deleted.');
      reload();
    } catch (error) {
      toast(error.message);
    }
  };

  const saveNote = async (form) => {
    try {
      let categoryId = form.categoryId || null;
      if (!categoryId && form.newCategory.trim()) {
        categoryId = (await request('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: form.newCategory.trim(), color: '#10b981' })
        })).id;
      }
      const saved = await request(form.note.id ? `/notes/${form.note.id}` : '/notes', {
        method: form.note.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form.note, categoryId })
      });
      setData((old) => ({
        ...old,
        notes: form.note.id ? old.notes.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...old.notes]
      }));
      setNoteModal(null);
      toast(form.note.id ? 'Note updated.' : 'Note saved.');
    } catch (error) {
      toast(error.message);
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
          pinned: patch.pinned ?? note.pinned
        })
      });
      setData((old) => ({
        ...old,
        notes: old.notes.map((item) => (item.id === saved.id ? saved : item))
      }));
    } catch (error) {
      toast(error.message);
    }
  };

  const archiveNote = async (note) => {
    try {
      const saved = await request(`/notes/${note.id}/archive?archived=${!note.archived}`, { method: 'PATCH' });
      setData((old) => ({
        ...old,
        notes: old.notes.map((item) => (item.id === saved.id ? saved : item))
      }));
      toast(saved.archived ? 'Note archived.' : 'Note restored.');
    } catch (error) {
      toast(error.message);
    }
  };

  const deleteNote = async (note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    try {
      await request(`/notes/${note.id}`, { method: 'DELETE' });
      setData((old) => ({ ...old, notes: old.notes.filter((item) => item.id !== note.id) }));
      toast('Note deleted.');
    } catch (error) {
      toast(error.message);
    }
  };

  const finishFocus = useCallback(async () => {
    setRunning(false);
    const sessionDocId = focusSessionId;
    const currentTaskId = focusTaskId;
    setFocusSessionId(null);

    if (sessionDocId && minutes !== 5) {
      try {
        await request(`/study-sessions/${sessionDocId}`, {
          method: 'PUT',
          body: JSON.stringify({
            taskId: currentTaskId || null,
            subject: null,
            plannedMinutes: minutes,
            completedMinutes: minutes,
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
        toast(`🎉 Focus timer finished! "${taskTitle}" marked as COMPLETED! ✅`);
        setFocusTaskId('');
        setPage('tasks');
      } catch (error) {
        toast(`Timer finished! ${error.message}`);
      }
    } else {
      toast('Focus session completed! Great effort 🎉');
    }

    reload();
  }, [data.tasks, focusSessionId, focusTaskId, minutes, reload, request, setPage, toast]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          window.setTimeout(finishFocus, 0);
          return minutes * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finishFocus, minutes, running]);

  const startFocus = async () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (!focusSessionId && minutes !== 5) {
      try {
        const created = await request('/study-sessions', {
          method: 'POST',
          body: JSON.stringify({
            taskId: focusTaskId || null,
            subject: null,
            plannedMinutes: minutes,
            completedMinutes: 0,
            completed: false
          })
        });
        setFocusSessionId(created.id);
      } catch (error) {
        toast(error.message);
        return;
      }
    }
    setRunning(true);
  };

  const changeTimer = (next) => {
    setRunning(false);
    setMinutes(next);
    setSeconds(next * 60);
    setFocusSessionId(null);
  };

  const shownTasks = useMemo(() => data.tasks.filter((task) => {
    const search = `${task.title} ${task.description || ''} ${task.categoryName || ''}`.toLowerCase().includes(taskSearch.toLowerCase());
    if (!search) return false;
    if (taskFilter === 'TODAY') return task.dueDate && task.dueDate <= today() && task.status !== 'COMPLETED';
    if (taskFilter === 'UPCOMING') return task.dueDate > today() && task.status !== 'COMPLETED';
    return taskFilter !== 'COMPLETED' || task.status === 'COMPLETED';
  }), [data.tasks, taskFilter, taskSearch]);

  const shownNotes = useMemo(() => data.notes.filter((note) => {
    const matchesSearch = `${note.title} ${note.content || ''}`.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesFilter = noteFilter === 'ALL' || (noteFilter === 'ACTIVE' && !note.archived) || (noteFilter === 'ARCHIVED' && note.archived);
    return matchesSearch && matchesFilter;
  }), [data.notes, noteFilter, noteSearch]);

  if (!token) return <AuthScreen mode={authMode} setMode={setAuthMode} onSuccess={authSuccess} />;

  const name = data.user?.name || 'Student';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('dashboard')}>
          <div className="brand-logo">
            <span>S</span>
          </div>
          <span className="brand-title">StudySync</span>
        </button>

        <nav>
          {sectionList.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => setPage(id)}
            >
              <i className="nav-icon">{icon}</i>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-end">
          <button className="user-profile-btn" onClick={() => setProfileOpen(true)}>
            <Avatar user={data.user} />
            <div className="user-info">
              <strong>{name}</strong>
              <small>Student Workspace</small>
            </div>
            <svg className="settings-dots" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
            </svg>
          </button>

          <button className="sign-out-btn" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="date-pill">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
            </span>
            <h1 className="page-title">{titleFor(page, name)}</h1>
          </div>

          <div className="top-actions">
            <button
              className="icon-btn theme-toggle"
              title="Toggle theme"
              onClick={() => saveProfile({ darkMode: !data.user?.darkMode })}
            >
              {data.user?.darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            <button
              className="icon-btn notif-btn"
              title="Notifications"
              onClick={() => toast(data.notifications.length ? data.notifications.map((item) => item.message).join(' · ') : 'No pending reminders.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {data.notifications.length > 0 && <span className="notif-badge">{data.notifications.length}</span>}
            </button>

            <QuickCreateDropdown
              onNewTask={() => setTaskModal({})}
              onCreateSubject={() => setSubjectModal({})}
              onCreateCategory={() => setCategoryModal({})}
            />
          </div>
        </header>

        {loading ? (
          <Loading />
        ) : (
          <div className="view-container">
            {page === 'dashboard' && (
              <Dashboard
                data={data}
                onPage={setPage}
                onToggle={toggleTask}
                onAddSubject={() => setSubjectModal({})}
                onEditSubject={(sub) => setSubjectModal(sub)}
                onDeleteSubject={deleteSubject}
                onStartFocus={startTaskFocus}
              />
            )}
            {page === 'tasks' && (
              <Tasks
                tasks={shownTasks}
                search={taskSearch}
                setSearch={setTaskSearch}
                filter={taskFilter}
                setFilter={setTaskFilter}
                onAdd={() => setTaskModal({})}
                onToggle={toggleTask}
                onEdit={setTaskModal}
                onDelete={deleteTask}
                onStartFocus={startTaskFocus}
              />
            )}
            {page === 'notes' && <Notes notes={shownNotes} search={noteSearch} setSearch={setNoteSearch} filter={noteFilter} setFilter={setNoteFilter} onAdd={() => setNoteModal({})} onEdit={setNoteModal} onPin={(note) => reviseNote(note, { pinned: !note.pinned })} onArchive={archiveNote} onDelete={deleteNote} />}
            {page === 'planner' && (
              <Planner
                tasks={data.tasks}
                onEdit={setTaskModal}
                onAddForDate={(dateStr) => setTaskModal({ dueDate: dateStr })}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onStartFocus={startTaskFocus}
              />
            )}
            {page === 'focus' && <Focus seconds={seconds} minutes={minutes} running={running} tasks={data.tasks} taskId={focusTaskId} setTaskId={setFocusTaskId} onMode={changeTimer} onStart={startFocus} onReset={() => { setRunning(false); setSeconds(minutes * 60); setFocusSessionId(null); }} />}
            {page === 'analytics' && <Analytics statistics={data.statistics} dashboard={data.dashboard} />}
          </div>
        )}
      </main>

      {notice && <div className="toast-notification">{notice}</div>}
      {taskModal !== null && <TaskModal task={taskModal} subjects={data.subjects} categories={data.categories} onClose={() => setTaskModal(null)} onSave={saveTask} onAddSubject={() => setSubjectModal({})} onAddCategory={() => setCategoryModal({})} />}
      {noteModal !== null && <NoteModal note={noteModal} subjects={data.subjects} categories={data.categories} onClose={() => setNoteModal(null)} onSave={saveNote} onAddSubject={() => setSubjectModal({})} onAddCategory={() => setCategoryModal({})} />}
      {subjectModal !== null && <SubjectModal subject={subjectModal} onClose={() => setSubjectModal(null)} onSave={saveSubject} />}
      {categoryModal !== null && <CategoryModal category={categoryModal} onClose={() => setCategoryModal(null)} onSave={saveCategory} />}
      {profileOpen && <ProfileModal user={data.user} onClose={() => setProfileOpen(false)} onSave={saveProfile} />}
    </div>
  );
}

function AuthScreen({ mode, setMode, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [cropRawImg, setCropRawImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const register = mode === 'register';

  const handleDevicePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropRawImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSuccess(
        await api(`/auth/${register ? 'register' : 'login'}`, {
          method: 'POST',
          body: JSON.stringify(register ? { name, email, password, profilePictureUrl } : { email, password })
        })
      );
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-side">
        <div className="auth-side-brand">
          <div className="brand-logo"><span>S</span></div>
          <h2>StudySync</h2>
        </div>
        <span className="badge-pill">STUDENT PRODUCTIVITY PLATFORM</span>
        <h1 className="auth-hero-title">
          Plan with clarity.<br />Study with focus.
        </h1>
        <p className="auth-hero-subtitle">
          Your all-in-one workspace for organized tasks, rich notes, deep focus sessions, and productivity analytics.
        </p>

        <div className="auth-feature-list">
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Smart Task & Weekly Planner</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Pomodoro Focus Timer & History</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Real-time Momentum Analytics</span>
          </div>
        </div>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-logo-header">
            <div className="brand-logo large"><span>S</span></div>
            <div>
              <strong>StudySync</strong>
              <small>Study Command Center</small>
            </div>
          </div>

          <span className="auth-mode-eyebrow">{register ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}</span>
          <h2 className="auth-heading">{register ? 'Start your journey' : 'Sign in to continue'}</h2>

          {register && (
            <div className="auth-name-avatar-row">
              <div className="avatar-upload-compact">
                <input
                  type="file"
                  id="auth-profile-pic"
                  accept="image/*"
                  onChange={handleDevicePicChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="auth-profile-pic" className="avatar-upload-circle" title="Upload & Crop Profile Picture">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Avatar" />
                  ) : (
                    <span className="avatar-placeholder-icon">📷</span>
                  )}
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <Input label="Full Name" value={name} setValue={setName} required placeholder="e.g. Chavan Ravindra" />
              </div>
            </div>
          )}

          <Input label="Email Address" type="email" value={email} setValue={setEmail} required placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} setValue={setPassword} required minLength="8" placeholder="At least 8 characters" />

          {error && <div className="form-error-alert">{error}</div>}

          <button className="btn-primary full-width" disabled={busy}>
            {busy ? 'Processing...' : register ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            className="btn-link full-width"
            onClick={() => {
              setMode(register ? 'login' : 'register');
              setError('');
            }}
          >
            {register ? 'Already have an account? Sign in' : 'New to StudySync? Create account'}
          </button>
        </form>
      </section>

      {cropRawImg && (
        <ImageCropperModal
          imageSrc={cropRawImg}
          onCrop={(croppedData) => {
            setProfilePictureUrl(croppedData);
            setCropRawImg(null);
          }}
          onCancel={() => setCropRawImg(null)}
        />
      )}
    </div>
  );
}

function Dashboard({ data, onPage, onToggle, onAddSubject, onEditSubject, onDeleteSubject, onStartFocus }) {
  const completed = Number(data.dashboard?.completedToday || 0);
  const total = completed + Number(data.dashboard?.dueToday || 0);
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const upcoming = data.tasks.filter((task) => task.status !== 'COMPLETED').slice(0, 4);

  const dashStrokeDash = 283;
  const dashStrokeOffset = dashStrokeDash - (dashStrokeDash * progress) / 100;

  return (
    <div className="dashboard-grid">
      <section className="hero-banner">
        <div className="hero-content">
          <span className="badge-pill light">DAILY TARGET</span>
          <h2>
            <b>{completed}</b> of <b>{total || 1}</b> tasks completed today
          </h2>
          <div className="progress-bar-container">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="hero-subtext">
            {progress === 100 ? '🎉 All done! You killed it today!' : progress > 50 ? 'Great progress, keep pushing!' : 'Start small, build your study streak.'}
          </p>
        </div>

        <div className="ring-graphic">
          <svg width="110" height="110" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ffffff"
              strokeWidth="8"
              strokeDasharray={dashStrokeDash}
              strokeDashoffset={dashStrokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="ring-text">
            <strong>{progress}%</strong>
            <small>complete</small>
          </div>
        </div>
      </section>

      <section className="two-column-layout">
        <article className="card-box">
          <Header label="PRIORITIES" title="Today’s Tasks" action="View All →" onAction={() => onPage('tasks')} />
          {upcoming.length ? (
            <div className="task-stack">
              {upcoming.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => onToggle(task)} onStartFocus={onStartFocus} />
              ))}
            </div>
          ) : (
            <Empty text="No pending tasks for today! Take a break or add a new goal." />
          )}
        </article>

        <article className="card-box focus-promo-card">
          <span className="card-eyebrow">DEEP FOCUS</span>
          <h3>Ready to study?</h3>
          <p className="focus-promo-desc">Eliminate distractions with our Pomodoro focus mode.</p>
          <div className="promo-timer-display">25 <small>mins</small></div>
          <button className="btn-secondary full-width" onClick={() => onPage('focus')}>
            Start Focus Session →
          </button>
        </article>
      </section>

      <section className="card-box">
        <Header label="SUBJECT BREAKDOWN" title="Active Study Subjects" action="+ Add Subject" onAction={onAddSubject} />
        <div className="subjects-grid">
          {data.subjects.map((sub) => {
            const list = data.tasks.filter((task) => task.subjectId === sub.id || task.categoryId === sub.id);
            const done = list.filter((task) => task.status === 'COMPLETED').length;
            const pct = list.length ? Math.round((done / list.length) * 100) : 0;
            const subColor = sub.color || '#6366f1';
            return (
              <div
                className="subject-card"
                key={sub.id}
                style={{ borderLeftColor: subColor }}
              >
                <div>
                  <div className="subject-header">
                    <span className="subject-dot" style={{ background: subColor, color: subColor }} />
                    <h4>{sub.name} {sub.code ? <small style={{ color: 'var(--muted)', fontWeight: 400 }}>({sub.code})</small> : ''}</h4>
                    <div className="subject-actions">
                      <button
                        type="button"
                        className="subject-action-btn"
                        title={`Edit subject "${sub.name}"`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSubject(sub);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="subject-action-btn danger"
                        title={`Delete subject "${sub.name}"`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSubject(sub);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="subject-meta-badge">
                    <span>{list.length} tasks · {done} done</span>
                    <span className="subject-pct-pill">{pct}%</span>
                  </div>
                </div>

                <div className="subject-progress">
                  <div className="subject-progress-fill" style={{ width: `${pct}%`, background: subColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Tasks({ tasks, search, setSearch, filter, setFilter, onAdd, onToggle, onEdit, onDelete, onStartFocus }) {
  return (
    <div className="page-section">
      <Header label="WORKSPACE" title="Task Management" action="+ Add Task" onAction={onAdd} />

      <div className="toolbar-bar">
        <div className="filter-group">
          {[
            ['ALL', 'All Tasks'],
            ['TODAY', 'Due Today'],
            ['UPCOMING', 'Upcoming'],
            ['COMPLETED', 'Completed']
          ].map(([id, label]) => (
            <button
              key={id}
              className={`filter-tab ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks by name or tag..."
          />
        </div>
      </div>

      <article className="card-box task-list-card">
        {tasks.length ? (
          <div className="task-stack">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggle(task)}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task)}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        ) : (
          <Empty text="No tasks found matching your criteria." />
        )}
      </article>
    </div>
  );
}

function Notes({ notes, search, setSearch, filter, setFilter, onAdd, onEdit, onPin, onArchive, onDelete }) {
  return (
    <div className="page-section">
      <Header label="KNOWLEDGE BASE" title="Study Notes" action="+ New Note" onAction={onAdd} />

      <div className="toolbar-bar">
        <div className="filter-group">
          {[
            ['ALL', 'All Notes'],
            ['ACTIVE', 'Active Notes'],
            ['ARCHIVED', 'Archived']
          ].map(([id, label]) => (
            <button
              key={id}
              className={`filter-tab ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search note contents..."
          />
        </div>
      </div>

      <div className="notes-grid">
        {notes.length ? (
          notes.map((note) => (
            <article className={`note-card ${note.pinned ? 'pinned' : ''}`} key={note.id}>
              <div className="note-card-header">
                <span className="note-category-tag">
                  {note.archived ? 'ARCHIVED · ' : ''}
                  {note.categoryName || 'GENERAL'}
                </span>
                <div className="note-action-btns">
                  <button title={note.pinned ? 'Unpin' : 'Pin'} className={`action-icon-btn ${note.pinned ? 'active-pin' : ''}`} onClick={() => onPin(note)}>
                    📌
                  </button>
                  <button title={note.archived ? 'Restore' : 'Archive'} className="action-icon-btn" onClick={() => onArchive(note)}>
                    📦
                  </button>
                  <button title="Edit Note" className="action-icon-btn" onClick={() => onEdit(note)}>
                    ✏️
                  </button>
                  <button title="Delete Note" className="action-icon-btn danger" onClick={() => onDelete(note)}>
                    🗑️
                  </button>
                </div>
              </div>

              <h3 className="note-title">{note.title}</h3>
              <p className="note-body">{note.content || 'No content provided.'}</p>
              <span className="note-footer-date">
                Updated {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
              </span>
            </article>
          ))
        ) : (
          <Empty text="No notes found in this folder." />
        )}
      </div>
    </div>
  );
}

function Planner({ tasks, onEdit, onAddForDate, onToggle, onDelete, onStartFocus }) {
  const first = new Date();
  const offset = (first.getDay() + 6) % 7;
  first.setDate(first.getDate() - offset);
  const days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(first);
    d.setDate(first.getDate() + idx);
    return d;
  });

  return (
    <div className="page-section">
      <Header label="SCHEDULE" title="Weekly Study Planner" />

      <div className="planner-grid">
        {days.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const isToday = key === today();
          const list = tasks.filter((task) => task.dueDate === key);
          return (
            <div className={`planner-day-card ${isToday ? 'current-day' : ''}`} key={key}>
              <div className="day-header">
                <div className="day-header-info">
                  <span className="day-name">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <span className="day-num">{date.getDate()}</span>
                </div>
                <button
                  type="button"
                  className="add-day-task-btn"
                  title={`Add task for ${date.toLocaleDateString(undefined, { weekday: 'long' })}`}
                  onClick={() => onAddForDate(key)}
                >
                  +
                </button>
              </div>

              <div className="day-tasks-stack">
                {list.length > 0 ? (
                  list.map((task) => (
                    <div
                      key={task.id}
                      className={`planner-task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`}
                    >
                      <button
                        type="button"
                        className={`planner-checkbox ${task.status === 'COMPLETED' ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(task);
                        }}
                        title={task.status === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.status === 'COMPLETED' && '✓'}
                      </button>

                      <span className="planner-task-title" onClick={() => onEdit(task)} title={task.title}>
                        {task.title}
                      </span>

                      <div className="planner-item-actions">
                        {task.status !== 'COMPLETED' && onStartFocus && (
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
                          onClick={() => onDelete(task.id)}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <button type="button" className="empty-day-btn" onClick={() => onAddForDate(key)}>
                    + Add Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Focus({ seconds, minutes, running, tasks, taskId, setTaskId, onMode, onStart, onReset }) {
  const totalSecs = minutes * 60;
  const progressPct = totalSecs > 0 ? ((totalSecs - seconds) / totalSecs) * 100 : 0;
  const strokeDash = 565; // 2 * pi * 90
  const strokeOffset = strokeDash - (strokeDash * (100 - progressPct)) / 100;

  return (
    <div className="focus-room-layout">
      <article className="card-box focus-main-card">
        <span className="card-eyebrow">POMODORO & DEEP WORK</span>
        <h2>Study Focus Room</h2>
        <p className="focus-subtitle">Minimize context switching and unlock deep work flow.</p>

        <div className="timer-ring-wrapper">
          <svg width="220" height="220" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeDasharray={strokeDash}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="timer-text-display">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </div>
        </div>

        <div className="focus-mode-tabs">
          {[
            [25, 'Pomodoro (25m)'],
            [50, 'Deep Work (50m)'],
            [5, 'Short Break (5m)']
          ].map(([num, label]) => (
            <button
              key={num}
              className={`mode-pill ${minutes === num ? 'active' : ''}`}
              onClick={() => onMode(num)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="focus-controls">
          <button className={`btn-primary large ${running ? 'running' : ''}`} onClick={onStart}>
            {running ? 'Pause Session' : 'Start Session'}
          </button>
          <button className="btn-outline large" onClick={onReset}>
            Reset
          </button>
        </div>
      </article>

      <article className="card-box intention-card">
        <span className="card-eyebrow">SESSION GOAL</span>
        <h3>What are you focusing on?</h3>

        <div className="field-group">
          <label>Link to Task</label>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="select-input">
            <option value="">General Focus Session</option>
            {tasks
              .filter((task) => task.status !== 'COMPLETED')
              .map((task) => (
                <option value={task.id} key={task.id}>
                  {task.title}
                </option>
              ))}
          </select>
        </div>

        <div className="tip-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <span>Completed focus sessions contribute automatically to your weekly momentum score!</span>
        </div>
      </article>
    </div>
  );
}

function Analytics({ statistics, dashboard }) {
  const points = statistics?.productivity || [];
  const highest = Math.max(1, ...points.map((pt) => Math.max(pt.focusMinutes, pt.completedTasks * 10)));

  return (
    <div className="page-section">
      <Header label="INSIGHTS" title="Productivity & Momentum" />

      <div className="metrics-row">
        <Metric label="COMPLETED TASKS" value={statistics?.completedTasks || 0} sub="Tasks accomplished" />
        <Metric label="TOTAL FOCUS TIME" value={fmtMinutes(statistics?.focusMinutes)} sub="Recorded focus sessions" />
        <Metric label="PRODUCTIVITY SCORE" value={`${dashboard?.productivityScore || 0}/100`} sub="Calculated momentum index" />
      </div>

      <article className="card-box chart-card">
        <Header label="DAILY TREND" title="Weekly Activity" meta="Focus Minutes (Violet) vs Tasks Completed (Green)" />

        <div className="bar-chart-area">
          {points.length ? (
            points.map((pt) => (
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
                <span className="column-label">
                  {new Date(`${pt.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            ))
          ) : (
            <Empty text="No productivity data logged yet for this week." />
          )}
        </div>

        <div className="chart-legend">
          <span className="legend-item focus">Focus Minutes</span>
          <span className="legend-item task">Completed Tasks</span>
        </div>
      </article>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete, onStartFocus }) {
  const done = task.status === 'COMPLETED';
  const mins = Number(task.durationMinutes) || 25;

  return (
    <div className={`task-row-item ${done ? 'completed' : ''}`}>
      <button className={`check-box-btn ${done ? 'checked' : ''}`} onClick={onToggle}>
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

      <span className={`priority-pill ${task.priority?.toLowerCase()}`}>
        {task.priority?.toLowerCase()}
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
          <button title="Edit" className="icon-btn-sm" onClick={onEdit}>✏️</button>
          <button title="Delete" className="icon-btn-sm danger" onClick={onDelete}>🗑️</button>
        </div>
      )}
    </div>
  );
}

function Header({ label, title, action, onAction, meta }) {
  return (
    <div className="section-header-bar">
      <div>
        <span className="card-eyebrow">{label}</span>
        <h2 className="section-header-title">{title}</h2>
      </div>
      {action ? (
        <button className="btn-primary" onClick={onAction}>{action}</button>
      ) : meta ? (
        <span className="header-meta-text">{meta}</span>
      ) : null}
    </div>
  );
}

function Input({ label, value, setValue, type = 'text', required, placeholder, multi, minLength }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      {multi ? (
        <textarea
          className="textarea-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="text-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
          placeholder={placeholder}
          minLength={minLength}
        />
      )}
    </div>
  );
}

function Select({ label, value, setValue, options }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      <select className="select-input" value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function TaskModal({ task, subjects = [], categories = [], onClose, onSave, onAddSubject, onAddCategory }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || today());
  const [priority, setPriority] = useState(task.priority || 'MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState(task.durationMinutes || 25);
  const [subjectId, setSubjectId] = useState(task.subjectId || '');
  const [categoryId, setCategoryId] = useState(task.categoryId || '');

  return (
    <Modal title={task.id ? 'Edit Task' : 'Create New Task'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            task: {
              id: task.id,
              title,
              description: description || null,
              dueDate: dueDate || null,
              priority,
              durationMinutes: Number(durationMinutes) || 25,
            },
            subjectId,
            categoryId,
          });
        }}
      >
        <Input label="Task Title" value={title} setValue={setTitle} required placeholder="e.g. Review Organic Chemistry Notes" />
        <Input label="Description" value={description} setValue={setDescription} multi placeholder="Add additional details or sub-goals..." />

        <div className="two-col-fields">
          <Input label="Due Date" type="date" value={dueDate} setValue={setDueDate} />
          <Input
            label="Focus Timer (Minutes) ⏱️"
            type="number"
            value={durationMinutes}
            setValue={setDurationMinutes}
            placeholder="e.g. 25"
          />
        </div>

        <div className="two-col-fields">
          <Select
            label="Priority Level"
            value={priority}
            setValue={setPriority}
            options={[
              ['HIGH', 'High Priority'],
              ['MEDIUM', 'Medium Priority'],
              ['LOW', 'Low Priority']
            ]}
          />
          <div className="field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Subject / Course</label>
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
                onClick={onAddSubject}
              >
                + Add Subject
              </button>
            </div>
            <select className="select-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Select subject / course...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Category / Tag</label>
            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
              onClick={onAddCategory}
            >
              + Add Category
            </button>
          </div>
          <select className="select-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category / tag...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || '🏷️'} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-primary full-width modal-submit">{task.id ? 'Save Changes' : 'Create Task'}</button>
      </form>
    </Modal>
  );
}

function NoteModal({ note, subjects = [], categories = [], onClose, onSave, onAddSubject, onAddCategory }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [pinned, setPinned] = useState(Boolean(note.pinned));
  const [subjectId, setSubjectId] = useState(note.subjectId || '');
  const [categoryId, setCategoryId] = useState(note.categoryId || '');

  return (
    <Modal title={note.id ? 'Edit Note' : 'New Note'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            note: { id: note.id, title, content, pinned },
            subjectId,
            categoryId,
          });
        }}
      >
        <Input label="Note Title" value={title} setValue={setTitle} required placeholder="e.g. Thermodynamics Summary" />
        <Input label="Content" value={content} setValue={setContent} multi placeholder="Type or paste your notes here..." />

        <div className="field-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Subject / Course</label>
            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
              onClick={onAddSubject}
            >
              + Add Subject
            </button>
          </div>
          <select className="select-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject / course...</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} {sub.code ? `(${sub.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Category / Tag</label>
            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
              onClick={onAddCategory}
            >
              + Add Category
            </button>
          </div>
          <select className="select-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category / tag...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || '🏷️'} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          <span>Pin this note to top</span>
        </label>

        <button className="btn-primary full-width modal-submit">Save Note</button>
      </form>
    </Modal>
  );
}

function ImageCropperModal({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgObj, setImgObj] = useState(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImgObj(img);
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 280;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    const centerX = size / 2 + offset.x;
    const centerY = size / 2 + offset.y;
    ctx.translate(centerX, centerY);

    const aspect = imgObj.width / imgObj.height;
    let drawWidth = size * zoom;
    let drawHeight = (size / aspect) * zoom;
    if (aspect < 1) {
      drawHeight = size * zoom;
      drawWidth = size * aspect * zoom;
    }

    ctx.drawImage(imgObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Circular overlay mask
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(size / 2, size / 2, size / 2 - 15, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [imgObj, zoom, offset]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const applyCrop = () => {
    if (!imgObj) return;
    const cropSize = 240;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropSize;
    outCanvas.height = cropSize;
    const outCtx = outCanvas.getContext('2d');

    outCtx.save();
    outCtx.beginPath();
    outCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    outCtx.clip();

    const scale = cropSize / 280;
    const centerX = (280 / 2 + offset.x) * scale;
    const centerY = (280 / 2 + offset.y) * scale;
    outCtx.translate(centerX, centerY);

    const aspect = imgObj.width / imgObj.height;
    let drawWidth = cropSize * zoom;
    let drawHeight = (cropSize / aspect) * zoom;
    if (aspect < 1) {
      drawHeight = cropSize * zoom;
      drawWidth = cropSize * aspect * zoom;
    }

    outCtx.drawImage(imgObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    outCtx.restore();

    onCrop(outCanvas.toDataURL('image/png'));
  };

  return (
    <Modal title="Crop & Adjust Profile Picture" onClose={onCancel}>
      <div className="cropper-container">
        <p className="cropper-tip">Drag image to position photo inside ring.</p>
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '12px', touchAction: 'none' }}
          />
        </div>

        <div className="field-group" style={{ marginTop: '16px', width: '100%' }}>
          <label>Zoom Level: {Math.round(zoom * 100)}%</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="text-input"
          />
        </div>

        <div className="two-col-fields" style={{ marginTop: '20px', width: '100%' }}>
          <button type="button" className="btn-outline full-width" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary full-width" onClick={applyCrop}>
            Crop & Apply Photo ✨
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ProfileModal({ user, onClose, onSave }) {
  const [tab, setTab] = useState('general');
  const [name, setName] = useState(user?.name || 'Chavan Ravindra');
  const [email, setEmail] = useState(user?.email || 'ravindrachavan265125@gmail.com');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyTargetHours, setDailyTargetHours] = useState(user?.dailyTargetHours || 4);
  const [theme, setTheme] = useState(user?.theme || 'violet');
  const [avatarBadge, setAvatarBadge] = useState(user?.avatarBadge || '🎓');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [cropperSrc, setCropperSrc] = useState(null);
  const [defaultFocusMinutes, setDefaultFocusMinutes] = useState(user?.defaultFocusMinutes || 25);
  const [enableReminders, setEnableReminders] = useState(user?.enableReminders ?? true);
  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);

  const handleModalDevicePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const themeOptions = [
    { id: 'violet', label: 'Violet Indigo', color: '#6366f1' },
    { id: 'teal', label: 'Emerald Teal', color: '#0d9488' },
    { id: 'rose', label: 'Sunset Rose', color: '#e11d48' },
    { id: 'amber', label: 'Amber Gold', color: '#d97706' },
    { id: 'cyan', label: 'Cyan Wave', color: '#0891b2' },
  ];

  const avatarBadges = ['🎓', '💻', '🔬', '📚', '🎨', '🚀', '⚡', '🏆'];

  return (
    <Modal title="Profile & Account Settings" onClose={onClose}>
      <div className="profile-tabs">
        <button
          type="button"
          className={`profile-tab-btn ${tab === 'general' ? 'active' : ''}`}
          onClick={() => setTab('general')}
        >
          Personal Info
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${tab === 'appearance' ? 'active' : ''}`}
          onClick={() => setTab('appearance')}
        >
          Theme & Avatar
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${tab === 'preferences' ? 'active' : ''}`}
          onClick={() => setTab('preferences')}
        >
          Study Preferences
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            name,
            email,
            bio,
            dailyTargetHours: Number(dailyTargetHours),
            theme,
            avatarBadge,
            profilePictureUrl,
            defaultFocusMinutes: Number(defaultFocusMinutes),
            enableReminders,
            soundEnabled,
          });
        }}
      >
        {tab === 'general' && (
          <>
            <Input label="Display Name" value={name} setValue={setName} required placeholder="Full Name" />
            <Input label="Email Address" type="email" value={email} setValue={setEmail} required placeholder="you@example.com" />
            <Input label="Bio / Study Goal" value={bio} setValue={setBio} multi placeholder="e.g. Computer Science major, aiming for a 3.9 GPA!" />
          </>
        )}

        {tab === 'appearance' && (
          <>
            <div className="field-group">
              <label>Profile Picture (From Device)</label>
              <div className="file-upload-picker">
                <input
                  type="file"
                  id="modal-device-pic"
                  accept="image/*"
                  onChange={handleModalDevicePhoto}
                  style={{ display: 'none' }}
                />
                <label htmlFor="modal-device-pic" className="file-upload-btn">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Preview" className="avatar-preview-img" />
                  ) : (
                    <div className="file-upload-placeholder">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Choose image file from your device</span>
                    </div>
                  )}
                </label>
                {profilePictureUrl && (
                  <button type="button" className="btn-link text-danger" onClick={() => setProfilePictureUrl('')}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <div className="field-group">
              <label>Avatar Badge / Emoji</label>
              <div className="avatar-picker-grid">
                {avatarBadges.map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    className={`avatar-badge-option ${avatarBadge === badge ? 'active' : ''}`}
                    onClick={() => setAvatarBadge(badge)}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Accent Theme Color</label>
              <div className="theme-swatch-grid">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`theme-swatch-btn ${theme === opt.id ? 'active' : ''}`}
                    onClick={() => setTheme(opt.id)}
                  >
                    <span className="swatch-color-dot" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'preferences' && (
          <>
            <Select
              label="Default Focus Session Duration"
              value={defaultFocusMinutes}
              setValue={setDefaultFocusMinutes}
              options={[
                [15, '15 Minutes (Quick Focus)'],
                [25, '25 Minutes (Standard Pomodoro)'],
                [50, '50 Minutes (Deep Work)'],
                [90, '90 Minutes (Intensive Session)']
              ]}
            />

            <label className="checkbox-field">
              <input type="checkbox" checked={enableReminders} onChange={(e) => setEnableReminders(e.target.checked)} />
              <span>Enable daily study reminders</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
              <span>Play audio chime when focus timer finishes</span>
            </label>
          </>
        )}

        <button className="btn-primary full-width modal-submit">Save Profile & Preferences</button>
      </form>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          onCrop={(croppedData) => {
            setProfilePictureUrl(croppedData);
            setCropperSrc(null);
          }}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </Modal>
  );
}

function Avatar({ user }) {
  const rawUrl = user?.profilePictureUrl || 'https://i.postimg.cc/wMf7YsRW/Ravindra-Chavan.png';
  const imgUrl = resolveImageUrl(rawUrl);
  if (imgUrl) {
    return (
      <img
        className="avatar-img"
        src={imgUrl}
        alt={user?.name || 'Profile'}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }
  if (user?.avatarBadge) {
    return <div className="avatar-badge">{user.avatarBadge}</div>;
  }
  return <div className="avatar-badge">{(user?.name || 'C').charAt(0).toUpperCase()}</div>;
}

function Metric({ label, value, sub }) {
  return (
    <article className="card-box metric-card">
      <span className="card-eyebrow">{label}</span>
      <strong className="metric-value">{value}</strong>
      <small className="metric-sub">{sub}</small>
    </article>
  );
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📂</div>
      <p>{text}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading your StudySync workspace...</p>
    </div>
  );
}

function SubjectModal({ subject, onClose, onSave }) {
  const [name, setName] = useState(subject?.name || '');
  const [code, setCode] = useState(subject?.code || '');
  const [color, setColor] = useState(subject?.color || '#6366f1');

  const colorPresets = [
    { label: 'Violet Indigo', hex: '#6366f1' },
    { label: 'Emerald Teal', hex: '#10b981' },
    { label: 'Sunset Rose', hex: '#f43f5e' },
    { label: 'Amber Gold', hex: '#f59e0b' },
    { label: 'Cyan Wave', hex: '#0891b2' },
    { label: 'Purple Plum', hex: '#8b5cf6' },
  ];

  return (
    <Modal title={subject?.id ? 'Edit Study Subject' : 'Add New Study Subject'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSave({ id: subject?.id, name: name.trim(), code: code.trim(), color });
        }}
      >
        <Input
          label="Subject / Course Name"
          value={name}
          setValue={setName}
          required
          placeholder="e.g. Organic Chemistry, Macroeconomics, Data Structures"
        />

        <Input
          label="Subject Code / Abbreviation"
          value={code}
          setValue={setCode}
          placeholder="e.g. CHEM201, MATH101, CS102"
        />

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Subject Color Accent</label>
          <div className="theme-swatch-grid">
            {colorPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className={`theme-swatch-btn ${color === preset.hex ? 'active' : ''}`}
                onClick={() => setColor(preset.hex)}
              >
                <span className="swatch-color-dot" style={{ background: preset.hex }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary full-width modal-submit" style={{ marginTop: '20px' }}>
          {subject?.id ? 'Save Subject Changes ✨' : 'Create Subject ✨'}
        </button>
      </form>
    </Modal>
  );
}

function CategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '📝');
  const [color, setColor] = useState(category?.color || '#6366f1');

  const iconOptions = ['📝', '🧪', '⚡', '🎯', '📖', '💡', '📊', '🏆', '💻'];

  const colorPresets = [
    { label: 'Violet Indigo', hex: '#6366f1' },
    { label: 'Emerald Teal', hex: '#10b981' },
    { label: 'Sunset Rose', hex: '#f43f5e' },
    { label: 'Amber Gold', hex: '#f59e0b' },
    { label: 'Cyan Wave', hex: '#0891b2' },
    { label: 'Purple Plum', hex: '#8b5cf6' },
  ];

  return (
    <Modal title={category?.id ? 'Edit Category' : 'Add New Category'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSave({ id: category?.id, name: name.trim(), icon, color });
        }}
      >
        <Input
          label="Category / Tag Name"
          value={name}
          setValue={setName}
          required
          placeholder="e.g. Homework, Lab Report, Exam Prep, Revision"
        />

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Category Badge Icon</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {iconOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`avatar-badge-btn ${icon === item ? 'active' : ''}`}
                onClick={() => setIcon(item)}
                style={{ width: '38px', height: '38px', fontSize: '18px' }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Category Color Accent</label>
          <div className="theme-swatch-grid">
            {colorPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className={`theme-swatch-btn ${color === preset.hex ? 'active' : ''}`}
                onClick={() => setColor(preset.hex)}
              >
                <span className="swatch-color-dot" style={{ background: preset.hex }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary full-width modal-submit" style={{ marginTop: '20px' }}>
          {category?.id ? 'Save Category Changes ✨' : 'Create Category ✨'}
        </button>
      </form>
    </Modal>
  );
}
