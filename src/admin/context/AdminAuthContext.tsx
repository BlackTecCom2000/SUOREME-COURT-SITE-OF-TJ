import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role:
    | 'super_admin'
    | 'admin'
    | 'administrator'
    | 'editor'
    | 'publisher'
    | 'court_manager'
    | 'content_manager'
    | 'reviewer'
    | 'viewer';
  site_id?: string | null;
  avatar_url?: string;
  // Server-issued permission list (GET /api/admin/auth/me). Never trust client input.
  permissions?: string[];
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  hasPerm: (perm: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('cms-token'));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const cached = sessionStorage.getItem('cms-user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const login = (newToken: string, newUser: AdminUser) => {
    sessionStorage.setItem('cms-token', newToken);
    sessionStorage.setItem('cms-user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // Pull server-issued permissions immediately (backend is source of truth).
    fetch('/api/admin/auth/me', { headers: { Authorization: `Bearer ${newToken}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((full) => {
        if (full && Array.isArray(full.permissions)) {
          const merged = { ...newUser, permissions: full.permissions };
          sessionStorage.setItem('cms-user', JSON.stringify(merged));
          setUser(merged);
        }
      })
      .catch(() => undefined);
  };

  const logout = () => {
    sessionStorage.removeItem('cms-token');
    sessionStorage.removeItem('cms-user');
    setToken(null);
    setUser(null);
  };

  // Verify auth validity on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetch('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then((userData) => {
          setUser(userData);
          sessionStorage.setItem('cms-user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  // SEC-01: frontend mirror of the server permission matrix (visibility only —
  // the backend middleware is the source of truth).
  const hasPerm = (perm: string): boolean => {
    const perms = user?.permissions;
    if (Array.isArray(perms)) return perms.includes(perm) || perms.includes('*');
    // Fallback for cached sessions without permissions: derive from known role sets.
    const role = user?.role || '';
    if (role === 'super_admin') return true;
    if (role === 'admin' || role === 'administrator') return perm !== 'users.manage';
    if (role === 'reviewer') return perm === 'content.review';
    if (role === 'viewer') return false;
    return ['content.create', 'content.edit', 'library.manage', 'acts.manage', 'media.manage'].includes(perm);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        hasPerm,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
