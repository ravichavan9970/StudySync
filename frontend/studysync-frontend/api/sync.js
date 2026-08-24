// StudySync Global Edge Real-Time Cloud Sync Engine
// Handles multi-device state synchronization across Mobile, Laptop, and Tablets

let globalUsersRegistry = {
  "ravindrachavan265125@gmail.com": {
    id: "usr_chavan",
    name: "Chavan Ravindra",
    email: "ravindrachavan265125@gmail.com",
    role: "USER",
    streakCount: 0,
    avatarBadge: "🎓",
    darkMode: false,
    theme: "violet",
    dailyTargetHours: 4,
    defaultFocusMinutes: 25,
    createdAt: new Date().toISOString(),
    tasks: [],
    notes: [],
    subjects: [],
    categories: [],
    sessions: []
  },
  "shri66@gmail.com": {
    id: "usr_shrikant",
    name: "Shrikant",
    email: "shri66@gmail.com",
    role: "USER",
    streakCount: 0,
    avatarBadge: "🎓",
    darkMode: false,
    theme: "violet",
    dailyTargetHours: 4,
    defaultFocusMinutes: 25,
    createdAt: new Date().toISOString(),
    tasks: [],
    notes: [],
    subjects: [],
    categories: [],
    sessions: []
  }
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Passcode');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const emailParam = (query.email || '').toLowerCase().trim();

  // 1. GET Requests
  if (req.method === 'GET') {
    // If stats requested for Admin
    if (query.stats === 'true') {
      const userList = Object.values(globalUsersRegistry);
      let totalTasks = 0;
      let totalNotes = 0;
      let totalSessions = 0;

      userList.forEach((u) => {
        totalTasks += Array.isArray(u.tasks) ? u.tasks.length : 0;
        totalNotes += Array.isArray(u.notes) ? u.notes.length : 0;
        totalSessions += Array.isArray(u.sessions) ? u.sessions.length : 0;
      });

      return res.status(200).json({
        totalUsers: userList.length,
        activeUsers: userList.length,
        totalTasks,
        totalNotes,
        totalSessions,
        serverStatus: 'ONLINE',
      });
    }

    // If specific user data requested
    if (emailParam && globalUsersRegistry[emailParam]) {
      return res.status(200).json({ user: globalUsersRegistry[emailParam] });
    }

    // Default: return all registered accounts
    return res.status(200).json({ users: globalUsersRegistry });
  }

  // 2. POST / PUT: Real-time Cloud Sync from any device
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // Batch registry update
    if (body.users && typeof body.users === 'object') {
      globalUsersRegistry = { ...globalUsersRegistry, ...body.users };
      return res.status(200).json({ success: true, users: globalUsersRegistry });
    }

    const emailKey = (body.email || emailParam || '').toLowerCase().trim();
    if (emailKey) {
      const existing = globalUsersRegistry[emailKey] || {};
      const updatedUser = {
        ...existing,
        ...body,
        id: body.id || existing.id || `usr_${Date.now()}`,
        email: emailKey,
        name: body.name || existing.name || 'Student',
        role: body.role || existing.role || 'USER',
        profilePictureUrl: body.profilePictureUrl !== undefined ? body.profilePictureUrl : (existing.profilePictureUrl || ''),
        avatarBadge: body.avatarBadge || existing.avatarBadge || '🎓',
        darkMode: body.darkMode !== undefined ? Boolean(body.darkMode) : Boolean(existing.darkMode),
        theme: body.theme || existing.theme || 'violet',
        dailyTargetHours: Number(body.dailyTargetHours || existing.dailyTargetHours || 4),
        defaultFocusMinutes: Number(body.defaultFocusMinutes || existing.defaultFocusMinutes || 25),
        streakCount: body.streakCount !== undefined ? Number(body.streakCount) : (existing.streakCount || 0),
        tasks: Array.isArray(body.tasks) ? body.tasks : (existing.tasks || []),
        notes: Array.isArray(body.notes) ? body.notes : (existing.notes || []),
        subjects: Array.isArray(body.subjects) ? body.subjects : (existing.subjects || []),
        categories: Array.isArray(body.categories) ? body.categories : (existing.categories || []),
        sessions: Array.isArray(body.sessions) ? body.sessions : (existing.sessions || []),
        lastSyncedAt: new Date().toISOString(),
      };

      globalUsersRegistry[emailKey] = updatedUser;
      return res.status(200).json({
        success: true,
        user: updatedUser,
        users: globalUsersRegistry,
      });
    }

    return res.status(400).json({ error: 'Email is required for synchronization' });
  }

  // 3. DELETE: User removal & database resets
  if (req.method === 'DELETE') {
    if (query.all === 'true') {
      globalUsersRegistry = {};
    } else if (emailParam) {
      delete globalUsersRegistry[emailParam];
    } else if (query.id) {
      Object.keys(globalUsersRegistry).forEach((k) => {
        if (globalUsersRegistry[k]?.id === query.id || k === query.id) {
          delete globalUsersRegistry[k];
        }
      });
    }
    return res.status(200).json({ success: true, users: globalUsersRegistry });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

