try { process.loadEnvFile?.(); } catch {}
import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';
import { aiRouter } from './routes/ai';

const root = process.cwd(); const dataDir = path.join(root, 'data'); fs.mkdirSync(dataDir, { recursive: true });
export const db = new Database(path.join(dataDir, 'sudtj.sqlite')); db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('super_admin', 'admin', 'editor', 'reviewer')), disabled INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY, type TEXT NOT NULL, slug TEXT NOT NULL, title_ru TEXT NOT NULL, title_tj TEXT, title_en TEXT, body_ru TEXT, body_tj TEXT, body_en TEXT, excerpt_ru TEXT, excerpt_tj TEXT, excerpt_en TEXT, cover_image_id INTEGER, status TEXT NOT NULL DEFAULT 'draft', published_at TEXT, author_id INTEGER, deleted_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(type,slug));
CREATE TABLE IF NOT EXISTS content_versions (id INTEGER PRIMARY KEY, content_id INTEGER NOT NULL, version_number INTEGER NOT NULL, snapshot_data TEXT NOT NULL, created_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, commit_message TEXT);
CREATE TABLE IF NOT EXISTS appeals (id INTEGER PRIMARY KEY, full_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, subject TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', assigned_to INTEGER, internal_note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, user_id INTEGER, action TEXT NOT NULL, object_type TEXT NOT NULL, object_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS courts (id INTEGER PRIMARY KEY, name_ru TEXT NOT NULL, name_tj TEXT, name_en TEXT, short_name_ru TEXT, short_name_tj TEXT, short_name_en TEXT, region TEXT, type TEXT, address_ru TEXT, address_tj TEXT, address_en TEXT, phone TEXT, email TEXT, website TEXT, lat REAL, lng REAL, status TEXT DEFAULT 'normal', active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS region_clusters (id TEXT PRIMARY KEY, name_ru TEXT NOT NULL, name_tj TEXT NOT NULL, name_en TEXT, short_name_ru TEXT NOT NULL, short_name_tj TEXT NOT NULL, short_name_en TEXT, color_hex TEXT, color_glow TEXT, accent_class TEXT, border_class TEXT, text_class TEXT, bg_glow_class TEXT);
CREATE TABLE IF NOT EXISTS hearings (id INTEGER PRIMARY KEY, court_ru TEXT, court_tj TEXT, court_en TEXT, judge_ru TEXT, judge_tj TEXT, judge_en TEXT, hearing_date TEXT, hearing_time TEXT, category_ru TEXT, category_tj TEXT, category_en TEXT, parties_ru TEXT, parties_tj TEXT, parties_en TEXT, room TEXT);
CREATE TABLE IF NOT EXISTS sample_docs (id INTEGER PRIMARY KEY, title_ru TEXT, title_tj TEXT, title_en TEXT, category_ru TEXT, category_tj TEXT, category_en TEXT, format TEXT, file_size TEXT, file_id INTEGER);
CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER NOT NULL, alt_text TEXT, uploaded_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS judicial_acts (id INTEGER PRIMARY KEY, title_ru TEXT NOT NULL, title_tj TEXT, title_en TEXT, doc_number TEXT, doc_type TEXT, category TEXT, file_id INTEGER, status TEXT DEFAULT 'draft', published_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS leadership (id INTEGER PRIMARY KEY, name_tj TEXT, name_ru TEXT, name_en TEXT, title_tj TEXT, title_ru TEXT, title_en TEXT, bio_tj TEXT, bio_ru TEXT, bio_en TEXT, image_url TEXT, sort_order INTEGER, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS menus (id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY, menu_id INTEGER, parent_id INTEGER, title_ru TEXT NOT NULL, title_tj TEXT, title_en TEXT, url TEXT, order_index INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS homepage_sections (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, data TEXT NOT NULL, active INTEGER DEFAULT 1, order_index INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS duty_categories (id INTEGER PRIMARY KEY, name_ru TEXT NOT NULL, name_tj TEXT, name_en TEXT, requires_amount INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS duty_rules (id INTEGER PRIMARY KEY, category_id INTEGER, calc_mode TEXT NOT NULL, base_rate REAL, min_amount REAL, max_amount REAL, effective_from TEXT, effective_to TEXT, legal_basis TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS duty_exemptions (id INTEGER PRIMARY KEY, title_ru TEXT NOT NULL, title_tj TEXT, title_en TEXT, legal_basis TEXT, description TEXT, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS duty_history (id INTEGER PRIMARY KEY, category_id INTEGER, amount_input REAL, result_amount REAL, result_currency TEXT, user_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_content_type_status ON content(type, status, deleted_at, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_judicial_acts_status ON judicial_acts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_courts_active ON courts(active);
CREATE INDEX IF NOT EXISTS idx_leadership_status ON leadership(status, sort_order);
`);

import { setupAiSchema } from './db/ai_schema';
setupAiSchema(db);

const seedDutyData = () => {
  const catCount = db.prepare('SELECT count(*) as c FROM duty_categories').get() as any;
  if (catCount.c === 0) {
    console.log('Seeding duty categories and rules (UNVERIFIED PLACEHOLDERS)...');
    
    // Seed Categories
    const stmtCat = db.prepare('INSERT INTO duty_categories (id, name_ru, name_tj, name_en, requires_amount) VALUES (?, ?, ?, ?, ?)');
    stmtCat.run(1, 'Исковое заявление имущественного характера', 'Аризаи даъвогӣ хусусияти молумулкӣ', 'Statement of claim of property nature', 1);
    stmtCat.run(2, 'Расторжение брака', 'Бекор кардани ақди никоҳ', 'Divorce', 0);
    
    // Seed Rules
    const stmtRule = db.prepare('INSERT INTO duty_rules (category_id, calc_mode, base_rate, min_amount, max_amount, legal_basis) VALUES (?, ?, ?, ?, ?, ?)');
    // 1% of claim amount, min 20 TJS, max 50000 TJS (fake unverified rule)
    stmtRule.run(1, 'PERCENT_WITH_MINMAX', 0.01, 20.0, 50000.0, 'Закон РТ "О государственной пошлине", Статья X (НЕ ПРОВЕРЕНО)');
    // Fixed amount 150 TJS
    stmtRule.run(2, 'FIXED_AMOUNT', 150.0, null, null, 'Закон РТ "О государственной пошлине", Статья Y (НЕ ПРОВЕРЕНО)');

    // Seed Exemptions
    db.prepare('INSERT INTO duty_exemptions (title_ru, title_tj, title_en, legal_basis, description) VALUES (?, ?, ?, ?, ?)').run(
      'Инвалиды I и II групп', 'Маъюбони гурӯҳҳои I ва II', 'Group I and II invalids', 'Статья Z', 'Освобождаются от уплаты по всем делам (НЕ ПРОВЕРЕНО)'
    );
  }
};
seedDutyData();

const seedContentData = () => {
  const newsCount = db.prepare("SELECT count(*) as c FROM content WHERE type='news'").get() as any;
  if (newsCount.c === 0) {
    console.log('Seeding initial news...');
    const stmt = db.prepare("INSERT INTO content(type, slug, title_ru, excerpt_ru, status, published_at) VALUES(?, ?, ?, ?, ?, ?)");
    stmt.run('news', 'news-1', 'ВОКУНИШИ СУДИ ОЛӢ ВОБАСТА БА НАВОРЕ...', 'Ба маълумоти шаҳрвандон расонида мешавад...', 'published', new Date().toISOString());
    stmt.run('news', 'news-2', 'ИШТИРОК ДАР ЧОРАБИНӢ ҶИҲАТИ ТАЪМИНИ ИҶРОИ...', 'Дар доираи ҳамкориҳои байналмилалӣ...', 'published', new Date().toISOString());
    stmt.run('news', 'news-3', 'РАВАНДИ ОБОДОНӢ ВА ФАЪОЛИЯТИ СУДИ ШАҲРИ ВАҲДАТ', 'Бо мақсади шиносоӣ бо фаъолияти судҳо...', 'published', new Date().toISOString());
  }

  const actsCount = db.prepare("SELECT count(*) as c FROM judicial_acts").get() as any;
  if (actsCount.c === 0) {
    console.log('Seeding initial judicial acts...');
    const stmt = db.prepare("INSERT INTO judicial_acts(title_ru, doc_number, doc_type, category, status, published_at) VALUES(?, ?, ?, ?, ?, ?)");
    stmt.run('Намунаи аризаи даъвогӣ дар бораи бекор кардани ақди никоҳ', '№123-2023', 'Аризаи даъвогӣ', 'Оила', 'published', new Date().toISOString());
    stmt.run('Намунаи аризаи даъвогӣ дар бораи рӯёнидани алимент', '№124-2023', 'Аризаи даъвогӣ', 'Оила', 'published', new Date().toISOString());
    stmt.run('Намунаи аризаи даъвогӣ дар бораи барқарор кардан ба кор', '№125-2023', 'Аризаи даъвогӣ', 'Меҳнат', 'published', new Date().toISOString());
  }

  const leaderCount = db.prepare('SELECT count(*) as c FROM leadership').get() as any;
  if (leaderCount.c === 0) {
    console.log('Seeding initial leadership...');
    const insertLeader = db.prepare('INSERT INTO leadership (name_tj, name_ru, name_en, title_tj, title_ru, title_en, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertLeader.run('Мирзозода Рустам Пираҳмад', 'Мирзозода Рустам Пирахмад', 'Mirzozoda Rustam Pirahmad', 'Раиси Суди Олӣ', 'Председатель Верховного суда', 'Chief Justice of the Supreme Court', '/assets/symbols/themis-sculpture.jpg', 1);
    insertLeader.run('Лутфуллозода Шавкат', 'Лутфуллозода Шавкат', 'Lutfullozoda Shavkat', 'Муовини якуми Раис', 'Первый заместитель Председателя', 'First Deputy Chief Justice', '/assets/symbols/themis-sculpture.jpg', 2);
    insertLeader.run('Тағозода Абдуқаҳҳор Саидмурод', 'Тагозода Абдукаххор Саидмурод', 'Tagozoda Abdukahhor Saidmurod', 'Муовини Раис', 'Заместитель Председателя', 'Deputy Chief Justice', '/assets/symbols/themis-sculpture.jpg', 3);
    insertLeader.run('Раҷабзода Ҳотам Назар', 'Раджабзода Хотам Назар', 'Rajabzoda Hotam Nazar', 'Муовини Раис-Раиси коллегияи ҳарбӣ', 'Заместитель Председателя - Председатель военной коллегии', 'Deputy Chief Justice - Chairman of the Military Collegium', '/assets/symbols/themis-sculpture.jpg', 4);
  }
};
seedContentData();

import multer from 'multer';

const uploadDir = path.join(dataDir, 'uploads'); fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer();

const secret = process.env.CMS_JWT_SECRET || 'development-only-change-me';
if (process.env.CMS_SEED_ADMIN_EMAIL && process.env.CMS_SEED_ADMIN_PASSWORD && !db.prepare('SELECT id FROM users WHERE email=?').get(process.env.CMS_SEED_ADMIN_EMAIL)) {
  db.prepare('INSERT INTO users(email,password_hash,name,role) VALUES(?,?,?,?)').run(process.env.CMS_SEED_ADMIN_EMAIL, bcrypt.hashSync(process.env.CMS_SEED_ADMIN_PASSWORD, 12), 'System Administrator', 'super_admin');
}
const app = express(); app.use(cors({ origin: process.env.CMS_ORIGIN || 'http://127.0.0.1:5173' })); app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));
app.use('/api/ai', aiRouter);

type Auth = express.Request & { user?: { id:number; role:string } };
const auth = (req:Auth,res:express.Response,next:express.NextFunction) => { const token = req.headers.authorization?.replace('Bearer ',''); try { req.user = jwt.verify(token || '', secret) as {id:number;role:string}; next(); } catch { res.status(401).json({ error:'Unauthorized' }); } };
const audit = (userId:number|undefined, action:string, type:string, id?:number) => db.prepare('INSERT INTO audit_log(user_id,action,object_type,object_id) VALUES(?,?,?,?)').run(userId || null, action, type, id || null);
app.get('/api/health', (_req,res) => res.json({ api:'ok', database:'ok', storage:'ok' }));
app.post('/api/admin/auth/login', (req,res) => { const parsed=z.object({email:z.string().email(),password:z.string().min(8)}).safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'Invalid credentials'}); const user=db.prepare('SELECT * FROM users WHERE email=? AND disabled=0').get(parsed.data.email) as any; if(!user || !bcrypt.compareSync(parsed.data.password,user.password_hash)) return res.status(401).json({error:'Invalid credentials'}); const token=jwt.sign({id:user.id,role:user.role},secret,{expiresIn:'8h'}); audit(user.id,'login','user',user.id); res.json({token,user:{id:user.id,name:user.name,role:user.role}}); });

// Media endpoints
app.post('/api/admin/media', auth, upload.single('file'), (req:Auth, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filename = `${Date.now()}-${req.file.originalname}`;
  fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
  const result = db.prepare('INSERT INTO media (filename, original_name, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?)').run(filename, req.file.originalname, req.file.mimetype, req.file.size, req.user!.id);
  audit(req.user!.id, 'upload', 'media', Number(result.lastInsertRowid));
  res.status(201).json({ id: result.lastInsertRowid, filename, url: `/uploads/${filename}` });
});
app.get('/api/admin/media', auth, (_req, res) => res.json(db.prepare('SELECT * FROM media ORDER BY created_at DESC').all()));

// Cache middleware for public APIs
const cache = (seconds: number) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('Cache-Control', `public, max-age=${seconds}`);
  next();
};

// Content
app.get('/api/news', cache(60), (_req,res) => res.json(db.prepare("SELECT c.id,c.slug,c.title_ru,c.title_tj,c.title_en,c.body_ru,c.body_tj,c.body_en,c.published_at, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type='news' AND c.status='published' AND c.deleted_at IS NULL ORDER BY c.published_at DESC").all()));
app.post('/api/appeals', (req,res) => { const p=z.object({fullName:z.string().min(2).max(160),phone:z.string().min(5).max(40),email:z.string().email().optional().or(z.literal('')),subject:z.string().max(200).optional(),message:z.string().min(10).max(5000)}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid appeal'}); const row=db.prepare('INSERT INTO appeals(full_name,phone,email,subject,message) VALUES(?,?,?,?,?)').run(p.data.fullName,p.data.phone,p.data.email || null,p.data.subject || null,p.data.message); res.status(201).json({id:row.lastInsertRowid,status:'new'}); });
app.get('/api/admin/dashboard', auth, (req:Auth,res) => res.json({ news:db.prepare("SELECT count(*) count FROM content WHERE type='news' AND deleted_at IS NULL").get(), pending:db.prepare("SELECT count(*) count FROM content WHERE status='pending_review'").get(), appeals:db.prepare("SELECT count(*) count FROM appeals WHERE status='new'").get(), activity:db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 8').all() }));
app.get('/api/admin/content', auth, (_req,res) => res.json(db.prepare('SELECT * FROM content WHERE deleted_at IS NULL ORDER BY updated_at DESC').all()));
app.post('/api/admin/content', auth, (req:Auth,res) => { const p=z.object({type:z.enum(['news','page','act','announcement']),slug:z.string().regex(/^[a-z0-9-]+$/),titleRu:z.string().min(2),titleTj:z.string().optional(),titleEn:z.string().optional(),bodyRu:z.string().optional(),bodyTj:z.string().optional(),bodyEn:z.string().optional(),status:z.enum(['draft','pending_review','published','archived','scheduled']).default('draft'), published_at:z.string().optional()}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid content', details: p.error}); const x=p.data; const result=db.prepare('INSERT INTO content(type,slug,title_ru,title_tj,title_en,body_ru,body_tj,body_en,status,published_at,author_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(x.type,x.slug,x.titleRu,x.titleTj || null,x.titleEn || null,x.bodyRu || null,x.bodyTj || null,x.bodyEn || null,x.status,x.status==='published'?(x.published_at || new Date().toISOString()):(x.status==='scheduled'?x.published_at:null),req.user!.id); audit(req.user!.id,'create',x.type,Number(result.lastInsertRowid)); res.status(201).json({id:result.lastInsertRowid}); });
app.patch('/api/admin/content/:id', auth, (req:Auth,res) => { const status=z.enum(['draft','pending_review','published','archived']).optional().safeParse(req.body.status); if(!status.success)return res.status(400).json({error:'Invalid status'}); db.prepare("UPDATE content SET status=COALESCE(?,status), updated_at=CURRENT_TIMESTAMP, published_at=CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE published_at END WHERE id=?").run(status.data,status.data,req.params.id); audit(req.user!.id,'update','content',Number(req.params.id)); res.sendStatus(204); });

// Courts
app.get('/api/courts', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM courts WHERE active=1').all()));
app.post('/api/admin/courts', auth, (req:Auth, res) => { const p=z.object({nameRu:z.string().min(2),nameTj:z.string().optional(),nameEn:z.string().optional(),region:z.string(),type:z.string(),address:z.string().optional(),phone:z.string().optional(),lat:z.number().optional(),lng:z.number().optional()}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid court', details: p.error}); const x=p.data; const result=db.prepare('INSERT INTO courts(name_ru,name_tj,name_en,region,type,address,phone,lat,lng) VALUES(?,?,?,?,?,?,?,?,?)').run(x.nameRu,x.nameTj||null,x.nameEn||null,x.region,x.type,x.address||null,x.phone||null,x.lat||null,x.lng||null); audit(req.user!.id,'create','court',Number(result.lastInsertRowid)); res.status(201).json({id:result.lastInsertRowid}); });

// Judicial Acts
app.get('/api/judicial_acts', cache(300), (_req, res) => res.json(db.prepare("SELECT * FROM judicial_acts WHERE status='published' ORDER BY published_at DESC").all()));

// Leadership
app.get('/api/leadership', cache(3600), (_req, res) => res.json(db.prepare("SELECT * FROM leadership WHERE status='active' ORDER BY sort_order ASC").all()));

// Region Clusters & Courts Topology
app.get('/api/region_clusters', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM region_clusters').all()));

// Hearings
app.get('/api/hearings', cache(300), (_req, res) => res.json(db.prepare('SELECT * FROM hearings ORDER BY hearing_date DESC LIMIT 50').all()));

// Sample Docs
app.get('/api/sample_docs', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM sample_docs').all()));

// Versioning and Rollback (Admin)
app.get('/api/admin/content/:id/versions', auth, (req:Auth, res) => {
  res.json(db.prepare('SELECT id, version_number, created_by, created_at, commit_message FROM content_versions WHERE content_id = ? ORDER BY version_number DESC').all(req.params.id));
});
app.post('/api/admin/content/:id/versions', auth, (req:Auth, res) => {
  const content = db.prepare('SELECT * FROM content WHERE id=?').get(req.params.id);
  if (!content) return res.status(404).json({error: 'Content not found'});
  const lastVer = db.prepare('SELECT MAX(version_number) as v FROM content_versions WHERE content_id=?').get(req.params.id) as {v:number};
  const nextVer = (lastVer.v || 0) + 1;
  db.prepare('INSERT INTO content_versions(content_id, version_number, snapshot_data, created_by, commit_message) VALUES(?,?,?,?,?)')
    .run(req.params.id, nextVer, JSON.stringify(content), req.user!.id, req.body.commit_message || `Version ${nextVer}`);
  res.status(201).json({version: nextVer});
});
app.post('/api/admin/content/:id/rollback', auth, (req:Auth, res) => {
  const version = db.prepare('SELECT snapshot_data FROM content_versions WHERE content_id=? AND version_number=?').get(req.params.id, req.body.version_number) as {snapshot_data:string};
  if (!version) return res.status(404).json({error: 'Version not found'});
  const snap = JSON.parse(version.snapshot_data);
  db.prepare('UPDATE content SET title_ru=?, title_tj=?, title_en=?, body_ru=?, body_tj=?, body_en=?, excerpt_ru=?, excerpt_tj=?, excerpt_en=?, cover_image_id=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(snap.title_ru, snap.title_tj, snap.title_en, snap.body_ru, snap.body_tj, snap.body_en, snap.excerpt_ru, snap.excerpt_tj, snap.excerpt_en, snap.cover_image_id, snap.status, req.params.id);
  audit(req.user!.id, 'rollback', 'content', Number(req.params.id));
  res.json({success: true});
});

// State Duty Endpoints
app.get('/api/duty/config', cache(3600), (_req, res) => {
  const categories = db.prepare('SELECT * FROM duty_categories').all();
  const rules = db.prepare('SELECT * FROM duty_rules').all();
  const exemptions = db.prepare('SELECT * FROM duty_exemptions WHERE active=1').all();
  res.json({ categories, rules, exemptions });
});
app.post('/api/duty/history', (req, res) => {
  const p = z.object({ categoryId: z.number(), amountInput: z.number().nullable(), resultAmount: z.number(), resultCurrency: z.string() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid payload' });
  const row = db.prepare('INSERT INTO duty_history (category_id, amount_input, result_amount, result_currency, user_id) VALUES (?, ?, ?, ?, ?)').run(p.data.categoryId, p.data.amountInput, p.data.resultAmount, p.data.resultCurrency, null);
  res.status(201).json({ id: row.lastInsertRowid });
});

// SSR and Static Frontend
const isProd = process.env.NODE_ENV === 'production';
import { pathToFileURL } from 'node:url';

(async () => {
  if (!isProd) {
    const vite = await import('vite').then(m => m.createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    }));
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/uploads/')) {
        res.status(404).json({error: 'Not found'});
        return;
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
        
        const { html: appHtml } = render(url);
        const html = template.replace('<!--ssr-outlet-->', appHtml);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(root, 'dist/client'), { index: false }));
    
    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/uploads/')) {
        res.status(404).json({error: 'Not found'});
        return;
      }
      try {
        const template = fs.readFileSync(path.resolve('dist/client/index.html'), 'utf-8');
        const url = req.originalUrl;
        const renderPath = pathToFileURL(path.resolve('dist/server/entry-server.js')).href;
        const { render } = await import(renderPath);
        
        const { html: appHtml } = render(url);
        const html = template.replace('<!--ssr-outlet-->', appHtml);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  // Scheduler
  setInterval(() => {
    const now = new Date().toISOString();
    db.prepare("UPDATE content SET status='published', updated_at=CURRENT_TIMESTAMP WHERE status='scheduled' AND published_at <= ?").run(now);
  }, 60000);

  app.listen(Number(process.env.CMS_PORT || 8787), () => console.log('Server is running at http://localhost:8787'));
})();

