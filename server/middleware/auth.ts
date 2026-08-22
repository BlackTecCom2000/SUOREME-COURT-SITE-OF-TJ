import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: number; role: string; name?: string };
}

const secret = process.env.CMS_JWT_SECRET || 'development-only-change-me';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  PUBLISHER: 'publisher',
  COURT_MANAGER: 'court_manager',
  CONTENT_MANAGER: 'content_manager',
  VIEWER: 'viewer',
} as const;

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  publisher: 60,
  court_manager: 50,
  content_manager: 40,
  editor: 30,
  viewer: 10,
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, secret) as { id: number; role: string };
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const minRequired = Math.min(...roles.map(r => ROLE_HIERARCHY[r] ?? 999));
    if (userLevel < minRequired) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

export function canPublish(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole('publisher', 'admin', 'super_admin')(req, res, next);
}

export function canManageUsers(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole('admin', 'super_admin')(req, res, next);
}

export function canManageCourts(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole('court_manager', 'admin', 'super_admin')(req, res, next);
}
