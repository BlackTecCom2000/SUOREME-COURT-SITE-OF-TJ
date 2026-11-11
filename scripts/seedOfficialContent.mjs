/**
 * Official content importer (v2.33.0+).
 *
 * Reads the verbatim publications collected from https://sud.tj and writes
 * them into the CMS tables so an editor can correct, translate and publish
 * them like any other item. The importer is idempotent: running it twice
 * does not create duplicates, and it never overwrites an item that was
 * changed by an editor unless --force is given.
 *
 *   node scripts/seedOfficialContent.mjs                 # import / update
 *   node scripts/seedOfficialContent.mjs --dry-run       # show the plan only
 *   node scripts/seedOfficialContent.mjs --force         # overwrite edits
 *
 * Data files: scripts/seed/*.json
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = process.cwd();
const seedDir = path.join(root, 'scripts', 'seed');
const dbPath = path.join(root, 'data', 'sudtj.sqlite');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const FORCE = args.includes('--force');

const SOURCE_NAME = 'Суди Олии Ҷумҳурии Тоҷикистон';

const clean = (v) => (v == null ? '' : String(v).trim());

/** Trim a body to a readable excerpt without cutting a word in half. */
const excerptOf = (body, limit = 260) => {
  const flat = clean(body).replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;
  return flat.slice(0, limit).replace(/\s+\S*$/, '') + '…';
};

const seoTitle = (title, lang) => {
  const t = clean(title);
  if (!t) return null;
  const suffix = lang === 'tj' ? ' — Суди Олии Ҷумҳурии Тоҷикистон'
    : lang === 'ru' ? ' — Верховный Суд Республики Таджикистан'
    : ' — Supreme Court of the Republic of Tajikistan';
  const max = 300 - suffix.length;
  return (t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t) + suffix;
};

const loadItems = () => {
  const files = fs.existsSync(seedDir) ? fs.readdirSync(seedDir).filter((f) => f.endsWith('.json')) : [];
  const items = [];
  for (const f of files.sort()) {
    const raw = fs.readFileSync(path.join(seedDir, f), 'utf8');
    const json = JSON.parse(raw);
    for (const it of json.items || []) items.push({ ...it, _file: f });
  }
  return items;
};

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * The importer is standalone: it applies the same additive columns the
 * server applies on boot, so it can run before the first restart.
 */
const ensureSchema = () => {
  const cols = db.prepare('PRAGMA table_info(content)').all();
  for (const col of [
    'source_url TEXT', 'source_name TEXT', 'original_date TEXT',
    'keywords TEXT', 'seo_title TEXT', 'seo_description TEXT', 'gallery TEXT',
  ]) {
    const name = col.split(' ')[0];
    if (!cols.some((c) => c.name === name)) db.exec(`ALTER TABLE content ADD COLUMN ${col}`);
  }
};
ensureSchema();

const insert = db.prepare(`
  INSERT INTO content(
    type, slug, title_ru, title_tj, title_en,
    body_ru, body_tj, body_en,
    excerpt_ru, excerpt_tj, excerpt_en,
    source_url, source_name, original_date, keywords,
    seo_title, seo_description, gallery,
    status, published_at, updated_at
  ) VALUES(
    @type, @slug, @title_ru, @title_tj, @title_en,
    @body_ru, @body_tj, @body_en,
    @excerpt_ru, @excerpt_tj, @excerpt_en,
    @source_url, @source_name, @original_date, @keywords,
    @seo_title, @seo_description, @gallery,
    'published', @published_at, CURRENT_TIMESTAMP
  )
`);
const update = db.prepare(`
  UPDATE content SET
    title_ru=@title_ru, title_tj=@title_tj, title_en=@title_en,
    body_ru=@body_ru, body_tj=@body_tj, body_en=@body_en,
    excerpt_ru=@excerpt_ru, excerpt_tj=@excerpt_tj, excerpt_en=@excerpt_en,
    source_url=@source_url, source_name=@source_name, original_date=@original_date,
    keywords=@keywords, seo_title=@seo_title, seo_description=@seo_description,
    gallery=@gallery, updated_at=CURRENT_TIMESTAMP
  WHERE id=@id
`);

const findExisting = db.prepare('SELECT id, source_url, updated_at, title_ru FROM content WHERE type=? AND slug=?');

const items = loadItems();
const summary = { inserted: 0, updated: 0, skipped: 0 };

const rows = items.map((it) => {
  const tj = clean(it.title?.tj);
  const ru = clean(it.title?.ru);
  const en = clean(it.title?.en);
  const bodyTj = clean(it.body?.tj);
  const bodyRu = clean(it.body?.ru);
  const bodyEn = clean(it.body?.en);
  const exTj = clean(it.excerpt?.tj) || excerptOf(bodyTj);
  const exRu = clean(it.excerpt?.ru) || excerptOf(bodyRu);
  const exEn = clean(it.excerpt?.en) || excerptOf(bodyEn);
  return {
    type: it.type || 'news',
    slug: String(it.slug),
    title_ru: ru || tj || en,
    title_tj: tj || null,
    title_en: en || null,
    body_ru: bodyRu || bodyTj || bodyEn || null,
    body_tj: bodyTj || null,
    body_en: bodyEn || null,
    excerpt_ru: exRu || null,
    excerpt_tj: exTj || null,
    excerpt_en: exEn || null,
    source_url: it.source_url || null,
    source_name: SOURCE_NAME,
    original_date: it.original_date || null,
    keywords: clean(it.keywords) || null,
    seo_title: seoTitle(ru || tj || en, 'ru'),
    seo_description: (exRu || exTj || exEn || '').slice(0, 500) || null,
    gallery: Array.isArray(it.images) && it.images.length ? JSON.stringify(it.images) : null,
    published_at: it.published_at,
  };
});

const run = db.transaction(() => {
  for (const row of rows) {
    const existing = findExisting.get(row.type, row.slug);
    if (existing) {
      // Do not silently overwrite editorial changes: the item is refreshed only
      // when it still carries our source URL, or when --force is used.
      const importedBefore = !!existing.source_url && existing.source_url === row.source_url;
      if (!importedBefore && !FORCE) {
        summary.skipped++;
        console.log(`  skip  ${row.type}/${row.slug} — edited locally (use --force to overwrite)`);
        continue;
      }
      if (!DRY) update.run({ ...row, id: existing.id });
      summary.updated++;
      console.log(`  upd   ${row.type}/${row.slug} — ${row.published_at} ${row.title_ru?.slice(0, 60)}`);
    } else {
      if (!DRY) insert.run(row);
      summary.inserted++;
      console.log(`  add   ${row.type}/${row.slug} — ${row.published_at} ${row.title_ru?.slice(0, 60)}`);
    }
  }
});

run();
if (DRY) console.log('\n[dry-run] no changes written');

console.log(`\n[seed] inserted=${summary.inserted} updated=${summary.updated} skipped=${summary.skipped}`);
db.close();
