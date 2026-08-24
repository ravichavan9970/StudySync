const BASE_URL = (
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://studysync-api.onrender.com/api/v1' 
    : 'http://localhost:8080/api/v1')
).replace(/\/$/, '');

// LocalStorage key helpers for Offline Multi-User Isolation
const STORAGE_KEYS = {
  USER: 'studysync_demo_user',
  USERS_MAP: 'studysync_users_map',
  TASKS: 'studysync_demo_tasks',
  NOTES: 'studysync_demo_notes',
  SUBJECTS: 'studysync_demo_subjects',
  CATEGORIES: 'studysync_demo_categories',
  SESSIONS: 'studysync_demo_sessions',
};

// Helper to resolve and trim image URLs
export function resolveImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('postimg.cc') || trimmed.includes('Ravindra-Chavan') || trimmed.includes('jnfsz2XN')) {
    return '';
  }
  return trimmed;
}

function getStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

// Sync with Edge Cloud Store (reconciles mobile and laptop in real-time)
export async function pushUserToCloud(userObj) {
  try {
    if (typeof window !== 'undefined' && userObj?.email) {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj),
      }).catch(() => {});
    }
  } catch {}
}

export async function fetchCloudUsers() {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/sync').catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        return data?.users || {};
      }
    }
  } catch {}
  return {};
}

export async function deleteCloudUser(id, email, all = false) {
  try {
    if (typeof window !== 'undefined') {
      const query = all ? 'all=true' : (id ? `id=${id}` : `email=${email}`);
      await fetch(`/api/sync?${query}`, { method: 'DELETE' }).catch(() => {});
    }
  } catch {}
}

function nameFromEmail(email = '') {
  const handle = email.split('@')[0] || '';
  if (!handle) return 'Student';
  const clean = handle.replace(/[0-9_.-]+/g, ' ').trim();
  if (!clean) return handle;
  return clean
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function api(path, { token, body, headers = {}, method = 'GET', ...options } = {}) {
  const requestHeaders = { ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (path.startsWith('/admin') || (typeof window !== 'undefined' && sessionStorage.getItem('studysync_admin_unlocked') === 'true')) {
    requestHeaders['X-Admin-Passcode'] = 'StudySync#*&Master2026!Admin';
  }
  if (body && !(body instanceof FormData)) requestHeaders['Content-Type'] ??= 'application/json';

  let response;
  let attempts = 0;
  const isCriticalCloudOp = path.startsWith('/auth/register') || path.startsWith('/auth/login') || path.startsWith('/admin') || path.startsWith('/users');
  const maxAttempts = isCriticalCloudOp ? 2 : 1;

  while (attempts < maxAttempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      response = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal, method, headers: requestHeaders, body });
      clearTimeout(timeoutId);
      break;
    } catch {
      attempts++;
      if (attempts >= maxAttempts) {
        return handleOfflineDemoRequest(path, method, body);
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  if (!response) {
    return handleOfflineDemoRequest(path, method, body);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detailsMsg =
      typeof data?.details === 'object' && data?.details !== null
        ? Object.entries(data.details).map(([field, msg]) => `${field}: ${msg}`).join(', ')
        : data?.details;
    const error = new Error(detailsMsg || data?.error || data?.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
}

// Multi-User Offline Vault Handler
async function handleOfflineDemoRequest(path, method, bodyRaw) {
  const body = typeof bodyRaw === 'string' ? JSON.parse(bodyRaw) : bodyRaw || {};
  const cleanPath = path.split('?')[0];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Persistent registry of all users
  const usersMap = getStored(STORAGE_KEYS.USERS_MAP, {});
  
  // Current active user
  let activeUser = getStored(STORAGE_KEYS.USER, {
    id: 'usr_default',
    name: 'Student',
    email: '',
    role: 'USER',
    profilePictureUrl: '',
    avatarBadge: '🎓',
    darkMode: false,
    theme: 'violet',
    streakCount: 0,
    productivityScore: 0,
  });

  const activeEmailKey = (activeUser?.email || '').toLowerCase().trim();

  // Helper to isolate data per user email
  const getScopedKey = (baseKey) => {
    return activeEmailKey ? `${baseKey}_${activeEmailKey}` : baseKey;
  };

  let tasks = getStored(getScopedKey(STORAGE_KEYS.TASKS), []);
  let notes = getStored(getScopedKey(STORAGE_KEYS.NOTES), []);
  let subjects = getStored(getScopedKey(STORAGE_KEYS.SUBJECTS), []);
  let categories = getStored(getScopedKey(STORAGE_KEYS.CATEGORIES), []);
  let sessions = getStored(getScopedKey(STORAGE_KEYS.SESSIONS), []);

  const saveTasks = (next) => { tasks = next; setStored(getScopedKey(STORAGE_KEYS.TASKS), next); };
  const saveNotes = (next) => { notes = next; setStored(getScopedKey(STORAGE_KEYS.NOTES), next); };
  const saveSubjects = (next) => { subjects = next; setStored(getScopedKey(STORAGE_KEYS.SUBJECTS), next); };
  const saveCategories = (next) => { categories = next; setStored(getScopedKey(STORAGE_KEYS.CATEGORIES), next); };
  const saveSessions = (next) => { sessions = next; setStored(getScopedKey(STORAGE_KEYS.SESSIONS), next); };

  // 1. REGISTRATION
  if (cleanPath === '/auth/register') {
    const emailKey = (body.email || '').toLowerCase().trim();
    if (!emailKey) {
      const err = new Error('Email is required.');
      err.status = 400;
      throw err;
    }

    const name = body.name ? body.name.trim() : nameFromEmail(emailKey);
    const newUser = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name,
      email: emailKey,
      role: 'USER',
      profilePictureUrl: resolveImageUrl(body.profilePictureUrl || ''),
      avatarBadge: '🎓',
      darkMode: false,
      theme: 'violet',
      streakCount: 0,
      productivityScore: 0,
      createdAt: new Date().toISOString(),
    };

    // Store in global users registry (NEVER overwrite other users)
    usersMap[emailKey] = { ...newUser };
    setStored(STORAGE_KEYS.USERS_MAP, usersMap);

    // Sync to cloud store so laptop sees it immediately
    pushUserToCloud(newUser);

    // Set as active user
    setStored(STORAGE_KEYS.USER, newUser);

    // Initialize user's separate empty data vaults
    setStored(`${STORAGE_KEYS.TASKS}_${emailKey}`, []);
    setStored(`${STORAGE_KEYS.NOTES}_${emailKey}`, []);
    setStored(`${STORAGE_KEYS.SUBJECTS}_${emailKey}`, []);
    setStored(`${STORAGE_KEYS.CATEGORIES}_${emailKey}`, []);
    setStored(`${STORAGE_KEYS.SESSIONS}_${emailKey}`, []);

    try {
      localStorage.setItem('studysync-user-name', name);
    } catch {}

    return {
      token: 'auth-token-' + Date.now(),
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profilePictureUrl: newUser.profilePictureUrl,
      role: 'USER',
    };
  }

  // 2. LOGIN
  if (cleanPath === '/auth/login') {
    const emailKey = (body.email || '').toLowerCase().trim();
    
    // Master Administrator Account
    if (
      (emailKey === 'ravi@7447' || emailKey === 'ravi@7447@studysync.io' || emailKey === 'admin@studysync.io') &&
      body.password === 'StudySync#*&Master2026!Admin'
    ) {
      const adminUser = {
        id: 'usr_root_admin',
        name: 'Master Administrator',
        email: 'Ravi@7447',
        role: 'ADMIN',
        profilePictureUrl: '',
        avatarBadge: '🛡️',
        darkMode: true,
        theme: 'violet',
        streakCount: 99,
        productivityScore: 100,
      };
      setStored(STORAGE_KEYS.USER, adminUser);
      return {
        token: 'auth-token-master-admin-' + Date.now(),
        userId: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        profilePictureUrl: '',
        role: 'ADMIN',
      };
    }

    let existing = usersMap[emailKey];

    // If not found in local browser storage, check Cloud Sync (e.g. registered on mobile)
    if (!existing) {
      try {
        const cloudUsers = await fetchCloudUsers();
        if (cloudUsers && cloudUsers[emailKey]) {
          existing = cloudUsers[emailKey];
          usersMap[emailKey] = existing;
          setStored(STORAGE_KEYS.USERS_MAP, usersMap);
        }
      } catch {}
    }

    // Fallback: If unknown email, dynamically register account so mobile and laptop can sign in freely
    if (!existing && emailKey) {
      const name = nameFromEmail(emailKey);
      existing = {
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        name,
        email: emailKey,
        role: 'USER',
        profilePictureUrl: '',
        avatarBadge: '🎓',
        darkMode: false,
        theme: 'violet',
        streakCount: 0,
        productivityScore: 0,
        createdAt: new Date().toISOString(),
      };
      usersMap[emailKey] = existing;
      setStored(STORAGE_KEYS.USERS_MAP, usersMap);
      pushUserToCloud(existing);
    }

    if (!existing) {
      const err = new Error('Invalid email or password. This user account does not exist.');
      err.status = 401;
      throw err;
    }

    // Set existing user as active user
    setStored(STORAGE_KEYS.USER, existing);
    try {
      if (existing.name) localStorage.setItem('studysync-user-name', existing.name);
    } catch {}

    return {
      token: 'auth-token-' + Date.now(),
      userId: existing.id,
      name: existing.name,
      email: existing.email,
      profilePictureUrl: existing.profilePictureUrl || '',
      role: existing.role || 'USER',
    };
  }

  // 3. PROFILE
  if (cleanPath === '/users/me') {
    activeUser.profilePictureUrl = resolveImageUrl(activeUser.profilePictureUrl || '');
    return activeUser;
  }
  
  if (cleanPath === '/profile' && method === 'PUT') {
    Object.assign(activeUser, body);
    activeUser.profilePictureUrl = resolveImageUrl(activeUser.profilePictureUrl || '');
    setStored(STORAGE_KEYS.USER, activeUser);
    if (activeUser.email) {
      const em = activeUser.email.toLowerCase();
      usersMap[em] = { ...(usersMap[em] || {}), ...activeUser };
      setStored(STORAGE_KEYS.USERS_MAP, usersMap);
      pushUserToCloud(activeUser);
    }
    try {
      if (activeUser.name) localStorage.setItem('studysync-user-name', activeUser.name);
    } catch {}
    return activeUser;
  }

  // 4. SUBJECTS (Isolated per user)
  if (cleanPath === '/subjects') {
    if (method === 'POST') {
      const newSub = { id: `sub-${Date.now()}`, name: body.name, code: body.code || '', color: body.color || '#6366f1' };
      saveSubjects([...subjects, newSub]);
      return newSub;
    }
    return subjects;
  }

  if (cleanPath.startsWith('/subjects/') && method === 'DELETE') {
    const subId = cleanPath.split('/')[2];
    saveSubjects(subjects.filter((s) => s.id !== subId));
    return null;
  }

  if (cleanPath.startsWith('/subjects/') && method === 'PUT') {
    const subId = cleanPath.split('/')[2];
    const idx = subjects.findIndex((s) => s.id === subId);
    if (idx !== -1) {
      const next = [...subjects];
      next[idx] = { ...next[idx], ...body };
      saveSubjects(next);
      return next[idx];
    }
  }

  // 5. CATEGORIES (Isolated per user)
  if (cleanPath === '/categories') {
    if (method === 'POST') {
      const newCat = { id: `cat-${Date.now()}`, name: body.name, icon: body.icon || '🏷️', color: body.color || '#6366f1' };
      saveCategories([...categories, newCat]);
      return newCat;
    }
    return categories;
  }

  if (cleanPath.startsWith('/categories/') && method === 'DELETE') {
    const catId = cleanPath.split('/')[2];
    saveCategories(categories.filter((c) => c.id !== catId));
    return null;
  }

  if (cleanPath.startsWith('/categories/') && method === 'PUT') {
    const catId = cleanPath.split('/')[2];
    const idx = categories.findIndex((c) => c.id === catId);
    if (idx !== -1) {
      const next = [...categories];
      next[idx] = { ...next[idx], ...body };
      saveCategories(next);
      return next[idx];
    }
  }

  // 6. TASKS (Isolated per user)
  if (cleanPath === '/tasks') {
    if (method === 'POST') {
      const category = categories.find((c) => c.id === body.categoryId);
      const subject = subjects.find((s) => s.id === body.subjectId);
      const newTask = {
        id: `task-${Date.now()}`,
        title: body.title,
        description: body.description || null,
        priority: body.priority || 'MEDIUM',
        status: 'PENDING',
        dueDate: body.dueDate || todayStr,
        durationMinutes: Number(body.durationMinutes) || 25,
        subjectId: body.subjectId || null,
        categoryId: body.categoryId || null,
        categoryName: subject ? subject.name : (category ? category.name : 'General'),
        createdAt: new Date().toISOString(),
      };
      saveTasks([...tasks, newTask]);
      return newTask;
    }
    return { content: tasks, totalPages: 1 };
  }

  if (cleanPath.startsWith('/tasks/')) {
    const parts = cleanPath.split('/');
    const taskId = parts[2];
    const isCompleteRoute = parts[3] === 'complete';

    if (method === 'DELETE') {
      saveTasks(tasks.filter((t) => t.id !== taskId));
      return null;
    }

    if (isCompleteRoute && method === 'PATCH') {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        if (cleanPath.includes('completed=true') || body?.completed === true || body?.status === 'COMPLETED') {
          task.status = 'COMPLETED';
        } else if (cleanPath.includes('completed=false') || body?.completed === false || body?.status === 'PENDING') {
          task.status = 'PENDING';
        } else {
          task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        }
        task.completedAt = task.status === 'COMPLETED' ? new Date().toISOString() : null;
        saveTasks([...tasks]);
        return task;
      }
    }

    if (method === 'PUT') {
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        const category = categories.find((c) => c.id === body.categoryId);
        const subject = subjects.find((s) => s.id === body.subjectId);
        const next = [...tasks];
        next[idx] = {
          ...next[idx],
          ...body,
          durationMinutes: Number(body.durationMinutes) || next[idx].durationMinutes || 25,
          categoryName: subject ? subject.name : (category ? category.name : 'General'),
        };
        saveTasks(next);
        return next[idx];
      }
    }
  }

  // 7. NOTES (Isolated per user)
  if (cleanPath === '/notes') {
    if (method === 'POST') {
      const category = categories.find((c) => c.id === body.categoryId);
      const newNote = {
        id: `note-${Date.now()}`,
        title: body.title,
        content: body.content || '',
        pinned: Boolean(body.pinned),
        archived: false,
        categoryId: body.categoryId || null,
        categoryName: category ? category.name : 'General',
        updatedAt: new Date().toISOString(),
      };
      saveNotes([newNote, ...notes]);
      return newNote;
    }
    return { content: notes, totalPages: 1 };
  }

  if (cleanPath.startsWith('/notes/')) {
    const parts = cleanPath.split('/');
    const noteId = parts[2];
    const isArchiveRoute = parts[3] === 'archive';

    if (method === 'DELETE') {
      saveNotes(notes.filter((n) => n.id !== noteId));
      return null;
    }

    if (isArchiveRoute && method === 'PATCH') {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.archived = !note.archived;
        saveNotes([...notes]);
        return note;
      }
    }

    if (method === 'PUT') {
      const idx = notes.findIndex((n) => n.id === noteId);
      if (idx !== -1) {
        const category = categories.find((c) => c.id === body.categoryId);
        const next = [...notes];
        next[idx] = {
          ...next[idx],
          ...body,
          categoryName: category ? category.name : 'General',
          updatedAt: new Date().toISOString(),
        };
        saveNotes(next);
        return next[idx];
      }
    }
  }

  // Focus and task calculations for active user
  const realFocusMinutes = sessions
    .filter((s) => s.completed !== false)
    .reduce((acc, s) => acc + Number(s.completedMinutes || s.durationMinutes || s.plannedMinutes || 0), 0);

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  
  const realScore = (completedTasksCount === 0 && realFocusMinutes === 0) 
    ? 0 
    : Math.min(100, (completedTasksCount * 20) + Math.round(realFocusMinutes / 2));

  // 8. DASHBOARD
  if (cleanPath === '/dashboard') {
    const completedToday = tasks.filter((t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt.slice(0, 10) === todayStr).length;
    const dueToday = tasks.filter((t) => t.dueDate === todayStr).length;
    
    return {
      completedToday,
      dueToday,
      streakCount: realFocusMinutes > 0 || completedTasksCount > 0 ? 1 : 0,
      productivityScore: realScore,
      weeklyFocusMinutes: realFocusMinutes,
    };
  }

  // 9. STATISTICS
  if (cleanPath === '/statistics') {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      
      const dayFocusMins = sessions
        .filter((s) => s.completed !== false && s.createdAt && s.createdAt.slice(0, 10) === dStr)
        .reduce((sum, s) => sum + Number(s.completedMinutes || s.durationMinutes || s.plannedMinutes || 0), 0);

      const dayCompletedTasks = tasks
        .filter((t) => t.status === 'COMPLETED' && ((t.completedAt && t.completedAt.slice(0, 10) === dStr) || (t.dueDate === dStr)))
        .length;

      days.push({
        date: dStr,
        focusMinutes: dayFocusMins,
        completedTasks: dayCompletedTasks,
      });
    }

    return {
      completedTasks: completedTasksCount,
      focusMinutes: realFocusMinutes,
      productivityScore: realScore,
      productivity: days,
    };
  }

  // 10. NOTIFICATIONS
  if (cleanPath === '/notifications') {
    const notifs = [];
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
    const dueTodayTasks = pendingTasks.filter((t) => t.dueDate === todayStr);

    dueTodayTasks.forEach((t) => {
      notifs.push({
        id: `notif-due-${t.id}`,
        message: `Task Due Today: "${t.title}"`
      });
    });

    const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'HIGH' && t.dueDate !== todayStr);
    highPriorityTasks.forEach((t) => {
      notifs.push({
        id: `notif-hp-${t.id}`,
        message: `High Priority: "${t.title}"`
      });
    });

    return notifs;
  }

  // 11. STUDY SESSIONS
  if (cleanPath === '/study-sessions') {
    if (method === 'POST') {
      const newSession = {
        id: `session-${Date.now()}`,
        ...body,
        durationMinutes: body.plannedMinutes || body.completedMinutes || 25,
        completed: false,
        createdAt: new Date().toISOString()
      };
      saveSessions([...sessions, newSession]);
      return newSession;
    }
  }

  if (cleanPath.startsWith('/study-sessions/') && method === 'PUT') {
    const sessId = cleanPath.split('/')[2];
    const idx = sessions.findIndex((s) => s.id === sessId);
    const updated = {
      id: sessId,
      ...body,
      durationMinutes: body.completedMinutes || body.plannedMinutes || 25,
      completed: true,
      createdAt: new Date().toISOString()
    };
    const next = [...sessions];
    if (idx !== -1) {
      next[idx] = { ...next[idx], ...updated };
    } else {
      next.push(updated);
    }
    saveSessions(next);
    return updated;
  }

  // 12. ADMIN ENDPOINTS (Aggregates all registered users)
  if (cleanPath === '/admin/system/stats') {
    const allUsersList = Object.values(usersMap).filter((u) => u && u.email);
    let totalAllTasks = 0;
    let totalAllNotes = 0;
    allUsersList.forEach((u) => {
      const uTasks = getStored(`${STORAGE_KEYS.TASKS}_${u.email.toLowerCase()}`, []);
      const uNotes = getStored(`${STORAGE_KEYS.NOTES}_${u.email.toLowerCase()}`, []);
      totalAllTasks += uTasks.length;
      totalAllNotes += uNotes.length;
    });

    return {
      totalUsers: allUsersList.length,
      activeUsers: allUsersList.length,
      totalTasks: totalAllTasks,
      completedTasks: 0,
      totalNotes: totalAllNotes,
      totalCategories: 0,
      totalSessions: 0,
      serverStatus: 'ONLINE',
    };
  }

  if (cleanPath === '/admin/users') {
    const allUsers = Object.values(usersMap).filter((u) => u && u.email);
    return {
      content: allUsers.map((u, i) => {
        const uTasks = getStored(`${STORAGE_KEYS.TASKS}_${u.email.toLowerCase()}`, []);
        const uSessions = getStored(`${STORAGE_KEYS.SESSIONS}_${u.email.toLowerCase()}`, []);
        const uStreak = uSessions.length > 0 || uTasks.length > 0 ? (u.streakCount || 1) : 0;
        return {
          id: u.id || `usr-${i + 1}`,
          name: u.name || 'Student',
          email: u.email,
          role: u.role || 'USER',
          profilePictureUrl: u.profilePictureUrl || '',
          avatarBadge: u.avatarBadge || '🎓',
          streakCount: uStreak,
          createdAt: u.createdAt || new Date().toISOString(),
        };
      }),
      totalPages: 1,
    };
  }

  if (cleanPath === '/admin/users/all' && method === 'DELETE') {
    // Purge all user vaults
    Object.keys(usersMap).forEach((em) => {
      localStorage.removeItem(`${STORAGE_KEYS.TASKS}_${em}`);
      localStorage.removeItem(`${STORAGE_KEYS.NOTES}_${em}`);
      localStorage.removeItem(`${STORAGE_KEYS.SUBJECTS}_${em}`);
      localStorage.removeItem(`${STORAGE_KEYS.CATEGORIES}_${em}`);
      localStorage.removeItem(`${STORAGE_KEYS.SESSIONS}_${em}`);
    });
    setStored(STORAGE_KEYS.USERS_MAP, {});
    deleteCloudUser(null, null, true);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('studysync-user-name');
    return null;
  }

  if (cleanPath.startsWith('/admin/users/') && method === 'DELETE') {
    const uid = cleanPath.split('/')[3];
    let targetEmail = null;
    Object.keys(usersMap).forEach((k) => {
      if (usersMap[k]?.id === uid || usersMap[k]?.email === uid || k === uid) {
        targetEmail = k;
        delete usersMap[k];
      }
    });
    if (targetEmail) {
      localStorage.removeItem(`${STORAGE_KEYS.TASKS}_${targetEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.NOTES}_${targetEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.SUBJECTS}_${targetEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.CATEGORIES}_${targetEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.SESSIONS}_${targetEmail}`);
      deleteCloudUser(uid, targetEmail);
    }
    setStored(STORAGE_KEYS.USERS_MAP, usersMap);
    return null;
  }

  return [];
}

export const session = {
  get: () => localStorage.getItem('studysync-token'),
  set: (token) => localStorage.setItem('studysync-token', token),
  clear: () => localStorage.removeItem('studysync-token'),
};
