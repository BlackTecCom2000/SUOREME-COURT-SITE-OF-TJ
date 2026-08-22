import Database from 'better-sqlite3';
import type { AuthRequest } from '../middleware/auth.js';

let _db: Database.Database;

export function setDb(db: Database.Database) {
  _db = db;
}

export function audit(
  req: AuthRequest,
  action: string,
  objectType: string,
  objectId?: number,
  objectTitle?: string,
  oldStatus?: string,
  newStatus?: string,
) {
  if (!_db) return;
  _db.prepare(
    `INSERT INTO audit_log(user_id,user_name,action,object_type,object_id,object_title,old_status,new_status,ip_address)
     VALUES(?,?,?,?,?,?,?,?,?)`
  ).run(
    req.user?.id ?? null,
    req.user?.name ?? null,
    action,
    objectType,
    objectId ?? null,
    objectTitle ?? null,
    oldStatus ?? null,
    newStatus ?? null,
    req.ip ?? null,
  );
}
