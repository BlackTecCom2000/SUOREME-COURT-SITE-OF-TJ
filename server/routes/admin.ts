import { Router } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { requireAuth, canManageUsers, canPublish, canManageCourts } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { audit } from '../db/audit.js';

const secret = process.env.CMS_JWT_SECRET || 'development-only-change-me';

export function adminRoutes(db: Database.Database) {
  const r = Router();

  // Apply auth to all /admin routes
  r.use(requireAuth as any);

  // ──────────────────────────────────────────────────────────────
  // AUTH
  // ──────────────────────────────────────────────────────────────
  r.post('/auth/login', (req, res) => {
    // Login is handled in public routes (no auth needed)
    res.status(405).json({ error: 'Use POST /api/auth/login' });
  });

  r.get('/auth/me', (req: AuthRequest, res) => {
    const user = db.prepare('SELECT id,name,email,role,avatar_url FROM users WHERE id=?').get(req.user!.id);
    res.json(user);
  });

  // ──────────────────────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────────────────────
  r.get('/dashboard', (req: AuthRequest, res) => {
    const news_total = (db.prepare("SELECT count(*) c FROM content WHERE type='news' AND deleted_at IS NULL").get() as any).c;
    const news_published = (db.prepare("SELECT count(*) c FROM content WHERE type='news' AND status='published' AND deleted_at IS NULL").get() as any).c;
    const news_draft = (db.prepare("SELECT count(*) c FROM content WHERE type='news' AND status='draft' AND deleted_at IS NULL").get() as any).c;
    const news_pending = (db.prepare("SELECT count(*) c FROM content WHERE status='pending' AND deleted_at IS NULL").get() as any).c;
    const acts_total = (db.prepare('SELECT count(*) c FROM judicial_acts WHERE deleted_at IS NULL').get() as any).c;
    const courts_total = (db.prepare('SELECT count(*) c FROM courts WHERE active=1').get() as any).c;
    const appeals_new = (db.prepare("SELECT count(*) c FROM appeals WHERE status='new'").get() as any).c;
    const appeals_total = (db.prepare('SELECT count(*) c FROM appeals').get() as any).c;
    const users_total = (db.prepare('SELECT count(*) c FROM users WHERE disabled=0').get() as any).c;
    const media_total = (db.prepare('SELECT count(*) c FROM media WHERE deleted_at IS NULL').get() as any).c;
    const activity = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 15').all();
    const recent_news = db.prepare("SELECT id,title_ru,status,published_at,updated_at FROM content WHERE type='news' AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5").all();
    const pending_appeals = db.prepare("SELECT id,ref_number,full_name,subject,created_at FROM appeals WHERE status='new' ORDER BY created_at DESC LIMIT 5").all();

    res.json({
      stats: { news_total, news_published, news_draft, news_pending, acts_total, courts_total, appeals_new, appeals_total, users_total, media_total },
      activity,
      recent_news,
      pending_appeals,
    });
  });

  // ──────────────────────────────────────────────────────────────
  // CONTENT (news, pages, articles, announcements)
  // ──────────────────────────────────────────────────────────────
  r.get('/content', (req: AuthRequest, res) => {
    const { type, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    let sql = `SELECT c.*,u.name as author_name FROM content c LEFT JOIN users u ON c.author_id=u.id WHERE c.deleted_at IS NULL`;
    const params: any[] = [];
    if (type) { sql += ` AND c.type=?`; params.push(type); }
    if (status) { sql += ` AND c.status=?`; params.push(status); }
    if (search) { sql += ` AND (c.title_ru LIKE ? OR c.title_tj LIKE ? OR c.slug LIKE ?)`; const s = `%${search}%`; params.push(s, s, s); }
    const total = (db.prepare(`SELECT count(*) c FROM content c WHERE c.deleted_at IS NULL${type ? ` AND c.type=?` : ''}${status ? ` AND c.status=?` : ''}`).get(...(type ? [type] : []), ...(status ? [status] : [])) as any).c;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    res.json({ items: db.prepare(sql).all(...params), total, page: parseInt(page), limit: parseInt(limit) });
  });

  r.get('/content/:id', (req: AuthRequest, res) => {
    const row = db.prepare('SELECT * FROM content WHERE id=? AND deleted_at IS NULL').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  const ContentSchema = z.object({
    type: z.enum(['news', 'page', 'article', 'announcement']),
    slug: z.string().regex(/^[a-z0-9-]+$/).min(2),
    title_ru: z.string().min(2),
    title_tj: z.string().optional(),
    title_en: z.string().optional(),
    excerpt_ru: z.string().optional(),
    excerpt_tj: z.string().optional(),
    excerpt_en: z.string().optional(),
    body_ru: z.string().optional(),
    body_tj: z.string().optional(),
    body_en: z.string().optional(),
    seo_title: z.string().optional(),
    seo_desc: z.string().optional(),
    cover_image: z.string().optional(),
    category: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['draft', 'pending', 'published', 'scheduled', 'archived']).default('draft'),
    scheduled_at: z.string().optional(),
  });

  r.post('/content', (req: AuthRequest, res) => {
    const p = ContentSchema.safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'Validation failed', details: p.error.flatten() });
    const d = p.data;
    const published_at = d.status === 'published' ? new Date().toISOString() : null;
    try {
      const result = db.prepare(
        `INSERT INTO content(type,slug,title_ru,title_tj,title_en,excerpt_ru,excerpt_tj,excerpt_en,
         body_ru,body_tj,body_en,seo_title,seo_desc,cover_image,category,featured,status,published_at,scheduled_at,author_id)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(d.type, d.slug, d.title_ru, d.title_tj||null, d.title_en||null, d.excerpt_ru||null, d.excerpt_tj||null, d.excerpt_en||null,
            d.body_ru||null, d.body_tj||null, d.body_en||null, d.seo_title||null, d.seo_desc||null, d.cover_image||null,
            d.category||null, d.featured?1:0, d.status, published_at, d.scheduled_at||null, req.user!.id);
      const id = Number(result.lastInsertRowid);
      // Save revision
      db.prepare(`INSERT INTO revisions(object_type,object_id,data_json,author_id,summary) VALUES(?,?,?,?,?)`)
        .run('content', id, JSON.stringify(d), req.user!.id, 'Created');
      audit(req, 'create', d.type, id, d.title_ru, undefined, d.status);
      res.status(201).json({ id });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Slug already exists' });
      throw e;
    }
  });

  r.patch('/content/:id', (req: AuthRequest, res) => {
    const existing = db.prepare('SELECT * FROM content WHERE id=? AND deleted_at IS NULL').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const allowed = ['title_ru','title_tj','title_en','excerpt_ru','excerpt_tj','excerpt_en',
      'body_ru','body_tj','body_en','seo_title','seo_desc','cover_image','category','featured',
      'status','scheduled_at','slug'];
    const updates: string[] = [];
    const values: any[] = [];
    for (const key of allowed) {
      if (key in req.body) { updates.push(`${key}=?`); values.push(req.body[key]); }
    }
    if (req.body.status === 'published' && existing.status !== 'published') {
      updates.push('published_at=CURRENT_TIMESTAMP');
    }
    updates.push('updated_at=CURRENT_TIMESTAMP');
    values.push(req.params.id);
    db.prepare(`UPDATE content SET ${updates.join(',')} WHERE id=?`).run(...values);
    db.prepare(`INSERT INTO revisions(object_type,object_id,data_json,author_id,summary) VALUES(?,?,?,?,?)`)
      .run('content', req.params.id, JSON.stringify(req.body), req.user!.id, `Updated status to ${req.body.status || existing.status}`);
    audit(req, 'update', existing.type, Number(req.params.id), existing.title_ru, existing.status, req.body.status);
    res.sendStatus(204);
  });

  r.delete('/content/:id', (req: AuthRequest, res) => {
    const existing = db.prepare('SELECT type,title_ru FROM content WHERE id=? AND deleted_at IS NULL').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE content SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id);
    audit(req, 'trash', existing.type, Number(req.params.id), existing.title_ru);
    res.sendStatus(204);
  });

  r.post('/content/:id/restore', (req: AuthRequest, res) => {
    db.prepare('UPDATE content SET deleted_at=NULL, status=? WHERE id=?').run('draft', req.params.id);
    audit(req, 'restore', 'content', Number(req.params.id));
    res.sendStatus(204);
  });

  r.post('/content/:id/duplicate', (req: AuthRequest, res) => {
    const src = db.prepare('SELECT * FROM content WHERE id=?').get(req.params.id) as any;
    if (!src) return res.status(404).json({ error: 'Not found' });
    const newSlug = src.slug + '-copy-' + Date.now();
    const result = db.prepare(
      `INSERT INTO content(type,slug,title_ru,title_tj,title_en,excerpt_ru,excerpt_tj,excerpt_en,body_ru,body_tj,body_en,category,status,author_id)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'draft',?)`
    ).run(src.type, newSlug, src.title_ru + ' (копия)', src.title_tj, src.title_en,
          src.excerpt_ru, src.excerpt_tj, src.excerpt_en, src.body_ru, src.body_tj, src.body_en, src.category, req.user!.id);
    audit(req, 'duplicate', src.type, Number(result.lastInsertRowid), src.title_ru);
    res.status(201).json({ id: result.lastInsertRowid, slug: newSlug });
  });

  r.get('/content/:id/revisions', (req: AuthRequest, res) => {
    const revisions = db.prepare(
      `SELECT r.*,u.name as author_name FROM revisions r LEFT JOIN users u ON r.author_id=u.id
       WHERE r.object_type='content' AND r.object_id=? ORDER BY r.created_at DESC`
    ).all(req.params.id);
    res.json(revisions);
  });

  r.post('/content/:id/revisions/:revId/restore', (req: AuthRequest, res) => {
    const rev = db.prepare('SELECT * FROM revisions WHERE id=?').get(req.params.revId) as any;
    if (!rev) return res.status(404).json({ error: 'Revision not found' });
    const data = JSON.parse(rev.data_json);
    db.prepare(
      `UPDATE content SET title_ru=?,title_tj=?,title_en=?,body_ru=?,body_tj=?,body_en=?,excerpt_ru=?,excerpt_tj=?,excerpt_en=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(data.title_ru, data.title_tj||null, data.title_en||null, data.body_ru||null, data.body_tj||null, data.body_en||null,
          data.excerpt_ru||null, data.excerpt_tj||null, data.excerpt_en||null, req.params.id);
    audit(req, 'restore_revision', 'content', Number(req.params.id));
    res.sendStatus(204);
  });

  // Trash
  r.get('/trash', (req: AuthRequest, res) => {
    const rows = db.prepare('SELECT id,type,slug,title_ru,status,deleted_at FROM content WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC').all();
    res.json(rows);
  });

  r.delete('/content/:id/permanent', (req: AuthRequest, res) => {
    db.prepare('DELETE FROM content WHERE id=?').run(req.params.id);
    audit(req, 'permanent_delete', 'content', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // JUDICIAL ACTS
  // ──────────────────────────────────────────────────────────────
  r.get('/judicial-acts', (req: AuthRequest, res) => {
    const { search, status, collegium, page = '1', limit = '20' } = req.query as Record<string, string>;
    let sql = `SELECT ja.*,c.name_ru as court_name FROM judicial_acts ja LEFT JOIN courts c ON ja.court_id=c.id WHERE ja.deleted_at IS NULL`;
    const params: any[] = [];
    if (search) { sql += ` AND (ja.title_ru LIKE ? OR ja.doc_number LIKE ?)`; const s = `%${search}%`; params.push(s, s); }
    if (status) { sql += ` AND ja.status=?`; params.push(status); }
    if (collegium) { sql += ` AND ja.collegium=?`; params.push(collegium); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` ORDER BY ja.act_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    res.json(db.prepare(sql).all(...params));
  });

  r.get('/judicial-acts/:id', (req: AuthRequest, res) => {
    const row = db.prepare('SELECT * FROM judicial_acts WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  r.post('/judicial-acts', (req: AuthRequest, res) => {
    const d = req.body;
    const result = db.prepare(
      `INSERT INTO judicial_acts(doc_number,doc_type,title_ru,title_tj,title_en,collegium,court_id,case_number,act_date,category,file_path,file_name,file_size,file_url,tags,keywords,status,author_id)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(d.doc_number||null, d.doc_type||'resolution', d.title_ru, d.title_tj||null, d.title_en||null,
          d.collegium||null, d.court_id||null, d.case_number||null, d.act_date||null, d.category||null,
          d.file_path||null, d.file_name||null, d.file_size||null, d.file_url||null,
          d.tags||null, d.keywords||null, d.status||'published', req.user!.id);
    audit(req, 'create', 'judicial_act', Number(result.lastInsertRowid), d.title_ru);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/judicial-acts/:id', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE judicial_acts SET doc_number=COALESCE(?,doc_number),title_ru=COALESCE(?,title_ru),title_tj=COALESCE(?,title_tj),
       title_en=COALESCE(?,title_en),doc_type=COALESCE(?,doc_type),collegium=COALESCE(?,collegium),
       act_date=COALESCE(?,act_date),category=COALESCE(?,category),tags=COALESCE(?,tags),status=COALESCE(?,status),updated_at=CURRENT_TIMESTAMP
       WHERE id=?`
    ).run(d.doc_number, d.title_ru, d.title_tj, d.title_en, d.doc_type, d.collegium, d.act_date, d.category, d.tags, d.status, req.params.id);
    audit(req, 'update', 'judicial_act', Number(req.params.id));
    res.sendStatus(204);
  });

  r.delete('/judicial-acts/:id', (req: AuthRequest, res) => {
    db.prepare('UPDATE judicial_acts SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id);
    audit(req, 'trash', 'judicial_act', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // REGIONS
  // ──────────────────────────────────────────────────────────────
  r.get('/regions', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM regions ORDER BY sort_order').all());
  });

  r.post('/regions', canManageCourts as any, (req: AuthRequest, res) => {
    const d = req.body;
    const result = db.prepare(
      `INSERT INTO regions(slug,name_ru,name_tj,name_en,short_ru,short_tj,color_hex,color_glow,description_ru,sort_order)
       VALUES(?,?,?,?,?,?,?,?,?,?)`
    ).run(d.slug, d.name_ru, d.name_tj||null, d.name_en||null, d.short_ru||null, d.short_tj||null,
          d.color_hex||'#b8966a', d.color_glow||'rgba(184,150,106,0.3)', d.description_ru||null, d.sort_order||0);
    audit(req, 'create', 'region', Number(result.lastInsertRowid), d.name_ru);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/regions/:id', canManageCourts as any, (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE regions SET name_ru=COALESCE(?,name_ru),name_tj=COALESCE(?,name_tj),name_en=COALESCE(?,name_en),
       short_ru=COALESCE(?,short_ru),color_hex=COALESCE(?,color_hex),description_ru=COALESCE(?,description_ru),
       sort_order=COALESCE(?,sort_order),active=COALESCE(?,active),updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(d.name_ru,d.name_tj,d.name_en,d.short_ru,d.color_hex,d.description_ru,d.sort_order,d.active,req.params.id);
    audit(req, 'update', 'region', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // COURTS
  // ──────────────────────────────────────────────────────────────
  r.get('/courts', (req: AuthRequest, res) => {
    const { search, region_id, type, page = '1', limit = '30' } = req.query as Record<string, string>;
    let sql = `SELECT c.*,r.name_ru as region_name FROM courts c LEFT JOIN regions r ON c.region_id=r.id WHERE 1=1`;
    const params: any[] = [];
    if (search) { sql += ` AND (c.name_ru LIKE ? OR c.address_ru LIKE ?)`; const s = `%${search}%`; params.push(s, s); }
    if (region_id) { sql += ` AND c.region_id=?`; params.push(region_id); }
    if (type) { sql += ` AND c.court_type=?`; params.push(type); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` ORDER BY c.region_id,c.name_ru LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    res.json(db.prepare(sql).all(...params));
  });

  r.get('/courts/:id', (req: AuthRequest, res) => {
    const row = db.prepare('SELECT * FROM courts WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  r.post('/courts', canManageCourts as any, (req: AuthRequest, res) => {
    const d = req.body;
    const result = db.prepare(
      `INSERT INTO courts(slug,name_ru,name_tj,name_en,short_ru,short_tj,region_id,court_type,city_ru,city_tj,
       address_ru,address_tj,phone,email,website,domain,latitude,longitude,status,is_military,svg_x,svg_y)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(d.slug, d.name_ru, d.name_tj||null, d.name_en||null, d.short_ru||null, d.short_tj||null,
          d.region_id||null, d.court_type||'district', d.city_ru||null, d.city_tj||null,
          d.address_ru||null, d.address_tj||null, d.phone||null, d.email||null,
          d.website||null, d.domain||null, d.latitude||null, d.longitude||null,
          d.status||'normal', d.is_military?1:0, d.svg_x||null, d.svg_y||null);
    audit(req, 'create', 'court', Number(result.lastInsertRowid), d.name_ru);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/courts/:id', canManageCourts as any, (req: AuthRequest, res) => {
    const d = req.body;
    const allowed = ['name_ru','name_tj','name_en','short_ru','short_tj','region_id','court_type','city_ru','city_tj',
      'address_ru','address_tj','phone','email','website','domain','latitude','longitude','status','is_military','active','svg_x','svg_y'];
    const updates: string[] = [];
    const values: any[] = [];
    for (const key of allowed) {
      if (key in d) { updates.push(`${key}=?`); values.push(d[key]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at=CURRENT_TIMESTAMP');
    values.push(req.params.id);
    db.prepare(`UPDATE courts SET ${updates.join(',')} WHERE id=?`).run(...values);
    audit(req, 'update', 'court', Number(req.params.id));
    res.sendStatus(204);
  });

  r.delete('/courts/:id', canManageCourts as any, (req: AuthRequest, res) => {
    db.prepare('UPDATE courts SET active=0 WHERE id=?').run(req.params.id);
    audit(req, 'deactivate', 'court', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // ANNOUNCEMENTS
  // ──────────────────────────────────────────────────────────────
  r.get('/announcements', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM announcements WHERE deleted_at IS NULL ORDER BY created_at DESC').all());
  });

  r.post('/announcements', (req: AuthRequest, res) => {
    const d = req.body;
    const result = db.prepare(
      `INSERT INTO announcements(title_ru,title_tj,title_en,body_ru,body_tj,body_en,priority,important,active,expires_at,author_id)
       VALUES(?,?,?,?,?,?,?,?,?,?,?)`
    ).run(d.title_ru, d.title_tj||null, d.title_en||null, d.body_ru||null, d.body_tj||null, d.body_en||null,
          d.priority||0, d.important?1:0, d.active!==false?1:0, d.expires_at||null, req.user!.id);
    audit(req, 'create', 'announcement', Number(result.lastInsertRowid), d.title_ru);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/announcements/:id', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE announcements SET title_ru=COALESCE(?,title_ru),title_tj=COALESCE(?,title_tj),body_ru=COALESCE(?,body_ru),
       active=COALESCE(?,active),important=COALESCE(?,important),priority=COALESCE(?,priority),updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(d.title_ru,d.title_tj,d.body_ru,d.active,d.important,d.priority,req.params.id);
    audit(req, 'update', 'announcement', Number(req.params.id));
    res.sendStatus(204);
  });

  r.delete('/announcements/:id', (req: AuthRequest, res) => {
    db.prepare('UPDATE announcements SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id);
    audit(req, 'trash', 'announcement', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // APPEALS
  // ──────────────────────────────────────────────────────────────
  r.get('/appeals', (req: AuthRequest, res) => {
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    let sql = `SELECT a.*,u.name as assigned_name FROM appeals a LEFT JOIN users u ON a.assigned_to=u.id WHERE 1=1`;
    const params: any[] = [];
    if (status) { sql += ` AND a.status=?`; params.push(status); }
    if (search) { sql += ` AND (a.full_name LIKE ? OR a.subject LIKE ? OR a.ref_number LIKE ?)`; const s = `%${search}%`; params.push(s, s, s); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    res.json(db.prepare(sql).all(...params));
  });

  r.get('/appeals/:id', (req: AuthRequest, res) => {
    const row = db.prepare('SELECT * FROM appeals WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  r.patch('/appeals/:id', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE appeals SET status=COALESCE(?,status),assigned_to=COALESCE(?,assigned_to),internal_note=COALESCE(?,internal_note),updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(d.status, d.assigned_to, d.internal_note, req.params.id);
    audit(req, 'update', 'appeal', Number(req.params.id), undefined, undefined, d.status);
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // MEDIA
  // ──────────────────────────────────────────────────────────────
  r.get('/media', (req: AuthRequest, res) => {
    const { search, category, mime, page = '1', limit = '24' } = req.query as Record<string, string>;
    let sql = `SELECT m.*,u.name as uploader_name FROM media m LEFT JOIN users u ON m.uploader_id=u.id WHERE m.deleted_at IS NULL`;
    const params: any[] = [];
    if (search) { sql += ` AND (m.original_name LIKE ? OR m.title LIKE ?)`; const s = `%${search}%`; params.push(s, s); }
    if (category) { sql += ` AND m.category=?`; params.push(category); }
    if (mime) { sql += ` AND m.mime_type LIKE ?`; params.push(`${mime}%`); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    res.json(db.prepare(sql).all(...params));
  });

  r.patch('/media/:id', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE media SET alt_text=COALESCE(?,alt_text),caption=COALESCE(?,caption),title=COALESCE(?,title),description=COALESCE(?,description),category=COALESCE(?,category) WHERE id=?`
    ).run(d.alt_text, d.caption, d.title, d.description, d.category, req.params.id);
    res.sendStatus(204);
  });

  r.delete('/media/:id', (req: AuthRequest, res) => {
    db.prepare('UPDATE media SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id);
    audit(req, 'delete', 'media', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // MENUS
  // ──────────────────────────────────────────────────────────────
  r.get('/menus', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM menus').all());
  });

  r.get('/menus/:slug', (req: AuthRequest, res) => {
    const menu = db.prepare('SELECT * FROM menus WHERE slug=?').get(req.params.slug) as any;
    if (!menu) return res.status(404).json({ error: 'Not found' });
    const items = db.prepare('SELECT * FROM menu_items WHERE menu_id=? ORDER BY sort_order').all(menu.id);
    res.json({ ...menu, items });
  });

  r.put('/menus/:slug/items', (req: AuthRequest, res) => {
    const menu = db.prepare('SELECT * FROM menus WHERE slug=?').get(req.params.slug) as any;
    if (!menu) return res.status(404).json({ error: 'Not found' });
    const items: any[] = req.body.items || [];
    const del = db.prepare('DELETE FROM menu_items WHERE menu_id=?');
    const ins = db.prepare(
      `INSERT INTO menu_items(menu_id,parent_id,label_ru,label_tj,label_en,url,page_slug,target,visible,sort_order)
       VALUES(?,?,?,?,?,?,?,?,?,?)`
    );
    db.transaction(() => {
      del.run(menu.id);
      items.forEach((item, i) => {
        ins.run(menu.id, item.parent_id||null, item.label_ru, item.label_tj||null, item.label_en||null,
                item.url||null, item.page_slug||null, item.target||'_self', item.visible!==false?1:0, i);
      });
    })();
    audit(req, 'update', 'menu', menu.id, menu.name);
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // HOMEPAGE SECTIONS
  // ──────────────────────────────────────────────────────────────
  r.get('/homepage', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM homepage_sections ORDER BY sort_order').all());
  });

  r.patch('/homepage/:key', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE homepage_sections SET title_ru=COALESCE(?,title_ru),title_tj=COALESCE(?,title_tj),title_en=COALESCE(?,title_en),
       content_json=COALESCE(?,content_json),visible=COALESCE(?,visible),sort_order=COALESCE(?,sort_order),updated_at=CURRENT_TIMESTAMP
       WHERE section_key=?`
    ).run(d.title_ru,d.title_tj,d.title_en,d.content_json,d.visible,d.sort_order,req.params.key);
    audit(req, 'update', 'homepage_section', undefined, String(req.params.key));
    res.sendStatus(204);
  });

  r.put('/homepage/order', (req: AuthRequest, res) => {
    const order: { key: string; sort_order: number }[] = req.body.order || [];
    const stmt = db.prepare('UPDATE homepage_sections SET sort_order=? WHERE section_key=?');
    db.transaction(() => { order.forEach(o => stmt.run(o.sort_order, o.key)); })();
    audit(req, 'reorder', 'homepage_sections');
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // CONTACTS
  // ──────────────────────────────────────────────────────────────
  r.get('/contacts', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM contact_info').all());
  });

  r.put('/contacts', (req: AuthRequest, res) => {
    const entries: any[] = req.body.entries || [];
    const upsert = db.prepare(
      `INSERT INTO contact_info(key,value_ru,value_tj,value_en,updated_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value_ru=excluded.value_ru,value_tj=excluded.value_tj,value_en=excluded.value_en,updated_at=CURRENT_TIMESTAMP`
    );
    db.transaction(() => entries.forEach(e => upsert.run(e.key, e.value_ru||null, e.value_tj||null, e.value_en||null)))();
    audit(req, 'update', 'contacts');
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // RECEPTION SCHEDULE
  // ──────────────────────────────────────────────────────────────
  r.get('/reception', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM reception_schedule ORDER BY sort_order').all());
  });

  r.post('/reception', (req: AuthRequest, res) => {
    const d = req.body;
    const result = db.prepare(
      `INSERT INTO reception_schedule(official_ru,official_tj,position_ru,position_tj,days_ru,days_tj,time_range,method_ru,method_tj,sort_order)
       VALUES(?,?,?,?,?,?,?,?,?,?)`
    ).run(d.official_ru, d.official_tj||null, d.position_ru||null, d.position_tj||null, d.days_ru||null, d.days_tj||null,
          d.time_range||null, d.method_ru||null, d.method_tj||null, d.sort_order||0);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/reception/:id', (req: AuthRequest, res) => {
    const d = req.body;
    db.prepare(
      `UPDATE reception_schedule SET official_ru=COALESCE(?,official_ru),official_tj=COALESCE(?,official_tj),
       position_ru=COALESCE(?,position_ru),days_ru=COALESCE(?,days_ru),time_range=COALESCE(?,time_range),
       active=COALESCE(?,active),sort_order=COALESCE(?,sort_order),updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(d.official_ru,d.official_tj,d.position_ru,d.days_ru,d.time_range,d.active,d.sort_order,req.params.id);
    res.sendStatus(204);
  });

  r.delete('/reception/:id', (req: AuthRequest, res) => {
    db.prepare('DELETE FROM reception_schedule WHERE id=?').run(req.params.id);
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // SITE SETTINGS
  // ──────────────────────────────────────────────────────────────
  r.get('/settings', (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT * FROM site_settings ORDER BY group_name,key').all());
  });

  r.put('/settings', (req: AuthRequest, res) => {
    const settings: any[] = req.body.settings || [];
    const upsert = db.prepare(
      `INSERT INTO site_settings(key,value,label,type,group_name,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`
    );
    db.transaction(() => settings.forEach(s => upsert.run(s.key, s.value, s.label||null, s.type||'text', s.group||'general')))();
    audit(req, 'update', 'settings');
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────────────────────
  r.get('/users', canManageUsers as any, (req: AuthRequest, res) => {
    res.json(db.prepare('SELECT id,name,email,role,disabled,last_login,created_at FROM users ORDER BY created_at DESC').all());
  });

  r.post('/users', canManageUsers as any, (req: AuthRequest, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)').run(name, email, hash, role||'editor');
    audit(req, 'create', 'user', Number(result.lastInsertRowid), name);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  r.patch('/users/:id', canManageUsers as any, (req: AuthRequest, res) => {
    const d = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    if (d.name) { updates.push('name=?'); values.push(d.name); }
    if (d.role) { updates.push('role=?'); values.push(d.role); }
    if (d.disabled !== undefined) { updates.push('disabled=?'); values.push(d.disabled ? 1 : 0); }
    if (d.password) { updates.push('password_hash=?'); values.push(bcrypt.hashSync(d.password, 12)); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(req.params.id);
    db.prepare(`UPDATE users SET ${updates.join(',')} WHERE id=?`).run(...values);
    audit(req, 'update', 'user', Number(req.params.id));
    res.sendStatus(204);
  });

  r.delete('/users/:id', canManageUsers as any, (req: AuthRequest, res) => {
    if (Number(req.params.id) === req.user!.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    db.prepare('UPDATE users SET disabled=1 WHERE id=?').run(req.params.id);
    audit(req, 'disable', 'user', Number(req.params.id));
    res.sendStatus(204);
  });

  // ──────────────────────────────────────────────────────────────
  // AUDIT LOG
  // ──────────────────────────────────────────────────────────────
  r.get('/audit', (req: AuthRequest, res) => {
    const { page = '1', limit = '50', objectType } = req.query as Record<string, string>;
    let sql = 'SELECT a.*,u.name as user_name FROM audit_log a LEFT JOIN users u ON a.user_id=u.id WHERE 1=1';
    const params: any[] = [];
    if (objectType) { sql += ' AND a.object_type=?'; params.push(objectType); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    res.json(db.prepare(sql).all(...params));
  });

  // ──────────────────────────────────────────────────────────────
  // SYSTEM STATUS
  // ──────────────────────────────────────────────────────────────
  r.get('/system/status', (req: AuthRequest, res) => {
    const dbOk = !!db.prepare('SELECT 1').get();
    res.json({
      api: { status: 'ok' },
      database: { status: dbOk ? 'ok' : 'error' },
      storage: { status: 'ok' },
      scheduler: { status: 'ok' },
      uptime: process.uptime(),
      node: process.version,
      memory: process.memoryUsage(),
    });
  });

  return r;
}
