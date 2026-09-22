import express from 'express';

// SEC-01: real server-side RBAC. Role NEVER comes from the client —
// it is read from the DB-backed session ((req as any).scoped, set by auth).
// DB CHECK currently allows super_admin|admin|editor|reviewer; the matrix
// below is forward-compatible with the extended role set.

export type Role =
  | 'super_admin'
  | 'admin'
  | 'administrator'
  | 'publisher'
  | 'court_manager'
  | 'content_manager'
  | 'editor'
  | 'reviewer'
  | 'viewer';

export type Permission =
  | 'content.create'
  | 'content.edit'
  | 'content.review'
  | 'content.approve'
  | 'content.publish'
  | 'content.delete'
  | 'library.manage'
  | 'acts.manage'
  | 'hearings.manage'
  | 'leadership.manage'
  | 'courts.manage'
  | 'appeals.manage'
  | 'media.manage'
  | 'users.manage'
  | 'settings.manage'
  | 'duty.manage'
  | 'ai.manage';

const ALL: Permission[] = [
  'content.create',
  'content.edit',
  'content.review',
  'content.approve',
  'content.publish',
  'content.delete',
  'library.manage',
  'acts.manage',
  'hearings.manage',
  'leadership.manage',
  'courts.manage',
  'appeals.manage',
  'media.manage',
  'users.manage',
  'settings.manage',
  'duty.manage',
  'ai.manage',
];

const NO_USERS = ALL.filter((p) => p !== 'users.manage');

// Permission matrix (documented in Project_Snapshot: SEC-01).
export const ROLE_PERMS: Record<Role, Permission[]> = {
  super_admin: ALL,
  admin: NO_USERS,
  administrator: NO_USERS, // legacy alias of admin
  publisher: [
    'content.create',
    'content.edit',
    'content.review',
    'content.approve',
    'content.publish',
    'library.manage',
    'acts.manage',
    'media.manage',
  ],
  content_manager: [
    'content.create',
    'content.edit',
    'content.review',
    'content.approve',
    'library.manage',
    'acts.manage',
    'hearings.manage',
    'leadership.manage',
    'appeals.manage',
    'media.manage',
  ],
  editor: ['content.create', 'content.edit', 'library.manage', 'acts.manage', 'media.manage'],
  reviewer: ['content.review'],
  court_manager: ['content.create', 'content.edit'],
  viewer: [],
};

export function permissionsFor(role: string): Permission[] {
  if (role === 'super_admin') return ALL;
  return ROLE_PERMS[role as Role] ?? [];
}

export function hasPerm(role: string | undefined, perm: Permission): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  return (ROLE_PERMS[role as Role] ?? []).includes(perm);
}

export function roleOf(req: express.Request): string | undefined {
  return (req as any).scoped?.role ?? (req as any).user?.role;
}

// 403 when the server-side role lacks the permission.
export function requirePerm(perm: Permission) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!hasPerm(roleOf(req), perm)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Content lifecycle (CMS-01): which permission a target status requires.
// DRAFT -> REVIEW(submit) -> APPROVED -> PUBLISHED, REJECTED -> DRAFT(rework).
export type ReviewAction = 'submit' | 'approve' | 'publish' | 'reject' | 'rework' | 'edit';

export function permForContentStatus(
  target: string,
  hasEdit: boolean,
  hasReview: boolean
): { perm: Permission; action: ReviewAction } | { error: string } {
  switch (target) {
    case 'published':
    case 'scheduled':
      return { perm: 'content.publish', action: 'publish' };
    case 'approved':
    case 'archived':
      return { perm: 'content.approve', action: 'approve' };
    case 'pending_review':
      // author submits own draft (edit) or reviewer re-queues (review)
      if (hasEdit || hasReview) return { perm: hasEdit ? 'content.edit' : 'content.review', action: 'submit' };
      return { error: 'Forbidden' };
    case 'rejected':
      if (!hasReview) return { error: 'Forbidden' };
      return { perm: 'content.review', action: 'reject' };
    case 'draft':
      // rework after rejection: author (edit) or reviewer (review)
      if (hasEdit || hasReview) return { perm: hasEdit ? 'content.edit' : 'content.review', action: 'rework' };
      return { error: 'Forbidden' };
    default:
      return { error: 'Invalid status' };
  }
}
