const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

// LocalStorage key helpers for Offline Demo Mode
const STORAGE_KEYS = {
  USER: 'studysync_demo_user',
  USERS_MAP: 'studysync_users_map',
  TASKS: 'studysync_demo_tasks',
  NOTES: 'studysync_demo_notes',
  SUBJECTS: 'studysync_demo_subjects',
  CATEGORIES: 'studysync_demo_categories',
  SESSIONS: 'studysync_demo_sessions',
};

// Helper to resolve and trim image URLs (blocks legacy placeholder photos)
export function resolveImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('postimg.cc') || trimmed.includes('Ravindra-Chavan') || trimmed.includes('jnfsz2XN')) {
    return '';
  }
  return trimmed;
}

// Get current saved user name or default to Student
function getSavedUserName() {
  try {
    const saved = localStorage.getItem('studysync-user-name');
    if (saved && saved !== 'Student') return saved;
  } catch {}
  return 'Student';
}

// Clean initial data for offline mode
const INITIAL_DEMO_DATA = {
  user: {
    id: 'demo-user-id',
    name: getSavedUserName(),
    email: '',
    role: 'USER',
    profilePictureUrl: '',
    avatarBadge: '🎓',
    darkMode: false,
    theme: 'violet',
    streakCount: 0,
    productivityScore: 0,
  },
  subjects: [],
  categories: [],
  tasks: [],
  notes: [],
  sessions: [],
};

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
  if (body && !(body instanceof FormData)) requestHeaders['Content-Type'] ??= 'application/json';

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, method, headers: requestHeaders, body });
  } catch {
    // Backend unreachable -> Use Offline Fallback seamlessly!
    console.warn(`[StudySync API] Backend server at ${BASE_URL} is unreachable. Falling back to local offline mode.`);
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

// Handler for offline mode when Java Spring Boot server is not running locally
function handleOfflineDemoRequest(path, method, bodyRaw) {
  const body = typeof bodyRaw === 'string' ? JSON.parse(bodyRaw) : bodyRaw || {};
  const cleanPath = path.split('?')[0];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Initialize storage if empty
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setStored(STORAGE_KEYS.USER, INITIAL_DEMO_DATA.user);
    setStored(STORAGE_KEYS.SUBJECTS, INITIAL_DEMO_DATA.subjects);
    setStored(STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_DATA.categories);
    setStored(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
    setStored(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
    setStored(STORAGE_KEYS.SESSIONS, INITIAL_DEMO_DATA.sessions);
  }

  const user = getStored(STORAGE_KEYS.USER, INITIAL_DEMO_DATA.user);
  user.profilePictureUrl = resolveImageUrl(user.profilePictureUrl || '');

  const usersMap = getStored(STORAGE_KEYS.USERS_MAP, {});
  let tasks = getStored(STORAGE_KEYS.TASKS, INITIAL_DEMO_DATA.tasks);
  let notes = getStored(STORAGE_KEYS.NOTES, INITIAL_DEMO_DATA.notes);
  let subjects = getStored(STORAGE_KEYS.SUBJECTS, INITIAL_DEMO_DATA.subjects);
  let categories = getStored(STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_DATA.categories);
  let sessions = getStored(STORAGE_KEYS.SESSIONS, INITIAL_DEMO_DATA.sessions);

  // Ensure user name from storage
  const savedName = localStorage.getItem('studysync-user-name');
  if (savedName && savedName !== 'Student') {
    user.name = savedName;
  } else if (!user.name) {
    user.name = 'Student';
  }

  // AUTH
  if (cleanPath === '/auth/register' || cleanPath === '/auth/login') {
    const emailKey = (body.email || '').toLowerCase().trim();
    
    if (cleanPath === '/auth/register') {
      const name = body.name ? body.name.trim() : nameFromEmail(emailKey);
      user.name = name;
      user.email = emailKey;
      user.profilePictureUrl = body.profilePictureUrl || '';
      usersMap[emailKey] = { ...user, name, email: emailKey };
    } else {
      // LOGIN
      if (usersMap[emailKey]) {
        Object.assign(user, usersMap[emailKey]);
      } else if (emailKey) {
        const derivedName = body.name ? body.name.trim() : nameFromEmail(emailKey);
        user.name = derivedName;
        user.email = emailKey;
        user.profilePictureUrl = user.profilePictureUrl || '';
        usersMap[emailKey] = { ...user, name: derivedName, email: emailKey };
      }
    }

    setStored(STORAGE_KEYS.USER, user);
    setStored(STORAGE_KEYS.USERS_MAP, usersMap);
    try {
      if (user.name) localStorage.setItem('studysync-user-name', user.name);
    } catch {}

    return {
      token: 'demo-offline-token-12345',
      userId: user.id,
      name: user.name,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl || '',
      role: 'USER',
    };
  }

  // PROFILE
  if (cleanPath === '/users/me') {
    const savedName = localStorage.getItem('studysync-user-name');
    if (savedName && savedName !== 'Student') {
      user.name = savedName;
    }
    user.profilePictureUrl = resolveImageUrl(user.profilePictureUrl || '');
    return user;
  }
  
  if (cleanPath === '/profile' && method === 'PUT') {
    Object.assign(user, body);
    user.profilePictureUrl = resolveImageUrl(user.profilePictureUrl || '');
    setStored(STORAGE_KEYS.USER, user);
    if (user.email) {
      usersMap[user.email.toLowerCase()] = { ...user };
      setStored(STORAGE_KEYS.USERS_MAP, usersMap);
    }
    try {
      if (user.name) localStorage.setItem('studysync-user-name', user.name);
    } catch {}
    return user;
  }

  // SUBJECTS
  if (cleanPath === '/subjects') {
    if (method === 'POST') {
      const newSub = { id: `sub-${Date.now()}`, name: body.name, code: body.code || '', color: body.color || '#6366f1' };
      subjects.push(newSub);
      setStored(STORAGE_KEYS.SUBJECTS, subjects);
      return newSub;
    }
    return subjects;
  }

  if (cleanPath.startsWith('/subjects/') && method === 'DELETE') {
    const subId = cleanPath.split('/')[2];
    subjects = subjects.filter((s) => s.id !== subId);
    setStored(STORAGE_KEYS.SUBJECTS, subjects);
    return null;
  }

  if (cleanPath.startsWith('/subjects/') && method === 'PUT') {
    const subId = cleanPath.split('/')[2];
    const idx = subjects.findIndex((s) => s.id === subId);
    if (idx !== -1) {
      subjects[idx] = { ...subjects[idx], ...body };
      setStored(STORAGE_KEYS.SUBJECTS, subjects);
      return subjects[idx];
    }
  }

  // CATEGORIES
  if (cleanPath === '/categories') {
    if (method === 'POST') {
      const newCat = { id: `cat-${Date.now()}`, name: body.name, icon: body.icon || '🏷️', color: body.color || '#6366f1' };
      categories.push(newCat);
      setStored(STORAGE_KEYS.CATEGORIES, categories);
      return newCat;
    }
    return categories;
  }

  if (cleanPath.startsWith('/categories/') && method === 'DELETE') {
    const catId = cleanPath.split('/')[2];
    categories = categories.filter((c) => c.id !== catId);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    return null;
  }

  if (cleanPath.startsWith('/categories/') && method === 'PUT') {
    const catId = cleanPath.split('/')[2];
    const idx = categories.findIndex((c) => c.id === catId);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...body };
      setStored(STORAGE_KEYS.CATEGORIES, categories);
      return categories[idx];
    }
  }

  // TASKS
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
      tasks.push(newTask);
      setStored(STORAGE_KEYS.TASKS, tasks);
      return newTask;
    }
    return { content: tasks, totalPages: 1 };
  }

  if (cleanPath.startsWith('/tasks/')) {
    const parts = cleanPath.split('/');
    const taskId = parts[2];
    const isCompleteRoute = parts[3] === 'complete';

    if (method === 'DELETE') {
      tasks = tasks.filter((t) => t.id !== taskId);
      setStored(STORAGE_KEYS.TASKS, tasks);
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
        setStored(STORAGE_KEYS.TASKS, tasks);
        return task;
      }
    }

    if (method === 'PUT') {
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        const category = categories.find((c) => c.id === body.categoryId);
        const subject = subjects.find((s) => s.id === body.subjectId);
        tasks[idx] = {
          ...tasks[idx],
          ...body,
          durationMinutes: Number(body.durationMinutes) || tasks[idx].durationMinutes || 25,
          categoryName: subject ? subject.name : (category ? category.name : 'General'),
        };
        setStored(STORAGE_KEYS.TASKS, tasks);
        return tasks[idx];
      }
    }
  }

  // NOTES
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
      notes.unshift(newNote);
      setStored(STORAGE_KEYS.NOTES, notes);
      return newNote;
    }
    return { content: notes, totalPages: 1 };
  }

  if (cleanPath.startsWith('/notes/')) {
    const parts = cleanPath.split('/');
    const noteId = parts[2];
    const isArchiveRoute = parts[3] === 'archive';

    if (method === 'DELETE') {
      notes = notes.filter((n) => n.id !== noteId);
      setStored(STORAGE_KEYS.NOTES, notes);
      return null;
    }

    if (isArchiveRoute && method === 'PATCH') {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.archived = !note.archived;
        setStored(STORAGE_KEYS.NOTES, notes);
        return note;
      }
    }

    if (method === 'PUT') {
      const idx = notes.findIndex((n) => n.id === noteId);
      if (idx !== -1) {
        const category = categories.find((c) => c.id === body.categoryId);
        notes[idx] = {
          ...notes[idx],
          ...body,
          categoryName: category ? category.name : 'General',
          updatedAt: new Date().toISOString(),
        };
        setStored(STORAGE_KEYS.NOTES, notes);
        return notes[idx];
      }
    }
  }

  // Focus and task calculations
  const realFocusMinutes = sessions
    .filter((s) => s.completed !== false)
    .reduce((acc, s) => acc + Number(s.completedMinutes || s.durationMinutes || s.plannedMinutes || 0), 0);

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  
  const realScore = (completedTasksCount === 0 && realFocusMinutes === 0) 
    ? 0 
    : Math.min(100, (completedTasksCount * 20) + Math.round(realFocusMinutes / 2));

  // DASHBOARD
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

  // STATISTICS
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

  // NOTIFICATIONS
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

  // STUDY SESSIONS
  if (cleanPath === '/study-sessions') {
    if (method === 'POST') {
      const newSession = {
        id: `session-${Date.now()}`,
        ...body,
        durationMinutes: body.plannedMinutes || body.completedMinutes || 25,
        completed: false,
        createdAt: new Date().toISOString()
      };
      sessions.push(newSession);
      setStored(STORAGE_KEYS.SESSIONS, sessions);
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
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...updated };
    } else {
      sessions.push(updated);
    }
    setStored(STORAGE_KEYS.SESSIONS, sessions);
    return updated;
  }

  // ADMIN ENDPOINTS
  if (cleanPath === '/admin/verify-passcode') {
    const entered = body.passcode || '';
    if (entered === 'StudySync#*&Master2026!Admin') {
      return { valid: true, message: 'Admin passcode verified.' };
    }
    const err = new Error('Invalid administrator master passcode.');
    err.status = 401;
    throw err;
  }

  if (cleanPath === '/admin/system/stats') {
    return {
      totalUsers: Object.keys(usersMap).length || 1,
      activeUsers: Object.keys(usersMap).length || 1,
      totalTasks: tasks.length,
      completedTasks: completedTasksCount,
      totalNotes: notes.length,
      totalCategories: categories.length,
      totalSessions: sessions.length,
      usedMemoryMb: 92,
      totalMemoryMb: 512,
      serverStatus: 'ONLINE (RENDER DEPLOYED)',
      cloudEnvironment: 'RENDER_PRODUCTION_READY',
    };
  }

  if (cleanPath === '/admin/users') {
    const allUsers = Object.values(usersMap).filter((u) => u && u.email);
    return {
      content: allUsers.map((u, i) => ({
        id: u.id || `usr-${i + 1}`,
        name: u.name || 'User',
        email: u.email,
        role: u.role || 'USER',
        profilePictureUrl: u.profilePictureUrl || '',
        streakCount: u.streakCount || 0,
        createdAt: u.createdAt || new Date().toISOString(),
      })),
      totalPages: 1,
    };
  }

  if (cleanPath.startsWith('/admin/users/') && method === 'DELETE') {
    const uid = cleanPath.split('/')[3];
    delete usersMap[uid];
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
