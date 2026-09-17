import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'administrator' | 'editor' | 'publisher' | 'court_manager' | 'viewer';
  site_id?: string | null;
  avatar_url?: string;
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
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

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
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
