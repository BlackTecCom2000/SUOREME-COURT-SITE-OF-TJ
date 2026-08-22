import { Router } from 'express';
import Database from 'better-sqlite3';

export function publicRoutes(db: Database.Database) {
  const r = Router();

  // ── Health ──────────────────────────────
  r.get('/health', (_req, res) => {
    res.json({ api: 'ok', database: 'ok', storage: 'ok', ts: new Date().toISOString() });
  });

  // ── News ────────────────────────────────
  r.get('/news', (_req, res) => {
    const rows = db.prepare(
      `SELECT id,slug,title_ru,title_tj,title_en,excerpt_ru,excerpt_tj,excerpt_en,
              cover_image,category,published_at,featured
       FROM content WHERE type='news' AND status='published' AND deleted_at IS NULL
       ORDER BY published_at DESC LIMIT 50`
    ).all();
    res.json(rows);
  });

  r.get('/news/:slug', (req, res) => {
    const row = db.prepare(
      `SELECT * FROM content WHERE type='news' AND slug=? AND status='published' AND deleted_at IS NULL`
    ).get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  // ── Judicial Acts ───────────────────────
  r.get('/judicial-acts', (_req, res) => {
    const rows = db.prepare(
      `SELECT id,doc_number,doc_type,title_ru,title_tj,title_en,collegium,act_date,category,file_url,tags
       FROM judicial_acts WHERE status='published' AND deleted_at IS NULL
       ORDER BY act_date DESC LIMIT 100`
    ).all();
    res.json(rows);
  });

  r.get('/judicial-acts/:id', (req, res) => {
    const row = db.prepare(
      `SELECT * FROM judicial_acts WHERE id=? AND status='published' AND deleted_at IS NULL`
    ).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  // ── Courts ──────────────────────────────
  r.get('/courts', (_req, res) => {
    const rows = db.prepare(
      `SELECT c.*, r.slug as region_slug, r.name_ru as region_name_ru, r.name_tj as region_name_tj,
              r.color_hex, r.color_glow
       FROM courts c LEFT JOIN regions r ON c.region_id = r.id
       WHERE c.active=1 ORDER BY c.region_id, c.id`
    ).all();
    res.json(rows);
  });

  // ── Regions ─────────────────────────────
  r.get('/regions', (_req, res) => {
    const rows = db.prepare(
      `SELECT * FROM regions WHERE active=1 ORDER BY sort_order, id`
    ).all();
    res.json(rows);
  });

  // ── Announcements ───────────────────────
  r.get('/announcements', (_req, res) => {
    const rows = db.prepare(
      `SELECT id,title_ru,title_tj,title_en,body_ru,body_tj,body_en,important,priority,expires_at,created_at
       FROM announcements WHERE active=1 AND deleted_at IS NULL
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY important DESC, priority DESC, created_at DESC LIMIT 20`
    ).all();
    res.json(rows);
  });

  // ── Pages ───────────────────────────────
  r.get('/pages/:slug', (req, res) => {
    const row = db.prepare(
      `SELECT * FROM content WHERE type='page' AND slug=? AND status='published' AND deleted_at IS NULL`
    ).get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  // ── Menu ────────────────────────────────
  r.get('/menu/:slug', (req, res) => {
    const menu = db.prepare(`SELECT * FROM menus WHERE slug=?`).get(req.params.slug) as any;
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    const items = db.prepare(
      `SELECT * FROM menu_items WHERE menu_id=? AND visible=1 ORDER BY sort_order`
    ).all(menu.id);
    res.json({ ...menu, items });
  });

  // ── Contacts ────────────────────────────
  r.get('/contacts', (_req, res) => {
    const rows = db.prepare(`SELECT key,value_ru,value_tj,value_en FROM contact_info`).all();
    const contacts = Object.fromEntries(rows.map((r: any) => [r.key, r]));
    res.json(contacts);
  });

  // ── Reception schedule ──────────────────
  r.get('/reception', (_req, res) => {
    const rows = db.prepare(
      `SELECT * FROM reception_schedule WHERE active=1 ORDER BY sort_order`
    ).all();
    res.json(rows);
  });

  // ── Settings (public only) ──────────────
  r.get('/settings', (_req, res) => {
    const rows = db.prepare(
      `SELECT key,value FROM site_settings WHERE group_name != 'private'`
    ).all();
    const settings = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
    res.json(settings);
  });

  // ── Homepage sections ───────────────────
  r.get('/homepage', (_req, res) => {
    const rows = db.prepare(
      `SELECT section_key,title_ru,title_tj,title_en,content_json,sort_order
       FROM homepage_sections WHERE visible=1 ORDER BY sort_order`
    ).all();
    res.json(rows);
  });

  // ── Appeals (submit) ────────────────────
  r.post('/appeals', (req, res) => {
    const { fullName, phone, email, subject, message } = req.body;
    if (!fullName || !phone || !message) {
      return res.status(400).json({ error: 'fullName, phone and message are required' });
    }
    const refNum = 'APL-' + Date.now();
    const result = db.prepare(
      `INSERT INTO appeals(ref_number,full_name,phone,email,subject,message) VALUES(?,?,?,?,?,?)`
    ).run(refNum, fullName, phone, email || null, subject || null, message);
    res.status(201).json({ id: result.lastInsertRowid, refNumber: refNum, status: 'new' });
  });

  return r;
}
