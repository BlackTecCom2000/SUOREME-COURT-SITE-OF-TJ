import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPerm: (perm: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// SEC-05: the JWT lives ONLY in the httpOnly `cms_token` cookie (set by the
// server on login, sent automatically with credentials:include). Nothing
// auth-related is kept in sessionStorage/localStorage anymore.
export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  // Boot: restore session from the cookie (survives reload without JS storage).
  useEffect(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData && userData.id) setUser(userData);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const me = await fetch('/api/admin/auth/me', { credentials: 'include' });
    if (!me.ok) throw new Error('Invalid credentials');
    setUser(await me.json());
  }, []);

  const logout = useCallback(() => {
    fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    setUser(null);
  }, []);

  // SEC-01: frontend mirror of the server permission matrix (visibility only —
  // the backend middleware is the source of truth).
  const hasPerm = (perm: string): boolean => {
    const perms = user?.permissions;
    if (Array.isArray(perms)) return perms.includes(perm) || perms.includes('*');
    // Fallback before /me resolves.
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
        token: null,
        user,
        isAuthenticated: ready && !!user,
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
