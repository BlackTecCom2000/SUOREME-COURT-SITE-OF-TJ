/**
 * Hero archive importer — seeds the curated personalities from the portal data
 * file (src/data/heroes.ts) into the CMS table `heroes`, so the archive is
 * editable in the admin panel instead of living only in code.
 *
 *   node_modules\.bin\tsx.cmd scripts/seedHeroes.mts [--dry-run] [--force]
 *
 * The curated file carries the name, profession, life years, biography and
 * the presidential decree that granted the title. It does not carry the URL
 * of the official source, so those rows are marked as "partial" with an
 * editorial note — the archive must never imply a confirmation it does not
 * have.
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { HEROES } from '../src/data/heroes';

const root = process.cwd();
const dbPath = path.join(root, 'data', 'sudtj.sqlite');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const FORCE = args.includes('--force');

const CATEGORY: Record<string, string> = {
  ayni: 'writer',
  gafurov: 'scientist',
  tursunzoda: 'writer',
  rahmon: 'statesman',
  makhsum: 'statesman',
  shotemur: 'statesman',
};

const EDITORIAL_NOTE =
  'Источник: отредактированный файл данных портала src/data/heroes.ts (релиз v2.29.0). ' +
  'Ссылка на официальный первоисточник не зафиксирована — требует дополнения редакцией.';

const parseYears = (years: string): { birth: string | null; death: string | null } => {
  const m = (years || '').match(/(\d{4})\s*[–—-]\s*(\d{4})/);
  if (m) return { birth: m[1], death: m[2] };
  const single = (years || '').match(/(\d{4})/);
  return { birth: single ? single[1] : null, death: null };
};

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const cols = db.prepare('PRAGMA table_info(heroes)').all();
if (!cols.length) {
  console.error('Table `heroes` does not exist yet — start the server once (it migrates on boot).');
  process.exit(1);
}

const find = db.prepare('SELECT id FROM heroes WHERE slug=?');
const upsert = db.prepare(`
  INSERT INTO heroes(
    slug, name_ru, name_tj, name_en, profession_ru, profession_tj, profession_en,
    category, is_official_hero, hero_decree_ru, hero_decree_tj, hero_decree_en,
    birth_date, death_date, portrait_url,
    bio_ru, bio_tj, bio_en, timeline, sources,
    confidence, editorial_note, status, published_at, sort_order, updated_at
  ) VALUES(
    @slug, @name_ru, @name_tj, @name_en, @profession_ru, @profession_tj, @profession_en,
    @category, @is_official_hero, @hero_decree_ru, @hero_decree_tj, @hero_decree_en,
    @birth_date, @death_date, @portrait_url,
    @bio_ru, @bio_tj, @bio_en, @timeline, @sources,
    @confidence, @editorial_note, @status, @published_at, @sort_order, CURRENT_TIMESTAMP
  )
  ON CONFLICT(slug) DO UPDATE SET
    name_ru=excluded.name_ru, name_tj=excluded.name_tj, name_en=excluded.name_en,
    profession_ru=excluded.profession_ru, profession_tj=excluded.profession_tj, profession_en=excluded.profession_en,
    category=excluded.category, is_official_hero=excluded.is_official_hero,
    hero_decree_ru=excluded.hero_decree_ru, hero_decree_tj=excluded.hero_decree_tj, hero_decree_en=excluded.hero_decree_en,
    birth_date=excluded.birth_date, death_date=excluded.death_date,
    bio_ru=excluded.bio_ru, bio_tj=excluded.bio_tj, bio_en=excluded.bio_en,
    confidence=excluded.confidence, editorial_note=excluded.editorial_note,
    updated_at=CURRENT_TIMESTAMP
`);

const rows = HEROES.map((h, idx) => {
  const years = parseYears(h.ru.years || h.tj.years || '');
  return {
    slug: h.id,
    name_ru: h.ru.name,
    name_tj: h.tj.name,
    name_en: h.en.name,
    profession_ru: h.ru.title,
    profession_tj: h.tj.title,
    profession_en: h.en.title,
    category: CATEGORY[h.id] || 'other',
    is_official_hero: /Герой Таджикистана|Қаҳрамони Тоҷикистон|Hero of Tajikistan/.test(
      h.ru.decree + ' ' + h.tj.decree + ' ' + h.en.decree
    )
      ? 1
      : 0,
    hero_decree_ru: h.ru.decree,
    hero_decree_tj: h.tj.decree,
    hero_decree_en: h.en.decree,
    birth_date: years.birth,
    death_date: years.death,
    portrait_url: null,
    bio_ru: h.ru.bio.join('\n\n'),
    bio_tj: h.tj.bio.join('\n\n'),
    bio_en: h.en.bio.join('\n\n'),
    timeline: '[]',
    sources: '[]',
    confidence: 'partial',
    editorial_note: EDITORIAL_NOTE,
    status: 'published',
    published_at: new Date().toISOString(),
    sort_order: (idx + 1) * 10,
  };
});

const summary = { inserted: 0, updated: 0, skipped: 0 };
const run = db.transaction(() => {
  for (const row of rows) {
    const existing = find.get(row.slug);
    if (existing) {
      if (!FORCE) {
        summary.skipped++;
        console.log(`  skip  ${row.slug} — already in the archive (use --force to refresh)`);
        continue;
      }
      if (!DRY) upsert.run(row);
      summary.updated++;
      console.log(`  upd   ${row.slug}`);
    } else {
      if (!DRY) upsert.run(row);
      summary.inserted++;
      console.log(`  add   ${row.slug} — ${row.name_ru} (${row.birth_date || '?'}–${row.death_date || '?'})`);
    }
  }
});
run();

console.log(
  `\n[heroes] inserted=${summary.inserted} updated=${summary.updated} skipped=${summary.skipped}` +
    (DRY ? ' (dry-run: nothing written)' : '')
);
db.close();
