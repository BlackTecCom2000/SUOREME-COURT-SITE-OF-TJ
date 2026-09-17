import Database from 'better-sqlite3';
import path from 'node:path';
import { 
  COURTS_DATA, 
  REGIONAL_CLUSTERS, 
  SUPPORTING_INSTITUTIONS, 
  TREE_ROOTS, 
  JUDICIAL_ACTS, 
  HEARINGS_SCHEDULE, 
  PRESS_NEWS, 
  SAMPLE_DOCUMENTS 
} from '../src/data/sudTjData';

const dataDir = path.join(process.cwd(), 'data');
const db = new Database(path.join(dataDir, 'sudtj.sqlite'));

console.log('Starting data migration...');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('super_admin', 'admin', 'editor', 'reviewer')), disabled INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
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
`);

db.transaction(() => {
  // 1. Region Clusters
  const insertRegion = db.prepare('INSERT OR IGNORE INTO region_clusters (id, name_ru, name_tj, name_en, short_name_ru, short_name_tj, short_name_en, color_hex, color_glow, accent_class, border_class, text_class, bg_glow_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of REGIONAL_CLUSTERS) {
    insertRegion.run(r.id, r.nameRu, r.nameTj, r.nameEn || null, r.shortNameRu, r.shortNameTj, r.shortNameEn || null, r.colorHex, r.colorGlow, r.accentClass, r.borderClass, r.textClass, r.bgGlowClass);
  }
  console.log(`Migrated ${REGIONAL_CLUSTERS.length} region clusters.`);

  // 2. Courts
  const courtCount = db.prepare('SELECT count(*) as c FROM courts').get() as { c: number };
  if (courtCount.c === 0) {
    const insertCourt = db.prepare('INSERT INTO courts (name_ru, name_tj, name_en, short_name_ru, short_name_tj, short_name_en, region, type, address_ru, address_tj, address_en, phone, email, website, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    let courtsMigrated = 0;
    for (const region of REGIONAL_CLUSTERS) {
      for (const court of region.courts) {
        insertCourt.run(
          court.nameRu, court.nameTj, court.nameEn || null,
          court.shortNameRu || null, court.shortNameTj || null, court.shortNameEn || null,
          court.regionId, court.type,
          court.addressRu || null, court.addressTj || null, court.addressEn || null,
          court.phone || null, court.email || null, court.url || null, court.status || 'normal'
        );
        courtsMigrated++;
      }
    }
    console.log(`Migrated ${courtsMigrated} courts.`);
  }

  // 3. Hearings
  const insertHearing = db.prepare('INSERT OR IGNORE INTO hearings (id, court_ru, court_tj, court_en, judge_ru, judge_tj, judge_en, hearing_date, hearing_time, category_ru, category_tj, category_en, parties_ru, parties_tj, parties_en, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const h of HEARINGS_SCHEDULE) {
    const numericId = parseInt(h.id.replace(/\D/g, ''), 10) || Math.floor(Math.random() * 1000000);
    insertHearing.run(
      numericId,
      h.courtRu, h.courtTj, h.courtEn || null,
      h.judgeRu, h.judgeTj, h.judgeEn || null,
      h.date, h.time,
      h.categoryRu, h.categoryTj, h.categoryEn || null,
      h.partiesRu, h.partiesTj, h.partiesEn || null,
      h.room
    );
  }
  console.log(`Migrated ${HEARINGS_SCHEDULE.length} hearings.`);

  // 4. Sample Docs
  const insertDoc = db.prepare('INSERT OR IGNORE INTO sample_docs (id, title_ru, title_tj, title_en, category_ru, category_tj, category_en, format, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const d of SAMPLE_DOCUMENTS) {
    const numericId = parseInt(d.id.replace(/\D/g, ''), 10) || Math.floor(Math.random() * 1000000);
    insertDoc.run(
      numericId,
      d.titleRu, d.titleTj, d.titleEn || null,
      d.categoryRu, d.categoryTj, d.categoryEn || null,
      d.format, d.size
    );
  }
  console.log(`Migrated ${SAMPLE_DOCUMENTS.length} sample docs.`);

  // 5. Structure (Homepage Sections) - Serialize institutions and tree root
  const insertSection = db.prepare('INSERT OR REPLACE INTO homepage_sections (name, data, active) VALUES (?, ?, ?)');
  insertSection.run('supporting_institutions', JSON.stringify(SUPPORTING_INSTITUTIONS), 1);
  insertSection.run('tree_root_foundation', JSON.stringify(TREE_ROOTS), 1);
  console.log(`Migrated JSON structures into homepage_sections.`);

})();

console.log('Migration complete.');
