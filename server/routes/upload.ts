import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { audit } from '../db/audit.js';

const ALLOWED_MIME = new Set([
  'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4','video/webm',
]);

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function uploadRoutes(db: Database.Database, uploadsDir: string) {
  const r = Router();
  r.use(requireAuth as any);

  const storage = multer.diskStorage({
    destination: (req: any, _file, cb) => {
      const sub = req.query.category || 'misc';
      const dir = path.join(uploadsDir, sub as string);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
      else cb(new Error(`File type not allowed: ${file.mimetype}`));
    },
  });

  r.post('/upload', upload.single('file'), (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const f = req.file;
    const category = (req.query.category as string) || 'misc';
    const relPath = `/uploads/${category}/${f.filename}`;

    const result = db.prepare(
      `INSERT INTO media(file_name,original_name,file_path,file_url,mime_type,file_size,alt_text,category,uploader_id)
       VALUES(?,?,?,?,?,?,?,?,?)`
    ).run(f.filename, f.originalname, f.path, relPath, f.mimetype, f.size, req.body.alt_text||null, category, req.user!.id);

    audit(req, 'upload', 'media', Number(result.lastInsertRowid), f.originalname);

    res.status(201).json({
      id: result.lastInsertRowid,
      url: relPath,
      file_name: f.filename,
      original_name: f.originalname,
      mime_type: f.mimetype,
      file_size: f.size,
    });
  });

  r.post('/upload/multiple', upload.array('files', 20), (req: AuthRequest, res) => {
    if (!req.files || !Array.isArray(req.files)) return res.status(400).json({ error: 'No files' });
    const category = (req.query.category as string) || 'misc';
    const results = (req.files as Express.Multer.File[]).map(f => {
      const relPath = `/uploads/${category}/${f.filename}`;
      const result = db.prepare(
        `INSERT INTO media(file_name,original_name,file_path,file_url,mime_type,file_size,category,uploader_id) VALUES(?,?,?,?,?,?,?,?)`
      ).run(f.filename, f.originalname, f.path, relPath, f.mimetype, f.size, category, req.user!.id);
      return { id: result.lastInsertRowid, url: relPath, file_name: f.filename, mime_type: f.mimetype, file_size: f.size };
    });
    res.status(201).json(results);
  });

  return r;
}
