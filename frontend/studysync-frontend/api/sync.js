// Vercel Serverless Real-Time Cloud Sync Function
let globalUsersRegistry = {
  "ravindrachavan265125@gmail.com": {
    id: "usr_chavan",
    name: "Chavan Ravindra",
    email: "ravindrachavan265125@gmail.com",
    role: "USER",
    streakCount: 0,
    avatarBadge: "🎓",
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

  // GET: Retrieve single user data OR all users
  if (req.method === 'GET') {
    if (emailParam && globalUsersRegistry[emailParam]) {
      return res.status(200).json({ user: globalUsersRegistry[emailParam] });
    }
    return res.status(200).json({ users: globalUsersRegistry });
  }

  // POST / PUT: Save / update user profile, photo, tasks, notes, etc.
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    
    if (body.users && typeof body.users === 'object') {
      globalUsersRegistry = { ...globalUsersRegistry, ...body.users };
      return res.status(200).json({ success: true, users: globalUsersRegistry });
    }

    const emailKey = (body.email || emailParam || '').toLowerCase().trim();
    if (emailKey) {
      const existing = globalUsersRegistry[emailKey] || {};
      globalUsersRegistry[emailKey] = {
        ...existing,
        ...body,
        email: emailKey,
        name: body.name || existing.name || 'Student',
        profilePictureUrl: body.profilePictureUrl !== undefined ? body.profilePictureUrl : (existing.profilePictureUrl || ''),
        avatarBadge: body.avatarBadge || existing.avatarBadge || '🎓',
        tasks: body.tasks !== undefined ? body.tasks : (existing.tasks || []),
        notes: body.notes !== undefined ? body.notes : (existing.notes || []),
        subjects: body.subjects !== undefined ? body.subjects : (existing.subjects || []),
        categories: body.categories !== undefined ? body.categories : (existing.categories || []),
        sessions: body.sessions !== undefined ? body.sessions : (existing.sessions || []),
        updatedAt: new Date().toISOString(),
      };
      return res.status(200).json({ success: true, user: globalUsersRegistry[emailKey], users: globalUsersRegistry });
    }

    return res.status(400).json({ error: 'Email is required' });
  }

  // DELETE: Delete user account or reset
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
