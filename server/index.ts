try { process.loadEnvFile?.(); } catch {}
import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import { aiRouter } from './routes/ai';
import { fetchCapped } from './utils/fetch';
import { translateText, magicGenerate, magicImprove, magicTransform, detectLang } from './editorTools';
import { loginLimiter, appealsLimiter, questionnaireLimiter, editorLimiter } from './middleware/rateLimit';
import { requirePerm, hasPerm, permissionsFor, permForContentStatus } from './middleware/rbac';
import { searchRouter } from './routes/search';
import { systemRouter } from './routes/system';
import { cache } from './utils/cache';

const root = process.cwd(); const dataDir = path.join(root, 'data'); fs.mkdirSync(dataDir, { recursive: true });
// Strip imported legislation HTML down to readable plain text for the e-library.
function cleanImportedText(html: string): string {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  const m = t.match(/<div[^>]*(?:id="content"|class="[^"]*\bdocument\b[^"]*")[^>]*>([\s\S]*)/i);
  if (m) t = m[1];
  t = t
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/gi, '&');
  t = t.replace(/[ \t\u00a0\f\v]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}
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

// Lightweight migrations for portal sections (idempotent)
try {
  const cols = db.prepare("PRAGMA table_info(content)").all() as any[];
  if (!cols.some((c) => c.name === 'region')) db.exec("ALTER TABLE content ADD COLUMN region TEXT");
  if (!cols.some((c) => c.name === 'expires_at')) db.exec("ALTER TABLE content ADD COLUMN expires_at TEXT");
} catch { /* already migrated */ }
db.exec(`CREATE TABLE IF NOT EXISTS questionnaire_responses (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT, topic TEXT, rating INTEGER, message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
try {
  const ucols = db.prepare("PRAGMA table_info(users)").all() as any[];
  if (!ucols.some((c) => c.name === 'site_id')) db.exec("ALTER TABLE users ADD COLUMN site_id TEXT");
  const ccols = db.prepare("PRAGMA table_info(content)").all() as any[];
  if (!ccols.some((c) => c.name === 'ai_meta')) db.exec("ALTER TABLE content ADD COLUMN ai_meta TEXT");
  // CMS-01 editorial workflow columns (additive, idempotent)
  for (const col of ['review_notes TEXT', 'reviewed_by INTEGER', 'reviewed_at TEXT', 'published_by INTEGER']) {
    const name = col.split(' ')[0];
    if (!db.prepare("PRAGMA table_info(content)").all().some((c: any) => c.name === name)) db.exec(`ALTER TABLE content ADD COLUMN ${col}`);
  }
} catch { /* already migrated */ }

// Court-site scopes: which region/court names belong to each court site id.
// Users with site_id set (and not super_admin) are restricted to their site.
const COURT_SCOPES: Record<string, { region: string; courtName: string }> = {
  sino: { region: 'sino', courtName: 'Суди ноҳияи Сино' },
  dushanbe: { region: 'dushanbe_rrp', courtName: 'Суди шаҳри Душанбе' },
};
type Scope = { site: string; region: string; courtName: string };
try {
  const lcols = db.prepare("PRAGMA table_info(leadership)").all() as any[];
  if (!lcols.some((c) => c.name === 'court_id')) db.exec("ALTER TABLE leadership ADD COLUMN court_id TEXT");
  const acols = db.prepare("PRAGMA table_info(judicial_acts)").all() as any[];
  for (const col of ['collegium TEXT', 'case_number TEXT', 'act_date TEXT', 'file_path TEXT']) {
    const name = col.split(' ')[0];
    if (!acols.some((c) => c.name === name)) db.exec(`ALTER TABLE judicial_acts ADD COLUMN ${col}`);
  }
  db.exec(`CREATE TABLE IF NOT EXISTS shelf_books(id INTEGER PRIMARY KEY, title_ru TEXT NOT NULL, title_tj TEXT, title_en TEXT, url TEXT, badge TEXT DEFAULT 'PDF', cover_theme INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)`);
  const scols = db.prepare("PRAGMA table_info(shelf_books)").all() as any[];
  for (const col of ['title_tj TEXT', 'title_en TEXT', 'url TEXT', 'url_ru TEXT', 'url_tj TEXT', 'url_en TEXT', 'badge TEXT', 'cover_theme INTEGER DEFAULT 0', 'sort_order INTEGER DEFAULT 0', 'is_visible INTEGER DEFAULT 1', 'updated_at TEXT', 'kind TEXT', 'content TEXT', 'content_ru TEXT', 'content_tj TEXT', 'content_en TEXT', 'doc_lang TEXT', 'source_url TEXT', 'cover_text TEXT', 'cover_emblem TEXT', 'cover_bg TEXT', 'cover_image TEXT']) {
    const name = col.split(' ')[0];
    if (!scols.some((c) => c.name === name)) db.exec(`ALTER TABLE shelf_books ADD COLUMN ${col}`);
  }
  // Backfill: copy legacy content/url -> ru variants if new cols empty (first run after migration)
  try {
    const anyNew = db.prepare("SELECT count(*) as c FROM shelf_books WHERE (content_ru IS NOT NULL OR content_tj IS NOT NULL OR content_en IS NOT NULL)").get() as any;
    if (anyNew.c === 0) {
      db.exec("UPDATE shelf_books SET content_ru = content WHERE content IS NOT NULL AND content_ru IS NULL");
    }
    const anyUrl = db.prepare("SELECT count(*) as c FROM shelf_books WHERE (url_ru IS NOT NULL OR url_tj IS NOT NULL OR url_en IS NOT NULL)").get() as any;
    if (anyUrl.c === 0) {
      db.exec("UPDATE shelf_books SET url_ru = url WHERE url IS NOT NULL AND url_ru IS NULL");
    }
  } catch {}
} catch { /* already migrated */ }

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

  const seedTyped = (type: string, rows: Array<[string, string, string, string, string?]>) => {
    const c = db.prepare('SELECT count(*) as c FROM content WHERE type=?').get(type) as any;
    if (c.c !== 0) return;
    console.log(`Seeding ${type}...`);
    const stmt = db.prepare('INSERT INTO content(type, slug, title_ru, title_tj, title_en, excerpt_ru, status, published_at, region) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    rows.forEach(([slug, ru, tj, en, region], i) => stmt.run(type, slug, ru, tj, en, ru, 'published', new Date(Date.now() - i * 86400000).toISOString(), region || null));
  };
  seedTyped('announcement', [
    ['ozmun-2026', 'ОЗМУН БАРОИ ИШҒОЛИ МАНСАБҲОИ ХОЛИИ МАЪМУРИИ ХИЗМАТИ ДАВЛАТӢ', 'ОЗМУН БАРОИ ИШҒОЛИ МАНСАБҲОИ ХОЛИИ МАЪМУРИИ ХИЗМАТИ ДАВЛАТӢ', 'Competition for vacant administrative civil service positions', null],
    ['natijai-ozmun', 'НАТИҶАИ ОЗМУН', 'НАТИҶАИ ОЗМУН', 'Competition results', null],
    ['ruykhati-rasmii-somona', 'РӮЙХАТИ РАСМИИ СОМОНА ВА ПОЧТАҲОИ ЭЛЕКТРОНИИ СУДҲОИ ҶУМҲУРӢ', 'РӮЙХАТИ РАСМИИ СОМОНА ВА ПОЧТАҲОИ ЭЛЕКТРОНИИ СУДҲОИ ҶУМҲУРӢ', 'Official list of court websites and e-mails', null],
  ]);
  seedTyped('vacancy', [
    ['kotibi-majlisi-sudi', 'Котиби маҷлиси судӣ — Суди Олӣ', 'Котиби маҷлиси судӣ — Суди Олӣ', 'Court session secretary — Supreme Court', null],
    ['mutakhassis-dastgoh', 'Мутахассиси дастгоҳи суд — вилояти Суғд', 'Мутахассиси дастгоҳи суд — вилояти Суғд', 'Court apparatus specialist — Sughd region', 'sugd'],
    ['mushoviri-huquqi', 'Мушовири ҳуқуқӣ — шаҳри Душанбе', 'Мушовири ҳуқуқӣ — шаҳри Душанбе', 'Legal adviser — Dushanbe', 'dushanbe'],
  ]);
  seedTyped('journal', [
    ['nashriya-2026-2', 'Нашрияи Суди Олӣ, №2 (2026)', 'Нашрияи Суди Олӣ, №2 (2026)', 'Supreme Court Journal, No. 2 (2026)', null],
    ['nashriya-2026-1', 'Нашрияи Суди Олӣ, №1 (2026)', 'Нашрияи Суди Олӣ, №1 (2026)', 'Supreme Court Journal, No. 1 (2026)', null],
  ]);

  // Dushanbe city court portal content (real items from dushanbe.sud.tj)
  const seedRegional = () => {
    const ins = db.prepare("INSERT OR IGNORE INTO content(type, slug, title_ru, title_tj, title_en, excerpt_ru, status, published_at, region) VALUES(?, ?, ?, ?, ?, ?, 'published', ?, ?)");
    ins.run('announcement', 'dushanbe-kassatsiya-25-08-2026', 'Рӯйхати парвандаҳои маданӣ, ки дар коллегияи кассатсионӣ санаи 25 августи соли 2026 баррасӣ мегарданд', 'Рӯйхати парвандаҳои маданӣ, ки дар коллегияи кассатсионӣ санаи 25 августи соли 2026 баррасӣ мегарданд', 'Civil cases before the cassation collegium on 25 August 2026', 'Коллегияи кассатсионии суди шаҳри Душанбе', '2026-08-24T08:00:00.000Z', 'dushanbe_rrp');
    ins.run('announcement', 'dushanbe-plenum-omuzish-08-2026', 'Рафти омӯзиши қарорҳои Пленуми Суди Олии ҶТ дар суди шаҳри Душанбе', 'Рафти омӯзиши қарорҳои Пленуми Суди Олии ҶТ дар суди шаҳри Душанбе', 'Study of Supreme Court Plenum decisions at Dushanbe City Court', 'Омӯзиши қарорҳои Пленум', '2026-08-21T08:00:00.000Z', 'dushanbe_rrp');
    ins.run('announcement', 'dushanbe-smm-qatnama-2026', 'Қатъномаи СММ дар бораи Даҳсолаи таҳкими сулҳ ба барои наслҳои оянда', 'Қатъномаи СММ дар бораи Даҳсолаи таҳкими сулҳ ба барои наслҳои оянда', 'UN resolution on the Decade for peace for future generations', 'Қатъномаи СММ', '2026-08-19T08:00:00.000Z', 'dushanbe_rrp');
    ins.run('announcement', 'dushanbe-payomi-peshvo-2026', 'Паёми Пешвои миллат ва рисолати созандаи он', 'Паёми Пешвои миллат ва рисолати созандаи он', 'Message of the Leader of the Nation and its creative mission', 'Паёми Пешвои миллат', '2026-08-14T08:00:00.000Z', 'dushanbe_rrp');
    ins.run('news', 'dushanbe-andesha-naslho-2026', 'Андешаҳо вобаста ба наслҳои оянда', 'Андешаҳо вобаста ба наслҳои оянда', 'Reflections on future generations', 'Андешаҳо вобаста ба наслҳои оянда', '2026-08-17T08:00:00.000Z', 'dushanbe_rrp');
    const h = db.prepare("INSERT INTO hearings (court_ru, court_tj, hearing_date, hearing_time, category_ru, category_tj, parties_ru, parties_tj, room) SELECT ?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM hearings WHERE court_ru=? AND hearing_date=?)");
    h.run('Суди шаҳри Душанбе', 'Суди шаҳри Душанбе', '2026-09-22', '09:00', 'Маданӣ (кассатсионӣ)', 'Маданӣ (кассатсионӣ)', '—', '—', 'Толори 1', 'Суди шаҳри Душанбе', '2026-09-22');
    h.run('Суди шаҳри Душанбе', 'Суди шаҳри Душанбе', '2026-09-23', '10:00', 'Оилавӣ', 'Оилавӣ', '—', '—', 'Толори 2', 'Суди шаҳри Душанбе', '2026-09-23');
    h.run('Суди ноҳияи Сино', 'Суди ноҳияи Сино', '2026-09-24', '09:30', 'Маданӣ', 'Маданӣ', '—', '—', 'Толори 1', 'Суди ноҳияи Сино', '2026-09-24');
    h.run('Суди ноҳияи Сино', 'Суди ноҳияи Сино', '2026-09-25', '10:00', 'Оилавӣ', 'Оилавӣ', '—', '—', 'Толори 2', 'Суди ноҳияи Сино', '2026-09-25');
    ins.run('announcement', 'sino-hafta-14-09-2026', 'Рӯйхати парвандаҳои дар давоми ҳафта аз 14.09.2026 сол то 18.09.2026 сол таъин кардашуда', 'Рӯйхати парвандаҳои дар давоми ҳафта аз 14.09.2026 сол то 18.09.2026 сол таъин кардашуда', 'Cases scheduled for the week of 14-18 September 2026', 'Рӯйхати ҳафта', '2026-09-13T08:00:00.000Z', 'sino');
    ins.run('announcement', 'sino-hafta-07-09-2026', 'Рӯйхати парвандаҳои дар давоми ҳафта аз 07.09.2026 сол то 11.09.2026 сол таъин кардашуда', 'Рӯйхати парвандаҳои дар давоми ҳафта аз 07.09.2026 сол то 11.09.2026 сол таъин кардашуда', 'Cases scheduled for the week of 7-11 September 2026', 'Рӯйхати ҳафта', '2026-09-06T08:00:00.000Z', 'sino');
    ins.run('news', 'sino-khovar-maqola-2026', 'Нашри мақолаи судяи суди ноҳияи Сино дар саҳифаи расмии АМИТ «Ховар»', 'Нашри мақолаи судяи суди ноҳияи Сино дар саҳифаи расмии АМИТ «Ховар»', 'Sino court judge article published by Khovar news agency', 'Мақола дар «Ховар»', '2026-09-07T08:00:00.000Z', 'sino');
    ins.run('news', 'sino-majlisi-tantanavi-35', 'Баргузории маҷлиси тантанавӣ бахшида ба 35-солагии Истиқлоли давлатӣ дар суди ноҳияи Сино', 'Баргузории маҷлиси тантанавӣ бахшида ба 35-солагии Истиқлоли давлатӣ дар суди ноҳияи Сино', 'Ceremonial meeting for the 35th anniversary of independence at Sino court', 'Маҷлиси тантанавӣ', '2026-09-06T08:00:00.000Z', 'sino');
    ins.run('news', 'sino-istiqloliyat-ramzi', 'Истиқлолият рамзи соҳибихтиёрӣ ва пояи устувори давлатдории миллӣ', 'Истиқлолият рамзи соҳибихтиёрӣ ва пояи устувори давлатдории миллӣ', 'Independence as a symbol of sovereignty and national statehood', 'Истиқлолият', '2026-09-06T08:00:00.000Z', 'sino');
  };
  seedRegional();
};
seedContentData();

import multer from 'multer';

const uploadDir = path.join(dataDir, 'uploads'); fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
// Library files (scanned codes can be heavy): 100 MB cap.
const libraryUpload = multer({
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
});
// Multer errors (e.g. LIMIT_FILE_SIZE) → clean JSON instead of HTML stack pages.
const multerErrors = (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) {
    return res.status(413).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 100 MB)' : 'Upload rejected' });
  }
  next(err);
};

const secret = process.env.CMS_JWT_SECRET || 'development-only-change-me';
if (process.env.CMS_SEED_ADMIN_EMAIL && process.env.CMS_SEED_ADMIN_PASSWORD && !db.prepare('SELECT id FROM users WHERE email=?').get(process.env.CMS_SEED_ADMIN_EMAIL)) {
  db.prepare('INSERT INTO users(email,password_hash,name,role) VALUES(?,?,?,?)').run(process.env.CMS_SEED_ADMIN_EMAIL, bcrypt.hashSync(process.env.CMS_SEED_ADMIN_PASSWORD, 12), 'System Administrator', 'super_admin');
}
const CMS_ORIGINS = [process.env.CMS_ORIGIN || 'http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const app = express(); app.use(cors({ origin: CMS_ORIGINS, credentials: true })); app.use(express.json({ limit: '8mb' }));
// SEC-05: cookie transport helpers (no extra deps).
const parseCookies = (req: express.Request): Record<string, string> => {
  const out: Record<string, string> = {};
  const h = req.headers.cookie;
  if (!h) return out;
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
};
const isHttpsReq = (req: express.Request): boolean =>
  req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.CMS_COOKIE_SECURE === '1';
const cookieOpts = (req: express.Request) => ({
  httpOnly: true as const,
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
  sameSite: 'lax' as const,
  secure: isHttpsReq(req),
});
// CSRF: cookie-authenticated mutations must come from an allowed origin.
// Bearer-authed requests carry a custom header (never sent by plain HTML forms)
// and SameSite=Lax already blocks cross-site cookie POSTs; missing Origin
// (curl/scripts) is allowed, explicit mismatch is denied.
const csrfCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) return next();
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return next();
  if (!parseCookies(req)['cms_token']) return next();
  const origin = String(req.headers.origin || req.headers.referer || '');
  if (!origin) return next();
  let host = '';
  try { host = new URL(origin).hostname.toLowerCase(); } catch { return res.status(403).json({ error: 'Forbidden' }); }
  const allowed = new Set<string>(['localhost', '127.0.0.1', 'sud.tj', 'www.sud.tj']);
  try { allowed.add(new URL(CMS_ORIGINS[0]).hostname.toLowerCase()); } catch {}
  const reqHost = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (host === reqHost || allowed.has(host)) return next();
  return res.status(403).json({ error: 'Forbidden' });
};
app.use(csrfCheck);
// Baseline secure headers (no external deps).
// SEC-03/SEC-06: Content-Security-Policy ENFORCED (was Report-Only; the allowlist
// below served clean during the report-only window with no app breakage).
// Allows: self, Google Fonts, inline styles (Tailwind/inline-style heavy app —
// justified), data:/blob: images (PDF page renders), same-origin API + Vite HMR
// ws, pdf.js workers. No object-src; framing limited to self (mirrors X-Frame-Options).
// SEC-07: HSTS is opt-in via CMS_HSTS=1 — enable ONLY behind verified production TLS.
const CSP_POLICY =
  "default-src 'self'; " +
  "script-src 'self'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
  "connect-src 'self' ws: wss: https:; " +
  "media-src 'self' blob: data:; " +
  "worker-src 'self' blob:; " +
  "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'";
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // SEC-06: enforce in production only. Vite dev injects an inline preamble
  // (/@react-refresh) that `script-src 'self'` would block, killing hydration
  // and JS-injected CSS on the :8787 dev SSR path — so dev stays Report-Only.
  // Override: CMS_CSP_MODE=enforce|report-only|off.
  const prod = process.env.NODE_ENV === 'production';
  const mode = process.env.CMS_CSP_MODE || (prod ? 'enforce' : 'report-only');
  if (mode === 'enforce') res.setHeader('Content-Security-Policy', CSP_POLICY);
  else if (mode === 'report-only') res.setHeader('Content-Security-Policy-Report-Only', CSP_POLICY);
  if (process.env.CMS_HSTS === '1') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});
app.use('/uploads', express.static(uploadDir, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
app.use('/api/ai', aiRouter);
// ARCH-01: extracted routers (system: health/sync/stats/sitemap; search: global search)
app.use(systemRouter);
app.use('/api/search', searchRouter);

type Auth = express.Request & { user?: { id:number; role:string } };
const auth = (req:Auth,res:express.Response,next:express.NextFunction) => {
  // SEC-05: httpOnly cookie first, Bearer fallback (scripts/transition).
  const bearer = req.headers.authorization?.replace('Bearer ','');
  const token = bearer || parseCookies(req)['cms_token'] || '';
  (req as any).cookieAuth = !bearer && !!parseCookies(req)['cms_token'];
  try { req.user = jwt.verify(token || '', secret) as {id:number;role:string}; const row = db.prepare('SELECT id, role, site_id FROM users WHERE id=? AND disabled=0').get((req.user as any).id) as any; if (!row) return res.status(401).json({ error:'Unauthorized' }); (req as any).scoped = { id: row.id, role: row.role, site_id: row.site_id || null }; next(); } catch { res.status(401).json({ error:'Unauthorized' }); } };
// Site scope of the current admin user: null = full access (super_admin or portal-wide),
// object = restricted to one court site, 'DENIED' = unknown site.
const scopeOf = (req:Auth): Scope | null | 'DENIED' => {
  const s = (req as any).scoped as { role:string; site_id:string|null } | undefined;
  if (!s || s.role === 'super_admin' || s.site_id == null) return null;
  const c = COURT_SCOPES[s.site_id];
  return c ? { site: s.site_id, region: c.region, courtName: c.courtName } : 'DENIED';
};
// Blocks site-scoped users from portal-wide admin endpoints.
const denyScoped = (req:Auth,res:express.Response): boolean => {
  const s = (req as any).scoped as { role:string; site_id:string|null } | undefined;
  if (s && s.role !== 'super_admin' && s.site_id != null) { res.status(403).json({ error:'Forbidden' }); return true; }
  return false;
};
const requireSuper = (req:Auth,res:express.Response,next:express.NextFunction) => {
  const s = (req as any).scoped as { role:string } | undefined;
  if (!s || s.role !== 'super_admin') return res.status(403).json({ error:'Forbidden' });
  next();
};
const audit = (userId:number|undefined, action:string, type:string, id?:number) => db.prepare('INSERT INTO audit_log(user_id,action,object_type,object_id) VALUES(?,?,?,?)').run(userId || null, action, type, id || null);
// Login brute-force guard (SEC-02): shared sliding-window limiter, 10 req / 15 min / IP.
app.post('/api/admin/auth/login', loginLimiter(), (req,res) => { const parsed=z.object({email:z.string().email(),password:z.string().min(8)}).safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'Invalid credentials'}); const user=db.prepare('SELECT * FROM users WHERE email=? AND disabled=0').get(parsed.data.email) as any; if(!user || !bcrypt.compareSync(parsed.data.password,user.password_hash)) return res.status(401).json({error:'Invalid credentials'}); const token=jwt.sign({id:user.id,role:user.role,site_id:user.site_id || null},secret,{expiresIn:'8h'}); audit(user.id,'login','user',user.id); res.cookie('cms_token', token, cookieOpts(req)); res.json({token,user:{id:user.id,name:user.name,role:user.role,site_id:user.site_id || null}}); });
app.post('/api/admin/auth/logout', auth, (req:Auth,res) => { audit(req.user!.id,'logout','user',req.user!.id); res.clearCookie('cms_token', { path: '/' }); res.json({ ok: true }); });
app.get('/api/admin/auth/me', auth, (req:Auth,res) => { const s=(req as any).scoped; const row=db.prepare('SELECT id,email,name,role,site_id FROM users WHERE id=?').get(s.id) as any; if(!row) return res.status(401).json({error:'Unauthorized'}); res.json({ ...row, permissions: permissionsFor(row.role) }); });
// User management (super_admin only) — includes per-site access (site_id)
app.get('/api/admin/users', auth, requirePerm('users.manage'), (_req,res) => res.json(db.prepare('SELECT id,email,name,role,site_id,disabled,created_at FROM users ORDER BY created_at DESC').all()));
app.post('/api/admin/users', auth, requirePerm('users.manage'), (req:Auth,res) => {
  const p=z.object({email:z.string().email(),password:z.string().min(8),name:z.string().min(2).max(160),role:z.enum(['super_admin','admin','editor','reviewer']).default('editor'),site_id:z.string().max(64).nullable().optional(),disabled:z.union([z.literal(0),z.literal(1)]).optional()}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Invalid user', details:p.error});
  const x=p.data;
  try {
    const result=db.prepare('INSERT INTO users(email,password_hash,name,role,site_id,disabled) VALUES(?,?,?,?,?,?)').run(x.email, bcrypt.hashSync(x.password,12), x.name, x.role, x.site_id || null, x.disabled ?? 0);
    audit((req as any).scoped.id,'create','user',Number(result.lastInsertRowid));
    res.status(201).json({id:result.lastInsertRowid});
  } catch { res.status(409).json({error:'Email already exists'}); }
});
app.patch('/api/admin/users/:id', auth, requirePerm('users.manage'), (req:Auth,res) => {
  const p=z.object({name:z.string().min(2).max(160).optional(),role:z.enum(['super_admin','admin','editor','reviewer']).optional(),site_id:z.string().max(64).nullable().optional(),disabled:z.union([z.literal(0),z.literal(1)]).optional(),password:z.string().min(8).optional()}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Invalid user', details:p.error});
  const x=p.data;
  const sets:string[]=[]; const vals:any[]=[];
  if(x.name!==undefined){sets.push('name=?');vals.push(x.name);}
  if(x.role!==undefined){sets.push('role=?');vals.push(x.role);}
  if(x.site_id!==undefined){sets.push('site_id=?');vals.push(x.site_id);}
  if(x.disabled!==undefined){sets.push('disabled=?');vals.push(x.disabled);}
  if(x.password!==undefined){sets.push('password_hash=?');vals.push(bcrypt.hashSync(x.password,12));}
  if(sets.length===0)return res.status(400).json({error:'Nothing to update'});
  vals.push(req.params.id);
  db.prepare(`UPDATE users SET ${sets.join(',')} WHERE id=?`).run(...vals);
  audit((req as any).scoped.id,'update','user',Number(req.params.id));
  res.sendStatus(204);
});

// Media endpoints (multer 2.x: file arrives as a stream + sniffed mime)
const ALLOWED_UPLOAD_MIME = /^(image\/(png|jpeg|webp|gif)|application\/pdf|video\/(mp4|webm)|audio\/(mpeg|mp4))$/;
const ALLOWED_UPLOAD_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf', '.mp4', '.webm', '.mp3'];
app.post('/api/admin/media', auth, requirePerm('media.manage'), upload.single('file'), (req:Auth, res) => {
  if (denyScoped(req,res)) return;
  const f = (req as any).file;
  if (!f || !f.stream) return res.status(400).json({ error: 'No file uploaded' });
  const chunks: Buffer[] = [];
  f.stream.on('data', (c: any) => chunks.push(Buffer.from(c)));
  f.stream.on('error', () => { if (!res.headersSent) res.status(400).json({ error: 'Upload failed' }); });
  f.stream.on('end', () => {
    if (res.headersSent) return;
    const buf = Buffer.concat(chunks);
    const detected = f.detectedMimeType ? String(f.detectedMimeType) : '';
    const ext = String(f.detectedFileExtension || path.extname(f.originalName || '') || '').toLowerCase();
    if (!ALLOWED_UPLOAD_MIME.test(detected) || !ALLOWED_UPLOAD_EXT.includes(ext)) {
      return res.status(415).json({ error: 'Unsupported file type' });
    }
    const stem = (path.basename(f.originalName || 'file', ext).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-100) || 'file');
    const filename = `${Date.now()}-${stem}${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buf);
    const result = db.prepare('INSERT INTO media (filename, original_name, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?)').run(filename, f.originalName, detected, buf.length, req.user!.id);
    audit(req.user!.id, 'upload', 'media', Number(result.lastInsertRowid));
    res.status(201).json({ id: result.lastInsertRowid, filename, url: `/uploads/${filename}` });
  });
});
app.get('/api/admin/media', auth, (req:Auth, res) => { if (denyScoped(req,res)) return; res.json(db.prepare('SELECT * FROM media ORDER BY created_at DESC').all()); });

// Site sync epoch: bumped on every admin mutation so open site tabs
// (main portal + court sites) can pull fresh data within seconds.
let SYNC_EPOCH = Date.now();
const bumpSync = () => { SYNC_EPOCH = Date.now(); };
export const getSyncEpoch = () => SYNC_EPOCH;
app.use('/api/admin', (req, _res, next) => {
  if (req.path.includes('/auth/')) return next();
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  bumpSync();
  next();
});


// Content
app.get('/api/news', cache(60), (req,res) => {
  const region = String(req.query.region || 'all');
  if (region === 'all') return res.json(db.prepare("SELECT c.id,c.slug,c.title_ru,c.title_tj,c.title_en,c.excerpt_ru,c.excerpt_tj,c.excerpt_en,c.body_ru,c.body_tj,c.body_en,c.published_at,c.region, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type='news' AND c.status='published' AND c.deleted_at IS NULL ORDER BY c.published_at DESC").all());
  return res.json(db.prepare("SELECT c.id,c.slug,c.title_ru,c.title_tj,c.title_en,c.excerpt_ru,c.excerpt_tj,c.excerpt_en,c.body_ru,c.body_tj,c.body_en,c.published_at,c.region, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type='news' AND c.status='published' AND c.deleted_at IS NULL AND c.region=? ORDER BY c.published_at DESC").all(region));
});
const contentList = (type: string) => db.prepare("SELECT c.id,c.slug,c.title_ru,c.title_tj,c.title_en,c.excerpt_ru,c.excerpt_tj,c.excerpt_en,c.body_ru,c.body_tj,c.body_en,c.published_at,c.region,c.expires_at, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type=? AND c.status='published' AND c.deleted_at IS NULL ORDER BY c.published_at DESC").all(type);
app.get('/api/announcements', cache(60), (req,res) => {
  const region = String(req.query.region || 'all');
  if (region === 'all') return res.json(contentList('announcement'));
  return res.json(db.prepare("SELECT c.id,c.slug,c.title_ru,c.title_tj,c.title_en,c.excerpt_ru,c.excerpt_tj,c.excerpt_en,c.body_ru,c.body_tj,c.body_en,c.published_at,c.region,c.expires_at, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type='announcement' AND c.status='published' AND c.deleted_at IS NULL AND c.region=? ORDER BY c.published_at DESC").all(region));
});
app.get('/api/vacancies', cache(60), (_req,res) => res.json(contentList('vacancy')));
app.get('/api/journal', cache(300), (_req,res) => res.json(contentList('journal')));
app.get('/api/content/:type/:slug', cache(120), (req,res) => {
  const allowed = ['news','announcement','vacancy','journal','page','act'];
  if (!allowed.includes(req.params.type)) return res.status(404).json({ error:'Not found' });
  const row = db.prepare("SELECT c.id,c.slug,c.type,c.title_ru,c.title_tj,c.title_en,c.excerpt_ru,c.excerpt_tj,c.excerpt_en,c.body_ru,c.body_tj,c.body_en,c.published_at,c.region, m.filename as cover_image FROM content c LEFT JOIN media m ON c.cover_image_id = m.id WHERE c.type=? AND c.slug=? AND c.status='published' AND c.deleted_at IS NULL").get(req.params.type, req.params.slug);
  if (!row) return res.status(404).json({ error:'Not found' });
  res.json(row);
});

app.post('/api/questionnaire', questionnaireLimiter(), (req,res) => { const p=z.object({name:z.string().min(2).max(120),phone:z.string().max(40).optional(),topic:z.string().max(120).optional(),rating:z.number().int().min(1).max(5).optional(),message:z.string().max(2000).optional()}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid questionnaire'}); const row=db.prepare('INSERT INTO questionnaire_responses(name,phone,topic,rating,message) VALUES(?,?,?,?,?)').run(p.data.name,p.data.phone||null,p.data.topic||null,p.data.rating??null,p.data.message||null); res.status(201).json({id:row.lastInsertRowid,status:'received'}); });
app.post('/api/appeals', appealsLimiter(), (req,res) => { const p=z.object({fullName:z.string().min(2).max(160),phone:z.string().min(5).max(40),email:z.string().email().optional().or(z.literal('')),subject:z.string().max(200).optional(),message:z.string().min(10).max(5000)}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid appeal'}); const row=db.prepare('INSERT INTO appeals(full_name,phone,email,subject,message) VALUES(?,?,?,?,?)').run(p.data.fullName,p.data.phone,p.data.email || null,p.data.subject || null,p.data.message); res.status(201).json({id:row.lastInsertRowid,status:'new'}); });
// Editor helpers: auto-translation + magic judicial press composer (admin only)
const getSetting = (key: string, fallback = '1'): string => {
  try {
    const row = db.prepare('SELECT "value" FROM settings WHERE "key"=?').get(key) as any;
    return row ? String(row.value) : fallback;
  } catch { return fallback; }
};
app.get('/api/admin/settings', auth, (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const rows = db.prepare('SELECT "key", "value" FROM settings').all() as any[];
  const out: Record<string, string> = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  res.json(out);
});
app.post('/api/admin/settings', auth, requirePerm('settings.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const p = z.object({ key: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/), value: z.string().max(5000) }).safeParse(req.body || {});
  if (!p.success) return res.status(400).json({ error: 'Invalid setting' });
  db.prepare('INSERT INTO settings("key", "value") VALUES(?, ?) ON CONFLICT("key") DO UPDATE SET "value"=excluded."value"').run(p.data.key, p.data.value);
  audit((req as any).scoped.id, 'update', 'setting', undefined);
  res.json({ ok: true });
});
app.post('/api/editor/translate', auth, editorLimiter(), async (req:Auth,res) => {
  if (getSetting('ai_translate_enabled') === '0') return res.status(403).json({error:'Auto translation disabled'});
  const p=z.object({text:z.string().min(1).max(15000),from:z.string().max(8),to:z.string().max(8)}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid request'});
  try { res.json({ text: await translateText(p.data.text, p.data.from, p.data.to) }); }
  catch (e:any) { res.status(502).json({ error:'Translation unavailable', details: String(e?.message || e) }); }
});
app.post('/api/editor/magic', auth, editorLimiter(), async (req:Auth,res) => {
  const p=z.object({mode:z.enum(['generate','improve','formal','shorten','expand','rewrite','official']),text:z.string().min(1).max(8000),lang:z.enum(['tj','ru','en']).optional(),pubType:z.string().max(64).optional(),length:z.enum(['short','medium','full']).optional(),context:z.string().max(2000).optional(),variant:z.number().int().min(0).max(9).optional()}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid request'});
  if (denyScoped(req,res)) return;
  if (p.data.mode === 'generate' && getSetting('ai_writer_enabled') === '0') return res.status(403).json({error:'AI Writer disabled'});
  if (p.data.mode !== 'generate' && getSetting('ai_improve_enabled') === '0') return res.status(403).json({error:'AI Improve disabled'});
  const maxLen = Math.min(8000, Math.max(200, parseInt(getSetting('ai_max_length', '2000'), 10) || 2000));
  const clipped = p.data.text.slice(0, maxLen);
  const lang = p.data.lang || detectLang(clipped);
  const opts = { pubType: p.data.pubType, length: p.data.length, context: p.data.context, variant: p.data.variant || 0 };
  const out = p.data.mode === 'generate'
    ? magicGenerate(clipped, lang, opts)
    : magicTransform(clipped, lang, p.data.mode, opts.variant || 0);
  res.json({ ...out, lang });
});
app.get('/api/admin/appeals', auth, (req:Auth,res) => { if (denyScoped(req,res)) return; const q = req.query as any; const where:string[]=[]; const vals:any[]=[]; if (q.status) { where.push('status=?'); vals.push(String(q.status)); } const sql = `SELECT * FROM appeals${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`; const items = db.prepare(sql).all(...vals); return res.json({ items, total: items.length }); });
app.patch('/api/admin/appeals/:id', auth, requirePerm('appeals.manage'), (req:Auth,res) => { if (denyScoped(req,res)) return; const p=z.object({status:z.enum(['new','in_review','assigned','answered','closed']).optional(),internal_note:z.string().max(5000).nullable().optional(),assigned_to:z.number().int().nullable().optional()}).safeParse(req.body || {}); if(!p.success)return res.status(400).json({error:'Invalid appeal', details: p.error}); const x=p.data; const sets:string[]=[]; const vals:any[]=[]; if(x.status!==undefined){sets.push('status=?');vals.push(x.status);} if(x.internal_note!==undefined){sets.push('internal_note=?');vals.push(x.internal_note);} if(x.assigned_to!==undefined){sets.push('assigned_to=?');vals.push(x.assigned_to);} if(sets.length===0)return res.status(400).json({error:'Nothing to update'}); vals.push(req.params.id); db.prepare(`UPDATE appeals SET ${sets.join(',')} WHERE id=?`).run(...vals); audit(req.user!.id,'update','appeal',Number(req.params.id)); res.sendStatus(204); });
  app.get('/api/admin/dashboard', auth, (req:Auth,res) => { if (denyScoped(req,res)) return; return res.json({ news:db.prepare("SELECT count(*) count FROM content WHERE type='news' AND deleted_at IS NULL").get(), pending:db.prepare("SELECT count(*) count FROM content WHERE status='pending_review'").get(), appeals:db.prepare("SELECT count(*) count FROM appeals WHERE status='new'").get(), activity:db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 8').all() }); });
  app.get('/api/admin/audit', auth, (req:Auth,res) => {
    if (denyScoped(req,res)) return;
    const items = db.prepare('SELECT a.*,u.name as user_name FROM audit_log a LEFT JOIN users u ON a.user_id=u.id ORDER BY a.created_at DESC LIMIT 200').all();
    return res.json({ items, total: items.length });
  });
app.get('/api/admin/content', auth, (req:Auth,res) => {
  const sc = scopeOf(req);
  if (sc === 'DENIED') return res.status(403).json({error:'Forbidden'});
  const q = req.query as any;
  const where: string[] = ['deleted_at IS NULL'];
  const vals: any[] = [];
  if (sc) { where.push('region=?'); vals.push(sc.region); }
  else if (q.region) { where.push('region=?'); vals.push(String(q.region)); }
  if (q.type) { where.push('type=?'); vals.push(String(q.type)); }
  let status = String(q.status || '');
  if (status === 'pending') status = 'pending_review';
  if (status) { where.push('status=?'); vals.push(status); }
  if (q.search) { where.push('(title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR slug LIKE ?)'); const like = '%' + String(q.search) + '%'; vals.push(like, like, like, like); }
  const sql = `SELECT * FROM content WHERE ${where.join(' AND ')} ORDER BY updated_at DESC`;
  const items = db.prepare(sql).all(...vals);
  return res.json({ items, total: items.length });
});
app.get('/api/admin/content/:id', auth, (req:Auth,res) => {
  const row = db.prepare('SELECT * FROM content WHERE id=? AND deleted_at IS NULL').get(req.params.id) as any;
  if (!row) return res.status(404).json({error:'Not found'});
  const sc = scopeOf(req);
  if (sc === 'DENIED') return res.status(403).json({error:'Forbidden'});
  if (sc && row.region !== sc.region) return res.status(403).json({error:'Forbidden'});
  return res.json(row);
});
const contentStatus = z.enum(['draft','pending','pending_review','approved','rejected','published','archived','scheduled']);
const normStatus = (s: string) => (s === 'pending' ? 'pending_review' : s);
// Normalize any parseable datetime to UTC ISO so lexicographic comparisons in SQLite stay correct
const normDateTime = (v: any) => {
  if (v == null || v === '') return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? String(v) : d.toISOString();
};
app.post('/api/admin/content', auth, requirePerm('content.create'), (req:Auth,res) => { const b = req.body || {}; const p=z.object({type:z.enum(['news','page','act','announcement','vacancy','journal']),slug:z.string().regex(/^[a-z0-9-]+$/),titleRu:z.string().min(2).optional(),title_ru:z.string().min(2).optional(),titleTj:z.string().optional(),title_tj:z.string().optional(),titleEn:z.string().optional(),title_en:z.string().optional(),bodyRu:z.string().optional(),body_ru:z.string().optional(),bodyTj:z.string().optional(),body_tj:z.string().optional(),bodyEn:z.string().optional(),body_en:z.string().optional(),excerptRu:z.string().optional(),excerpt_ru:z.string().optional(),excerptTj:z.string().optional(),excerpt_tj:z.string().optional(),excerptEn:z.string().optional(),excerpt_en:z.string().optional(),region:z.string().max(64).optional(),ai_meta:z.record(z.string(),z.any()).optional(),status:contentStatus.default('draft'), published_at:z.string().optional(), scheduled_at:z.string().optional()}).safeParse(b); if(!p.success)return res.status(400).json({error:'Invalid content', details: p.error}); const sc = scopeOf(req); if(sc === 'DENIED')return res.status(403).json({error:'Forbidden'}); const x=p.data as any; const pick = (...ks:string[]) => { for (const k of ks) { if (x[k] != null && x[k] !== '') return x[k]; } return null; };
  const titleRu = pick('titleRu','title_ru'); if(!titleRu || titleRu.length < 2)return res.status(400).json({error:'Invalid content'});
  const status = normStatus(x.status || 'draft');
  // CMS-01: direct publication/approval on create requires the matching permission.
  const role = (req as any).scoped?.role;
  if ((status==='published' || status==='scheduled') && !hasPerm(role,'content.publish')) return res.status(403).json({error:'Forbidden: publication requires publish permission'});
  if ((status==='approved' || status==='archived') && !hasPerm(role,'content.approve')) return res.status(403).json({error:'Forbidden: approval requires approve permission'});
  const region = sc ? sc.region : (x.region || null);
  const pubAt = status==='published' ? (normDateTime(x.published_at) || new Date().toISOString()) : (status==='scheduled' ? (normDateTime(x.scheduled_at) || normDateTime(x.published_at)) : null);
  const result=db.prepare('INSERT INTO content(type,slug,title_ru,title_tj,title_en,body_ru,body_tj,body_en,excerpt_ru,excerpt_tj,excerpt_en,region,ai_meta,status,published_at,author_id,published_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(x.type,x.slug,titleRu,pick('titleTj','title_tj'),pick('titleEn','title_en'),pick('bodyRu','body_ru'),pick('bodyTj','body_tj'),pick('bodyEn','body_en'),pick('excerptRu','excerpt_ru'),pick('excerptTj','excerpt_tj'),pick('excerptEn','excerpt_en'),region,x.ai_meta ? JSON.stringify(x.ai_meta) : null,status,pubAt,req.user!.id,status==='published' ? req.user!.id : null); audit(req.user!.id,'create',x.type,Number(result.lastInsertRowid)); res.status(201).json({id:result.lastInsertRowid}); });
app.delete('/api/admin/content/:id', auth, requirePerm('content.delete'), (req:Auth,res) => { const sc = scopeOf(req); if(sc === 'DENIED')return res.status(403).json({error:'Forbidden'}); if(sc){ const row = db.prepare('SELECT region FROM content WHERE id=?').get(req.params.id) as any; if(!row || row.region !== sc.region)return res.status(403).json({error:'Forbidden'}); } db.prepare('UPDATE content SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id); audit(req.user!.id,'delete','content',Number(req.params.id)); res.sendStatus(204); });
app.patch('/api/admin/content/:id', auth, (req:Auth,res) => { const sc = scopeOf(req); if(sc === 'DENIED')return res.status(403).json({error:'Forbidden'}); const row = db.prepare('SELECT * FROM content WHERE id=? AND deleted_at IS NULL').get(req.params.id) as any; if(!row)return res.status(404).json({error:'Not found'}); if(sc && row.region !== sc.region)return res.status(403).json({error:'Forbidden'});
  const b = req.body || {};
  const p=z.object({status:contentStatus.optional(),slug:z.string().regex(/^[a-z0-9-]+$/).optional(),titleRu:z.string().min(2).optional(),title_ru:z.string().min(2).optional(),titleTj:z.string().optional(),title_tj:z.string().optional(),titleEn:z.string().optional(),title_en:z.string().optional(),bodyRu:z.string().optional(),body_ru:z.string().optional(),bodyTj:z.string().optional(),body_tj:z.string().optional(),bodyEn:z.string().optional(),body_en:z.string().optional(),excerptRu:z.string().optional(),excerpt_ru:z.string().optional(),excerptTj:z.string().optional(),excerpt_tj:z.string().optional(),excerptEn:z.string().optional(),excerpt_en:z.string().optional(),ai_meta:z.record(z.string(),z.any()).optional(),published_at:z.string().optional(),scheduled_at:z.string().optional(),review_notes:z.string().max(2000).optional()}).safeParse(b); if(!p.success)return res.status(400).json({error:'Invalid content', details: p.error});
  const x=p.data as any; const sets:string[]=[]; const vals:any[]=[];
  const role = (req as any).scoped?.role;
  const hasEdit = hasPerm(role,'content.edit');
  const hasReview = hasPerm(role,'content.review');
  const setCol = (col:string, ...ks:string[]) => { for (const k of ks) { if (x[k] !== undefined) { sets.push(col + '=?'); vals.push(x[k] === '' ? null : x[k]); break; } } };
  // CMS-01: body edits require content.edit (reviewers act on status only).
  const fieldTouched = ['slug','titleRu','title_ru','titleTj','title_tj','titleEn','title_en','bodyRu','body_ru','bodyTj','body_tj','bodyEn','body_en','excerptRu','excerpt_ru','excerptTj','excerpt_tj','excerptEn','excerpt_en','ai_meta','published_at','scheduled_at'].some((k) => x[k] !== undefined);
  if (fieldTouched && !hasEdit) return res.status(403).json({error:'Forbidden: editing requires edit permission'});
  setCol('slug','slug'); setCol('title_ru','titleRu','title_ru'); setCol('title_tj','titleTj','title_tj'); setCol('title_en','titleEn','title_en');
  setCol('body_ru','bodyRu','body_ru'); setCol('body_tj','bodyTj','body_tj'); setCol('body_en','bodyEn','body_en');
  setCol('excerpt_ru','excerptRu','excerpt_ru'); setCol('excerpt_tj','excerptTj','excerpt_tj'); setCol('excerpt_en','excerptEn','excerpt_en');
  if (x.ai_meta && typeof x.ai_meta === 'object') {
    const curRow = db.prepare('SELECT ai_meta FROM content WHERE id=?').get(req.params.id) as any;
    let cur: Record<string, any> = {};
    try { cur = JSON.parse(curRow?.ai_meta || '{}'); } catch { cur = {}; }
    const merged = { ...cur, ...x.ai_meta };
    sets.push('ai_meta=?'); vals.push(JSON.stringify(merged));
  }
  let newStatus: string | null = null;
  if (x.status !== undefined) {
    newStatus = normStatus(x.status);
    const gate = permForContentStatus(newStatus, hasEdit, hasReview);
    if ('error' in gate) return res.status(400).json({error:'Invalid status'});
    if (!hasPerm(role, gate.perm)) return res.status(403).json({error:`Forbidden: ${gate.action} requires ${gate.perm} permission`});
    // CMS-01 lifecycle side-effects
    if (gate.action === 'reject') {
      const reason = String(x.review_notes ?? '').trim();
      if (!reason && !row.review_notes) return res.status(400).json({error:'Rejection reason required'});
      if (reason) { sets.push('review_notes=?'); vals.push(reason); }
      sets.push('reviewed_by=?'); vals.push(req.user!.id);
      sets.push('reviewed_at=CURRENT_TIMESTAMP');
    }
    if (gate.action === 'approve') {
      sets.push('reviewed_by=?'); vals.push(req.user!.id);
      sets.push('reviewed_at=CURRENT_TIMESTAMP');
      if (x.review_notes !== undefined) { sets.push('review_notes=?'); vals.push(x.review_notes || null); }
    }
    if (gate.action === 'publish') {
      // Snapshot current row so the previous published version stays recoverable.
      try {
        const last = db.prepare('SELECT MAX(version_number) as v FROM content_versions WHERE content_id=?').get(req.params.id) as any;
        db.prepare('INSERT INTO content_versions(content_id,version_number,snapshot_data,created_by,commit_message) VALUES(?,?,?,?,?)')
          .run(req.params.id, (last?.v || 0) + 1, JSON.stringify(row), req.user!.id, `Auto pre-publish snapshot (${newStatus})`);
      } catch {}
      sets.push('published_by=?'); vals.push(req.user!.id);
    }
    sets.push('status=?'); vals.push(newStatus);
  } else if (x.review_notes !== undefined) {
    if (!hasReview) return res.status(403).json({error:'Forbidden'});
    sets.push('review_notes=?'); vals.push(x.review_notes || null);
  }
  const pubAt = x.scheduled_at || x.published_at;
  if (pubAt !== undefined) { sets.push('published_at=?'); vals.push(normDateTime(pubAt)); }
  else if (newStatus === 'published') { sets.push("published_at=CASE WHEN published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END"); }
  if (sets.length === 0) return res.status(400).json({error:'Nothing to update'});
  sets.push('updated_at=CURRENT_TIMESTAMP');
  vals.push(req.params.id);
  try { db.prepare(`UPDATE content SET ${sets.join(',')} WHERE id=?`).run(...vals); } catch { return res.status(409).json({error:'Slug already exists'}); }
  audit(req.user!.id,'update','content',Number(req.params.id)); res.sendStatus(204); });

// Courts
app.get('/api/courts', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM courts WHERE active=1').all()));
app.post('/api/admin/courts', auth, requirePerm('courts.manage'), (req:Auth, res) => { if (denyScoped(req,res)) return; const p=z.object({nameRu:z.string().min(2),nameTj:z.string().optional(),nameEn:z.string().optional(),region:z.string(),type:z.string(),address:z.string().optional(),phone:z.string().optional(),lat:z.number().optional(),lng:z.number().optional()}).safeParse(req.body); if(!p.success)return res.status(400).json({error:'Invalid court', details: p.error}); const x=p.data; const result=db.prepare('INSERT INTO courts(name_ru,name_tj,name_en,region,type,address,phone,lat,lng) VALUES(?,?,?,?,?,?,?,?,?)').run(x.nameRu,x.nameTj||null,x.nameEn||null,x.region,x.type,x.address||null,x.phone||null,x.lat||null,x.lng||null); audit(req.user!.id,'create','court',Number(result.lastInsertRowid)); res.status(201).json({id:result.lastInsertRowid}); });

// Judicial Acts
app.get('/api/judicial_acts', cache(300), (_req, res) => res.json(db.prepare("SELECT * FROM judicial_acts WHERE status='published' ORDER BY published_at DESC").all()));
// Judicial acts admin CRUD (portal-level)
app.get('/api/admin/judicial-acts', auth, (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const items = db.prepare('SELECT * FROM judicial_acts ORDER BY created_at DESC').all();
  return res.json({ items, total: items.length });
});
app.post('/api/admin/judicial-acts', auth, requirePerm('acts.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const p=z.object({doc_number:z.string().max(64).optional(),doc_type:z.string().max(64).optional(),title_ru:z.string().min(2),title_tj:z.string().optional(),title_en:z.string().optional(),collegium:z.string().max(160).optional(),case_number:z.string().max(64).optional(),act_date:z.string().max(32).optional(),category:z.string().max(120).optional(),file_path:z.string().max(500).optional(),status:z.enum(['draft','published','archived']).default('draft'),published_at:z.string().optional()}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid act', details: p.error});
  const x=p.data;
  const pubAt = x.status==='published' ? (normDateTime(x.published_at) || new Date().toISOString()) : null;
  const result=db.prepare('INSERT INTO judicial_acts(title_ru,title_tj,title_en,doc_number,doc_type,collegium,case_number,act_date,category,file_path,status,published_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(x.title_ru,x.title_tj||null,x.title_en||null,x.doc_number||null,x.doc_type||null,x.collegium||null,x.case_number||null,x.act_date||null,x.category||null,x.file_path||null,x.status,pubAt);
  audit(req.user!.id,'create','judicial_act',Number(result.lastInsertRowid));
  res.status(201).json({id:result.lastInsertRowid});
});
app.patch('/api/admin/judicial-acts/:id', auth, requirePerm('acts.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const p=z.object({doc_number:z.string().max(64).optional(),doc_type:z.string().max(64).optional(),title_ru:z.string().min(2).optional(),title_tj:z.string().optional(),title_en:z.string().optional(),collegium:z.string().max(160).optional(),case_number:z.string().max(64).optional(),act_date:z.string().max(32).optional(),category:z.string().max(120).optional(),file_path:z.string().max(500).nullable().optional(),status:z.enum(['draft','published','archived']).optional(),published_at:z.string().optional()}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid act', details: p.error});
  const x=p.data as any; const sets:string[]=[]; const vals:any[]=[];
  for (const col of ['doc_number','doc_type','title_ru','title_tj','title_en','collegium','case_number','act_date','category','file_path']) {
    if (x[col] !== undefined) { sets.push(col + '=?'); vals.push(x[col] === '' ? null : x[col]); }
  }
  if (x.status !== undefined) {
    sets.push('status=?'); vals.push(x.status);
    if (x.status === 'published') sets.push("published_at=COALESCE(?,published_at,CURRENT_TIMESTAMP)");
    else sets.push('published_at=?');
    vals.push(x.published_at ? normDateTime(x.published_at) : null);
  } else if (x.published_at !== undefined) { sets.push('published_at=?'); vals.push(normDateTime(x.published_at)); }
  if (sets.length === 0) return res.status(400).json({error:'Nothing to update'});
  vals.push(req.params.id);
  db.prepare(`UPDATE judicial_acts SET ${sets.join(',')} WHERE id=?`).run(...vals);
  audit(req.user!.id,'update','judicial_act',Number(req.params.id));
  res.sendStatus(204);
});
app.delete('/api/admin/judicial-acts/:id', auth, requirePerm('acts.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  db.prepare('DELETE FROM judicial_acts WHERE id=?').run(req.params.id);
  audit(req.user!.id,'delete','judicial_act',Number(req.params.id));
  res.sendStatus(204);
});

// Shelf Books (legislation bookshelf, portal-level)
// Library writes require library.manage (SEC-01); viewers/court managers read.
const SHELF_PUBLIC_COLS = 'id,title_ru,title_tj,title_en,url,url_ru,url_tj,url_en,badge,kind,cover_theme,cover_text,cover_emblem,cover_bg,cover_image,sort_order,is_visible,source_url,doc_lang,updated_at';
app.get('/api/shelf-books', cache(300), (_req, res) => res.json(db.prepare(`SELECT ${SHELF_PUBLIC_COLS} FROM shelf_books WHERE is_visible=1 ORDER BY sort_order, id`).all()));
app.get('/api/shelf-books/:id', cache(300), (req, res) => {
  const row = db.prepare('SELECT * FROM shelf_books WHERE id=? AND is_visible=1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});
app.get('/api/admin/shelf-books', auth, (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const items = db.prepare(`SELECT ${SHELF_PUBLIC_COLS},created_at FROM shelf_books ORDER BY sort_order, id`).all();
  return res.json({ items, total: items.length });
});
app.post('/api/admin/shelf-books', auth, requirePerm('library.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;

  const p=z.object({title_ru:z.string().min(2),title_tj:z.string().optional(),title_en:z.string().optional(),url:z.string().max(1000).optional(),url_ru:z.string().max(1000).optional(),url_tj:z.string().max(1000).optional(),url_en:z.string().max(1000).optional(),badge:z.string().max(32).optional(),kind:z.enum(['constitution','code','law','document','quote','other']).optional(),content:z.string().max(5000000).optional(),content_ru:z.string().max(5000000).optional(),content_tj:z.string().max(5000000).optional(),content_en:z.string().max(5000000).optional(),doc_lang:z.enum(['tj','ru','en','multi','auto']).optional(),source_url:z.string().max(1000).optional(),cover_text:z.string().max(300).optional(),cover_emblem:z.string().max(32).optional(),cover_bg:z.string().max(120).optional(),cover_image:z.string().max(1000).optional(),cover_theme:z.number().int().min(0).max(9).default(0),sort_order:z.number().int().default(0),is_visible:z.number().int().min(0).max(1).default(1)}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid book', details: p.error});
  const x=p.data as any;
  // Back-compat: if legacy content/url provided without lang-specific, distribute by doc_lang
  let cr = x.content_ru ?? null, ct = x.content_tj ?? null, ce = x.content_en ?? null;
  const legacy = x.content ?? null;
  if (legacy && !cr && !ct && !ce) {
    if (x.doc_lang === 'tj') ct = legacy;
    else if (x.doc_lang === 'en') ce = legacy;
    else if (x.doc_lang === 'ru') cr = legacy;
    else cr = legacy; // default ru
  }
  const fallbackContent = cr || ct || ce || legacy || null;
  let urlRu = x.url_ru ?? null, urlTj = x.url_tj ?? null, urlEn = x.url_en ?? null;
  const legacyUrl = x.url ?? null;
  if (legacyUrl && !urlRu && !urlTj && !urlEn) {
    if (x.doc_lang === 'tj') urlTj = legacyUrl;
    else if (x.doc_lang === 'en') urlEn = legacyUrl;
    else if (x.doc_lang === 'ru') urlRu = legacyUrl;
    else urlRu = legacyUrl;
  }
  const fallbackUrl = urlRu || urlTj || urlEn || legacyUrl || null;
  const result=db.prepare('INSERT INTO shelf_books(title_ru,title_tj,title_en,url,url_ru,url_tj,url_en,badge,kind,content,content_ru,content_tj,content_en,doc_lang,source_url,cover_text,cover_emblem,cover_bg,cover_image,cover_theme,sort_order,is_visible) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(x.title_ru,x.title_tj||null,x.title_en||null,fallbackUrl,urlRu,urlTj,urlEn,x.badge||'PDF',x.kind||null,fallbackContent,cr,ct,ce,x.doc_lang||null,x.source_url||null,x.cover_text||null,x.cover_emblem||null,x.cover_bg||null,x.cover_image||null,x.cover_theme,x.sort_order,x.is_visible);
  audit(req.user!.id,'create','shelf_book',Number(result.lastInsertRowid));
  res.status(201).json({id:result.lastInsertRowid});
});
app.post('/api/admin/shelf-books/seed', auth, requirePerm('library.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;

  const p=z.object({items:z.array(z.object({title_ru:z.string().min(1),title_tj:z.string().optional(),title_en:z.string().optional(),url:z.string().max(1000).optional(),badge:z.string().max(32).optional()})).max(200)}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid seed', details: p.error});
  const existing = new Set((db.prepare('SELECT url FROM shelf_books WHERE url IS NOT NULL').all() as any[]).map((r) => r.url));
  const stmt = db.prepare('INSERT INTO shelf_books(title_ru,title_tj,title_en,url,badge,cover_theme,sort_order,is_visible) VALUES(?,?,?,?,?,?,?,?)');
  let inserted = 0;
  p.data.items.forEach((b, i) => {
    if (b.url && existing.has(b.url)) return;
    stmt.run(b.title_ru, b.title_tj||null, b.title_en||null, b.url||null, b.badge||'PDF', i % 5, (db.prepare('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM shelf_books').get() as any).n, 1);
    inserted++;
  });
  audit(req.user!.id,'seed','shelf_book',inserted);
  res.status(201).json({ inserted });
});
app.patch('/api/admin/shelf-books/:id', auth, requirePerm('library.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;

  const p=z.object({title_ru:z.string().min(2).optional(),title_tj:z.string().nullable().optional(),title_en:z.string().nullable().optional(),url:z.string().max(1000).nullable().optional(),url_ru:z.string().max(1000).nullable().optional(),url_tj:z.string().max(1000).nullable().optional(),url_en:z.string().max(1000).nullable().optional(),badge:z.string().max(32).nullable().optional(),kind:z.enum(['constitution','code','law','document','quote','other']).nullable().optional(),content:z.string().max(5000000).nullable().optional(),content_ru:z.string().max(5000000).nullable().optional(),content_tj:z.string().max(5000000).nullable().optional(),content_en:z.string().max(5000000).nullable().optional(),doc_lang:z.enum(['tj','ru','en','multi','auto']).nullable().optional(),source_url:z.string().max(1000).nullable().optional(),cover_text:z.string().max(300).nullable().optional(),cover_emblem:z.string().max(32).nullable().optional(),cover_bg:z.string().max(120).nullable().optional(),cover_image:z.string().max(1000).nullable().optional(),cover_theme:z.number().int().min(0).max(9).optional(),sort_order:z.number().int().optional(),is_visible:z.number().int().min(0).max(1).optional()}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid book', details: p.error});
  const x=p.data as any; const sets:string[]=[]; const vals:any[]=[];
  for (const col of ['title_ru','title_tj','title_en','url','url_ru','url_tj','url_en','badge','kind','content','content_ru','content_tj','content_en','doc_lang','source_url','cover_text','cover_emblem','cover_bg','cover_image','cover_theme','sort_order','is_visible']) {
    if (x[col] !== undefined) { sets.push(col + '=?'); vals.push(x[col] === '' ? null : x[col]); }
  }
  if (sets.length === 0) return res.status(400).json({error:'Nothing to update'});
  sets.push('updated_at=CURRENT_TIMESTAMP');
  vals.push(req.params.id);
  db.prepare(`UPDATE shelf_books SET ${sets.join(',')} WHERE id=?`).run(...vals);
  audit(req.user!.id,'update','shelf_book',Number(req.params.id));
  res.sendStatus(204);
});
app.delete('/api/admin/shelf-books/:id', auth, requirePerm('library.manage'), (req:Auth,res) => {
  if (denyScoped(req,res)) return;

  db.prepare('DELETE FROM shelf_books WHERE id=?').run(req.params.id);
  audit(req.user!.id,'delete','shelf_book',Number(req.params.id));
  res.sendStatus(204);
});
app.get('/api/admin/shelf-books/:id', auth, (req:Auth,res) => {
  if (denyScoped(req,res)) return;
  const row = db.prepare('SELECT * FROM shelf_books WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});
// Proxy remote PDFs through the server (browser CORS blocks direct
// fetching from official portals). Host allowlist only - not an open proxy.
const LIB_PDF_HOSTS = ['sud.tj', 'www.sud.tj', 'president.tj', 'www.president.tj', 'adliya.tj', 'www.adliya.tj', 'qonunguzori.tj', 'www.qonunguzori.tj'];
app.get('/api/library/pdf', async (req, res) => {
  const u = String(req.query.url || '');
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return res.status(400).json({ error: 'Bad url' });
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return res.status(400).json({ error: 'Bad url' });
  if (!LIB_PDF_HOSTS.includes(parsed.hostname.toLowerCase())) return res.status(403).json({ error: 'Host not allowed' });
  try {
    const data = await fetchCapped(u, { timeoutMs: 90000, maxBytes: 50 * 1024 * 1024 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(data);
  } catch (e: any) {
    res.status(502).json({ error: 'Fetch failed', details: String(e?.message || e).slice(0, 200) });
  }
});
// Import full text of a legislation document by URL (official portals
// allowlist only, e.g. adliya.tj). Cross-platform fetch (IPv4-first DNS).
app.post('/api/admin/library/import', auth, requirePerm('library.manage'), async (req:Auth,res) => {
  if (denyScoped(req,res)) return;

  const p=z.object({bookId:z.number().int(),sourceUrl:z.string().max(1000)}).safeParse(req.body || {});
  if(!p.success)return res.status(400).json({error:'Invalid import', details: p.error});
  let parsed: URL;
  try {
    parsed = new URL(p.data.sourceUrl);
  } catch {
    return res.status(400).json({ error: 'Bad url' });
  }
  if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || !LIB_PDF_HOSTS.includes(parsed.hostname.toLowerCase())) {
    return res.status(403).json({ error: 'Host not allowed' });
  }
  try {
    const url = parsed.toString();
    const html = await fetchCapped(url, { timeoutMs: 90000, maxBytes: 32 * 1024 * 1024 });
    const text = cleanImportedText(html.toString('utf8'));
    if (text.length < 500) return res.status(422).json({ error: 'Document text too short or unreachable', gotBytes: html.length, gotChars: text.length });
    // Fill legacy content + all lang variants so language switch works even if doc was imported before multilingual support
    db.prepare('UPDATE shelf_books SET content=?, content_ru=COALESCE(content_ru, ?), content_tj=COALESCE(content_tj, ?), content_en=COALESCE(content_en, ?), source_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(text, text, text, text, url, p.data.bookId);
    audit(req.user!.id,'import','shelf_book',Number(p.data.bookId));
    bumpSync();
    res.json({ chars: text.length });
  } catch (e:any) {
    res.status(502).json({ error: 'Import failed', details: String(e?.message || e).slice(0, 300) });
  }
});
// Library file storage: data/library/<kind>/ (books, laws, documents, quotes...)
const libraryDir = path.join(dataDir, 'library');
fs.mkdirSync(libraryDir, { recursive: true });
app.use('/library-files', express.static(libraryDir, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
const LIBRARY_UPLOAD_MIME = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain|text\/markdown|image\/(png|jpeg|webp|gif))$/;
const LIBRARY_UPLOAD_EXT = ['.pdf', '.doc', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
app.post('/api/admin/library/upload', auth, requirePerm('library.manage'), libraryUpload.single('file'), (req:Auth, res) => {
  if (denyScoped(req,res)) return;

  const f = (req as any).file;
  if (!f || !f.stream) return res.status(400).json({ error: 'No file uploaded' });
  const chunks: Buffer[] = [];
  f.stream.on('data', (c: any) => chunks.push(Buffer.from(c)));
  f.stream.on('error', () => { if (!res.headersSent) res.status(400).json({ error: 'Upload failed' }); });
  f.stream.on('end', () => {
    if (res.headersSent) return;
    const buf = Buffer.concat(chunks);
    const detected = f.detectedMimeType ? String(f.detectedMimeType) : '';
    const ext = String(f.detectedFileExtension || path.extname(f.originalName || '') || '').toLowerCase();
    const kind = ['constitution', 'code', 'law', 'document', 'quote', 'other', 'covers'].includes(String(req.query.kind || '')) ? String(req.query.kind) : 'document';
    const isTextExt = ext === '.txt' || ext === '.md';
    const mimeOk = LIBRARY_UPLOAD_MIME.test(detected) || (isTextExt && (!detected || detected.startsWith('text/')));
    if (!mimeOk || !LIBRARY_UPLOAD_EXT.includes(ext)) {
      return res.status(415).json({ error: 'Unsupported file type' });
    }
    const dir = path.join(libraryDir, kind);
    fs.mkdirSync(dir, { recursive: true });
    const stem = (path.basename(f.originalName || 'file', ext).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-80) || 'file');
    const filename = `${Date.now()}-${stem}${ext}`;
    fs.writeFileSync(path.join(dir, filename), buf);
    audit(req.user!.id, 'upload', 'library_file', undefined);
    res.status(201).json({ url: `/library-files/${kind}/${filename}`, size: buf.length });
  });
});
app.use('/api/admin/library/upload', multerErrors);
app.use('/api/admin/media', multerErrors);

// SEC-04: backup & restore. Persistent data = data/sudtj.sqlite (WAL) +
// data/library + uploads dir. Backups live in data/backups/<name>/ with a
// manifest; retention keeps the newest 5. Redundancy note: copy backups
// off-host (see Project_Snapshot recovery procedure).
const backupDir = path.join(dataDir, 'backups');
fs.mkdirSync(backupDir, { recursive: true });
const BACKUP_KEEP = 5;
const sqlQuote = (p: string) => `'${p.replace(/'/g, "''")}'`;
const sqlIdent = (n: string) => `"${n.replace(/"/g, '""')}"`;
const dirSize = (d: string): number => {
  let total = 0;
  try {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) total += dirSize(p);
      else { try { total += fs.statSync(p).size; } catch {} }
    }
  } catch {}
  return total;
};
app.get('/api/admin/backups', auth, requirePerm('users.manage'), (_req: Auth, res) => {
  if (denyScoped(_req as Auth, res)) return;
  const out: any[] = [];
  try {
    for (const e of fs.readdirSync(backupDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      let manifest: any = null;
      try { manifest = JSON.parse(fs.readFileSync(path.join(backupDir, e.name, 'manifest.json'), 'utf8')); } catch {}
      out.push({ name: e.name, manifest });
    }
  } catch {}
  out.sort((a, b) => (a.name < b.name ? 1 : -1));
  res.json({ items: out, total: out.length });
});
app.post('/api/admin/backup', auth, requirePerm('users.manage'), (req: Auth, res) => {
  if (denyScoped(req, res)) return;
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `backup-${ts}`;
    const dir = path.join(backupDir, name);
    fs.mkdirSync(dir, { recursive: true });
    db.exec(`VACUUM INTO ${sqlQuote(path.join(dir, 'sudtj.sqlite'))}`);
    try { fs.cpSync(uploadDir, path.join(dir, 'uploads'), { recursive: true }); } catch {}
    try { fs.cpSync(libraryDir, path.join(dir, 'library'), { recursive: true }); } catch {}
    const tables: Record<string, number> = {};
    try {
      const names = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
      for (const t of names) {
        try { tables[t.name] = (db.prepare(`SELECT count(*) c FROM ${sqlIdent(t.name)}`).get() as any)?.c ?? 0; } catch {}
      }
    } catch {}
    const manifest = {
      name, createdAt: new Date().toISOString(), createdBy: req.user!.id,
      tables, uploadsBytes: dirSize(uploadDir), libraryBytes: dirSize(libraryDir),
    };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    // Retention: keep newest BACKUP_KEEP backups + 2 newest pre-restore safety copies
    try {
      const dirs = fs.readdirSync(backupDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).filter((n) => n.startsWith('backup-')).sort();
      while (dirs.length > BACKUP_KEEP) {
        const old = dirs.shift()!;
        fs.rmSync(path.join(backupDir, old), { recursive: true, force: true });
      }
      const safeties = fs.readdirSync(backupDir).filter((n) => n.startsWith('pre-restore-') && n.endsWith('.sqlite')).sort();
      while (safeties.length > 2) {
        const old = safeties.shift()!;
        try { fs.rmSync(path.join(backupDir, old), { force: true }); } catch {}
      }
    } catch {}
    audit(req.user!.id, 'backup', 'system', undefined);
    res.status(201).json(manifest);
  } catch (e: any) {
    res.status(500).json({ error: 'Backup failed', details: String(e?.message || e).slice(0, 200) });
  }
});
app.post('/api/admin/restore', auth, requirePerm('users.manage'), (req: Auth, res) => {
  if (denyScoped(req, res)) return;
  const p = z.object({ name: z.string().regex(/^[a-zA-Z0-9_-]+$/) }).safeParse(req.body || {});
  if (!p.success) return res.status(400).json({ error: 'Invalid backup name' });
  const dir = path.join(backupDir, p.data.name);
  const dbFile = path.join(dir, 'sudtj.sqlite');
  if (!dir.startsWith(backupDir) || !fs.existsSync(dbFile)) return res.status(404).json({ error: 'Backup not found' });
  try {
    // 0) Safety copy of the live DB first.
    const safety = path.join(backupDir, `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
    db.exec(`VACUUM INTO ${sqlQuote(safety)}`);
    // 1) Integrity check on a separate read-only handle (never touches live data).
    const chk = new Database(dbFile, { readonly: true });
    const ok = (chk.prepare('PRAGMA integrity_check').get() as any)?.integrity_check === 'ok';
    // Exclude FTS5 virtual table + its shadow tables (rebuilt via triggers/rebuild below).
    const srcTables = chk.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'knowledge_chunks_fts%' AND name NOT LIKE '%_fts_data' AND name NOT LIKE '%_fts_idx' AND name NOT LIKE '%_fts_content' AND name NOT LIKE '%_fts_docsize' AND name NOT LIKE '%_fts_config'").all() as any[];
    chk.close();
    if (!ok) return res.status(422).json({ error: 'Backup integrity check failed' });
    // 2) Atomic table copy inside one transaction (FTS rebuilds via triggers).
    db.exec(`ATTACH DATABASE ${sqlQuote(dbFile)} AS src`);
    try {
      const stmts: string[] = ['BEGIN;'];
      for (const t of srcTables) {
        stmts.push(`DELETE FROM ${sqlIdent(t.name)};`);
        stmts.push(`INSERT INTO ${sqlIdent(t.name)} SELECT * FROM ${sqlIdent('src')}.${sqlIdent(t.name)};`);
      }
      stmts.push('COMMIT;');
      db.exec(stmts.join(''));
      // Best-effort extras (absent when no AUTOINCREMENT / no FTS content).
      try {
        db.exec(
          `INSERT OR REPLACE INTO sqlite_sequence SELECT * FROM ${sqlIdent('src')}.sqlite_sequence`
        );
      } catch {}
      try { db.exec(`INSERT INTO ${sqlIdent('knowledge_chunks_fts')}(${sqlIdent('knowledge_chunks_fts')}) VALUES('rebuild')`); } catch {}
    } catch (e) {
      try { db.exec('ROLLBACK;'); } catch {}
      throw e;
    } finally {
      try { db.exec('DETACH DATABASE src'); } catch {}
    }
    // 3) Files (merge/overwrite; restart recommended after restore).
    try { fs.cpSync(path.join(dir, 'uploads'), uploadDir, { recursive: true }); } catch {}
    try { fs.cpSync(path.join(dir, 'library'), libraryDir, { recursive: true }); } catch {}
    bumpSync();
    audit(req.user!.id, 'restore', 'system', undefined);
    res.json({ restored: p.data.name, safetyCopy: path.basename(safety) });
  } catch (e: any) {
    console.error('[restore] failed:', e);
    res.status(500).json({ error: 'Restore failed', details: String(e?.message || e).slice(0, 500) });
  }
});

// Leadership
app.get('/api/leadership', cache(3600), (req, res) => {
  const court = String(req.query.court || 'all');
  if (court === 'all') return res.json(db.prepare("SELECT * FROM leadership WHERE status='active' ORDER BY sort_order ASC").all());
  return res.json(db.prepare("SELECT * FROM leadership WHERE status='active' AND court_id=? ORDER BY sort_order ASC").all(court));
});
app.get('/api/admin/leadership', auth, (req:Auth, res) => {
  const sc = scopeOf(req);
  if (sc === 'DENIED') return res.status(403).json({error:'Forbidden'});
  if (sc) return res.json(db.prepare('SELECT * FROM leadership WHERE court_id=? ORDER BY sort_order ASC').all(sc.site));
  const court = String((req.query as any).court || 'all');
  if (court === 'all') return res.json(db.prepare('SELECT * FROM leadership ORDER BY sort_order ASC').all());
  return res.json(db.prepare('SELECT * FROM leadership WHERE court_id=? ORDER BY sort_order ASC').all(court));
});
app.post('/api/admin/leadership', auth, requirePerm('leadership.manage'), (req:Auth, res) => {
  const p = z.object({ nameRu: z.string().min(2), nameTj: z.string().optional(), nameEn: z.string().optional(), titleRu: z.string().optional(), titleTj: z.string().optional(), titleEn: z.string().optional(), courtId: z.string().max(64).optional(), sortOrder: z.number().int().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid leader', details: p.error });
  const x = p.data;
  const sc = scopeOf(req);
  if (sc === 'DENIED') return res.status(403).json({error:'Forbidden'});
  const courtId = sc ? sc.site : (x.courtId || null);
  const maxSort = (db.prepare('SELECT COALESCE(MAX(sort_order),0) as m FROM leadership').get() as any).m;
  const result = db.prepare('INSERT INTO leadership (name_ru, name_tj, name_en, title_ru, title_tj, title_en, court_id, sort_order, status) VALUES (?,?,?,?,?,?,?,?,?)').run(x.nameRu, x.nameTj || null, x.nameEn || null, x.titleRu || null, x.titleTj || null, x.titleEn || null, courtId, x.sortOrder ?? (maxSort + 1), 'active');
  audit(req.user!.id, 'create', 'leadership', Number(result.lastInsertRowid));
  res.status(201).json({ id: result.lastInsertRowid });
});
app.delete('/api/admin/leadership/:id', auth, requirePerm('leadership.manage'), (req:Auth, res) => { const sc = scopeOf(req); if(sc === 'DENIED')return res.status(403).json({error:'Forbidden'}); if(sc){ const row = db.prepare('SELECT court_id FROM leadership WHERE id=?').get(req.params.id) as any; if(!row || row.court_id !== sc.site)return res.status(403).json({error:'Forbidden'}); } db.prepare('DELETE FROM leadership WHERE id=?').run(req.params.id); audit(req.user!.id, 'delete', 'leadership', Number(req.params.id)); res.sendStatus(204); });
app.post('/api/admin/hearings', auth, requirePerm('hearings.manage'), (req:Auth, res) => {
  const p = z.object({ courtRu: z.string().min(2), courtTj: z.string().optional(), hearingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), hearingTime: z.string().max(16).optional(), categoryRu: z.string().max(160).optional(), categoryTj: z.string().max(160).optional(), partiesRu: z.string().max(500).optional(), partiesTj: z.string().max(500).optional(), room: z.string().max(64).optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid hearing', details: p.error });
  const x = p.data;
  const sc = scopeOf(req);
  if (sc === 'DENIED') return res.status(403).json({error:'Forbidden'});
  const courtRu = sc ? sc.courtName : x.courtRu;
  const courtTj = sc ? sc.courtName : (x.courtTj || null);
  const result = db.prepare('INSERT INTO hearings (court_ru, court_tj, hearing_date, hearing_time, category_ru, category_tj, parties_ru, parties_tj, room) VALUES (?,?,?,?,?,?,?,?,?)').run(courtRu, courtTj, x.hearingDate, x.hearingTime || null, x.categoryRu || null, x.categoryTj || null, x.partiesRu || null, x.partiesTj || null, x.room || null);
  audit(req.user!.id, 'create', 'hearing', Number(result.lastInsertRowid));
  res.status(201).json({ id: result.lastInsertRowid });
});
app.delete('/api/admin/hearings/:id', auth, requirePerm('hearings.manage'), (req:Auth, res) => { const sc = scopeOf(req); if(sc === 'DENIED')return res.status(403).json({error:'Forbidden'}); if(sc){ const row = db.prepare('SELECT court_ru FROM hearings WHERE id=?').get(req.params.id) as any; if(!row || row.court_ru !== sc.courtName)return res.status(403).json({error:'Forbidden'}); } db.prepare('DELETE FROM hearings WHERE id=?').run(req.params.id); audit(req.user!.id, 'delete', 'hearing', Number(req.params.id)); res.sendStatus(204); });

// Region Clusters & Courts Topology
app.get('/api/region_clusters', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM region_clusters').all()));

// Hearings
app.get('/api/hearings', cache(300), (req, res) => {
  const court = String(req.query.court || 'all');
  if (court === 'all') return res.json(db.prepare('SELECT * FROM hearings ORDER BY hearing_date DESC LIMIT 50').all());
  const like = '%' + court + '%';
  return res.json(db.prepare('SELECT * FROM hearings WHERE court_ru LIKE ? OR court_tj LIKE ? OR court_en LIKE ? ORDER BY hearing_date DESC LIMIT 50').all(like, like, like));
});

// Sample Docs
app.get('/api/sample_docs', cache(3600), (_req, res) => res.json(db.prepare('SELECT * FROM sample_docs').all()));

// Versioning and Rollback (Admin)
app.get('/api/admin/content/:id/versions', auth, (req:Auth, res) => {
  if (denyScoped(req,res)) return;
  res.json(db.prepare('SELECT id, version_number, created_by, created_at, commit_message FROM content_versions WHERE content_id = ? ORDER BY version_number DESC').all(req.params.id));
});
app.post('/api/admin/content/:id/versions', auth, requirePerm('content.edit'), (req:Auth, res) => {
  if (denyScoped(req,res)) return;
  const content = db.prepare('SELECT * FROM content WHERE id=?').get(req.params.id);
  if (!content) return res.status(404).json({error: 'Content not found'});
  const lastVer = db.prepare('SELECT MAX(version_number) as v FROM content_versions WHERE content_id=?').get(req.params.id) as {v:number};
  const nextVer = (lastVer.v || 0) + 1;
  db.prepare('INSERT INTO content_versions(content_id, version_number, snapshot_data, created_by, commit_message) VALUES(?,?,?,?,?)')
    .run(req.params.id, nextVer, JSON.stringify(content), req.user!.id, req.body.commit_message || `Version ${nextVer}`);
  res.status(201).json({version: nextVer});
});
app.post('/api/admin/content/:id/rollback', auth, (req:Auth, res) => {
  if (denyScoped(req,res)) return;
  const version = db.prepare('SELECT snapshot_data FROM content_versions WHERE content_id=? AND version_number=?').get(req.params.id, req.body.version_number) as {snapshot_data:string};
  if (!version) return res.status(404).json({error: 'Version not found'});
  const snap = JSON.parse(version.snapshot_data);
  // CMS-01: rolling back to a published snapshot republishes → needs publish perm.
  const role = (req as any).scoped?.role;
  const needPublish = snap.status === 'published' || snap.status === 'scheduled';
  if (needPublish && !hasPerm(role, 'content.publish')) return res.status(403).json({error:'Forbidden: rollback to published version requires publish permission'});
  if (!needPublish && !hasPerm(role, 'content.edit')) return res.status(403).json({error:'Forbidden'});
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

