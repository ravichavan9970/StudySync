// Vercel Serverless Real-Time Cloud Sync Function
let globalUsersRegistry = {
  "ravindrachavan265125@gmail.com": {
    id: "usr_chavan",
    name: "Chavan Ravindra",
    email: "ravindrachavan265125@gmail.com",
    role: "USER",
    streakCount: 0,
    avatarBadge: "🎓",
    createdAt: new Date().toISOString()
  },
  "shri66@gmail.com": {
    id: "usr_shrikant",
    name: "Shrikant",
    email: "shri66@gmail.com",
    role: "USER",
    streakCount: 0,
    avatarBadge: "🎓",
    createdAt: new Date().toISOString()
  }
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Passcode');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ users: globalUsersRegistry });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (body.users && typeof body.users === 'object') {
      globalUsersRegistry = { ...globalUsersRegistry, ...body.users };
    } else if (body.email) {
      const emailKey = body.email.toLowerCase().trim();
      globalUsersRegistry[emailKey] = {
        ...(globalUsersRegistry[emailKey] || {}),
        ...body,
        email: emailKey,
      };
    }
    return res.status(200).json({ success: true, users: globalUsersRegistry });
  }

  if (req.method === 'DELETE') {
    const query = req.query || {};
    if (query.all === 'true') {
      globalUsersRegistry = {};
    } else if (query.email) {
      delete globalUsersRegistry[query.email.toLowerCase().trim()];
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
