import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, session, resolveImageUrl } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => session.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('studysync_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const logout = useCallback(() => {
    session.clear();
    setToken(null);
    setUser(null);
    setAdminUnlocked(false);
    try {
      sessionStorage.removeItem('studysync_admin_unlocked');
      localStorage.removeItem('studysync_demo_user');
      localStorage.removeItem('studysync_users_map');
      localStorage.removeItem('studysync-user-name');
    } catch {}
  }, []);

  const loadCurrentUser = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setLoading(false);
      return null;
    }
    try {
      setLoading(true);
      const userData = await api('/users/me', { token: activeToken });
      if (userData) {
        userData.profilePictureUrl = resolveImageUrl(userData.profilePictureUrl);
        const savedName = localStorage.getItem('studysync-user-name');
        if (savedName && (!userData.name || userData.name === 'Student')) {
          userData.name = savedName;
        }
        setUser(userData);
      }
      return userData;
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    if (token) {
      loadCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [loadCurrentUser, token]);

  const login = async (email, password) => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    session.set(res.token);
    setToken(res.token);
    if (res.name) {
      try {
        localStorage.setItem('studysync-user-name', res.name);
      } catch {}
    }
    const displayName = res.name || localStorage.getItem('studysync-user-name') || 'Student';
    const picUrl = resolveImageUrl(res.profilePictureUrl || '');
    const newUser = {
      id: res.userId,
      name: displayName,
      email: res.email,
      role: res.role || 'USER',
      profilePictureUrl: picUrl,
      darkMode: false,
      theme: 'violet',
    };
    setUser(newUser);
    if (res.role === 'ADMIN') {
      setAdminUnlocked(true);
      sessionStorage.setItem('studysync_admin_unlocked', 'true');
    }
    return res;
  };

  const register = async (name, email, password, profilePictureUrl) => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, profilePictureUrl }),
    });
    session.set(res.token);
    setToken(res.token);
    if (name) {
      try {
        localStorage.setItem('studysync-user-name', name);
      } catch {}
    }
    const newUser = {
      id: res.userId,
      name: name || res.name || 'Student',
      email: res.email,
      role: res.role || 'USER',
      profilePictureUrl: resolveImageUrl(profilePictureUrl || res.profilePictureUrl || ''),
      darkMode: false,
      theme: 'violet',
    };
    setUser(newUser);
    return res;
  };

  const updateProfile = async (updates) => {
    const payload = {
      name: updates.name ?? user?.name ?? 'Student',
      email: updates.email ?? user?.email ?? '',
      bio: updates.bio ?? user?.bio ?? '',
      dailyTargetHours: updates.dailyTargetHours ?? user?.dailyTargetHours ?? 4,
      profilePictureUrl: updates.profilePictureUrl ?? user?.profilePictureUrl ?? '',
      avatarBadge: updates.avatarBadge ?? user?.avatarBadge ?? '🎓',
      darkMode: updates.darkMode ?? user?.darkMode ?? false,
      theme: updates.theme ?? user?.theme ?? 'violet',
      defaultFocusMinutes: updates.defaultFocusMinutes ?? user?.defaultFocusMinutes ?? 25,
      enableReminders: updates.enableReminders ?? user?.enableReminders ?? true,
      soundEnabled: updates.soundEnabled ?? user?.soundEnabled ?? true,
    };

    const res = await api('/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    });

    if (updates.name) {
      try {
        localStorage.setItem('studysync-user-name', updates.name);
      } catch {}
    }

    const cleanPic = resolveImageUrl(res?.profilePictureUrl || payload.profilePictureUrl);
    const updatedUser = { ...user, ...payload, ...res, profilePictureUrl: cleanPic };
    setUser(updatedUser);
    try {
      localStorage.setItem('studysync_demo_user', JSON.stringify(updatedUser));
    } catch {}
    return updatedUser;
  };

  const unlockAdmin = (passcode) => {
    if (passcode === 'StudySync#*&Master2026!Admin') {
      setAdminUnlocked(true);
      try {
        sessionStorage.setItem('studysync_admin_unlocked', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        adminUnlocked,
        login,
        register,
        logout,
        updateProfile,
        unlockAdmin,
        reloadUser: () => loadCurrentUser(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
