/**
 * Historical personalities importer (v2.34.0).
 *
 * Reads the researched biographies from scripts/seed/heroes-research-*.json
 * and writes them into the CMS table `heroes`. Portraits are downloaded from
 * the cited source into the local media library, so the site never hotlinks
 * a third party and the attribution (kept in `sources`) stays traceable.
 *
 *   node scripts/seedHeroesResearch.mjs [--dry-run] [--force]
 *
 * Idempotent: running it twice updates the same rows (matched by slug).
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = process.cwd();
const dbPath = path.join(root, 'data', 'sudtj.sqlite');
const seedDir = path.join(root, 'scripts', 'seed');
const portraitDir = path.join(root, 'data', 'uploads', 'portraits');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const FORCE = args.includes('--force');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

if (!db.prepare("PRAGMA table_info(heroes)").all().length) {
  console.error('Table `heroes` does not exist yet — start the server once (it migrates on boot).');
  process.exit(1);
}

const load = () => {
  const files = fs
    .readdirSync(seedDir)
    .filter((f) => f.startsWith('heroes-research-') && f.endsWith('.json'))
    .sort();
  const items = [];
  for (const f of files) {
    const json = JSON.parse(fs.readFileSync(path.join(seedDir, f), 'utf8'));
    for (const it of json.items || []) items.push({ ...it, _file: f });
  }
  return items;
};

const findBySlug = db.prepare('SELECT id FROM heroes WHERE slug=?');
const findByName = db.prepare('SELECT id, slug FROM heroes WHERE name_ru=?');
const update = db.prepare(`
  UPDATE heroes SET
    name_ru=@name_ru, name_tj=@name_tj, name_en=@name_en,
    profession_ru=@profession_ru, profession_tj=@profession_tj, profession_en=@profession_en,
    category=@category, is_official_hero=@is_official_hero,
    hero_decree_ru=@hero_decree_ru, hero_decree_tj=@hero_decree_tj, hero_decree_en=@hero_decree_en,
    birth_date=@birth_date, death_date=@death_date,
    birth_place_ru=@birth_place_ru, birth_place_tj=@birth_place_tj, birth_place_en=@birth_place_en,
    portrait_url=@portrait_url,
    portrait_note_ru=@portrait_note_ru, portrait_note_tj=@portrait_note_tj, portrait_note_en=@portrait_note_en,
    gallery=@gallery,
    bio_ru=@bio_ru, bio_tj=@bio_tj, bio_en=@bio_en,
    education_ru=@education_ru, education_tj=@education_tj, education_en=@education_en,
    career_ru=@career_ru, career_tj=@career_tj, career_en=@career_en,
    achievements_ru=@achievements_ru, achievements_tj=@achievements_tj, achievements_en=@achievements_en,
    contribution_ru=@contribution_ru, contribution_tj=@contribution_tj, contribution_en=@contribution_en,
    awards_ru=@awards_ru, awards_tj=@awards_tj, awards_en=@awards_en,
    timeline=@timeline, sources=@sources,
    confidence=@confidence, editorial_note=@editorial_note,
    status=@status, published_at=@published_at, sort_order=@sort_order,
    updated_at=CURRENT_TIMESTAMP
  WHERE id=@id
`);
const insert = db.prepare(`
  INSERT INTO heroes(
    slug, name_ru, name_tj, name_en, profession_ru, profession_tj, profession_en,
    category, is_official_hero, hero_decree_ru, hero_decree_tj, hero_decree_en,
    birth_date, death_date, birth_place_ru, birth_place_tj, birth_place_en, portrait_url,
    portrait_note_ru, portrait_note_tj, portrait_note_en,
    gallery,
    bio_ru, bio_tj, bio_en, education_ru, education_tj, education_en,
    career_ru, career_tj, career_en, achievements_ru, achievements_tj, achievements_en,
    contribution_ru, contribution_tj, contribution_en, awards_ru, awards_tj, awards_en,
    timeline, sources, confidence, editorial_note, status, published_at, sort_order, updated_at
  ) VALUES(
    @slug, @name_ru, @name_tj, @name_en, @profession_ru, @profession_tj, @profession_en,
    @category, @is_official_hero, @hero_decree_ru, @hero_decree_tj, @hero_decree_en,
    @birth_date, @death_date, @birth_place_ru, @birth_place_tj, @birth_place_en, @portrait_url,
    @portrait_note_ru, @portrait_note_tj, @portrait_note_en,
    @gallery,
    @bio_ru, @bio_tj, @bio_en, @education_ru, @education_tj, @education_en,
    @career_ru, @career_tj, @career_en, @achievements_ru, @achievements_tj, @achievements_en,
    @contribution_ru, @contribution_tj, @contribution_en, @awards_ru, @awards_tj, @awards_en,
    @timeline, @sources, @confidence, @editorial_note, @status, @published_at, @sort_order, CURRENT_TIMESTAMP
  )
`);

if (!DRY) fs.mkdirSync(portraitDir, { recursive: true });

/**
 * Downloads the gallery images (museum rooms, panels, monuments, stamps) of a
 * personality and returns the entries stored in the database.
 */
const localizeGallery = async (entries, slug) => {
  const out = [];
  for (let i = 0; i < (entries || []).length; i++) {
    const entry = entries[i];
    const ext = (entry.file.match(/\.(jpe?g|png|webp|gif)$/i)?.[1] || 'jpg').toLowerCase();
    const filename = `hero-${slug}-g${i + 1}.${ext}`;
    const target = path.join(portraitDir, filename);
    try {
      if (!fs.existsSync(target)) {
        // Wikimedia rate-limits anonymous API bursts; be gentle.
        await new Promise((r) => setTimeout(r, 2500));
        const api =
          'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
          '&iiprop=url&iiurlwidth=1200&titles=' + encodeURIComponent(entry.file);
        const j = await fetch(api, {
          headers: { 'User-Agent': 'sud-tj-portal/2.35 (+archive importer)' },
        })
          .then((r) => r.json())
          .catch(() => null);
        const page = j?.query?.pages ? Object.values(j.query.pages)[0] : null;
        const ii = page?.imageinfo?.[0];
        // Special:FilePath resolves and scales the file without touching the
        // API, so it still works when the API refuses the request.
        const fallback =
          'https://commons.wikimedia.org/wiki/Special:FilePath/' +
          encodeURIComponent(entry.file.replace(/^File:/, '')) +
          '?width=1200';
        const imageUrl = ii ? ii.thumburl || ii.url : fallback;
        const res = await fetch(imageUrl, {
          headers: { 'User-Agent': 'sud-tj-portal/2.35 (+archive importer)' },
          redirect: 'follow',
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const type = res.headers.get('content-type') || 'image/jpeg';
        if (!type.startsWith('image/')) throw new Error('not an image: ' + type);
        if (!DRY) fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      }
      out.push({
        file: `/api/portraits/${filename}`,
        caption_ru: entry.caption_ru || '',
        caption_tj: entry.caption_tj || '',
        caption_en: entry.caption_en || '',
        source: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(entry.file.replace(/ /g, '_')),
        license: entry.license || '',
      });
    } catch (e) {
      console.log(`  gallery skipped ${entry.file}: ${e.message}`);
    }
  }
  return out;
};

/**
 * Wikimedia serves a scaled copy of every file; the original of a modern
 * photograph can be several megabytes, which is far too heavy for a card.
 * The thumbnail pipeline keeps the download small without losing quality.
 */
const thumbnailFor = async (url) => {
  if (!/upload\.wikimedia\.org\/wikipedia\/commons\//.test(url)) return url;
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    '&iiprop=url&iiurlwidth=1200&titles=' +
    encodeURIComponent('File:' + decodeURIComponent(url.split('/').pop()));
  try {
    const j = await fetch(api, {
      headers: { 'User-Agent': 'sud-tj-portal/2.35 (archive importer)' },
    }).then((r) => r.json());
    const page = j?.query?.pages ? Object.values(j.query.pages)[0] : null;
    const ii = page?.imageinfo?.[0];
    if (ii?.thumburl) return ii.thumburl.split('?')[0];
  } catch {
    /* fall back to the original */
  }
  return url;
};

/** Download the portrait into the media library and return its public path. */
const localizePortrait = async (url, slug) => {
  if (!url || !/^https?:\/\//.test(url)) return url || null;
  const ext = (url.match(/\.(jpe?g|png|webp|gif)$/i)?.[1] || 'jpg').toLowerCase();
  const filename = `hero-${slug}.${ext}`;
  const target = path.join(portraitDir, filename);
  if (!fs.existsSync(target)) {
    const res = await fetch(await thumbnailFor(url), {
      headers: { 'User-Agent': 'sud-tj-portal/2.35 (+archive importer)' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const type = res.headers.get('content-type') || 'image/jpeg';
    if (!type.startsWith('image/')) throw new Error('not an image: ' + type);
    if (!DRY) fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  return `/api/portraits/${filename}`;
};

const items = load();
const summary = { inserted: 0, updated: 0, skipped: 0, portraits: 0 };

for (const it of items) {
  const row = {
    slug: it.slug,
    name_ru: it.name_ru, name_tj: it.name_tj || null, name_en: it.name_en || null,
    profession_ru: it.profession_ru || null, profession_tj: it.profession_tj || null, profession_en: it.profession_en || null,
    category: it.category || 'other',
    is_official_hero: it.is_official_hero ? 1 : 0,
    hero_decree_ru: it.hero_decree_ru || null, hero_decree_tj: it.hero_decree_tj || null, hero_decree_en: it.hero_decree_en || null,
    birth_date: it.birth_date || null, death_date: it.death_date || null,
    birth_place_ru: it.birth_place_ru || null, birth_place_tj: it.birth_place_tj || null, birth_place_en: it.birth_place_en || null,
    portrait_url: null,
    portrait_note_ru: it.portrait_note?.ru || null,
    portrait_note_tj: it.portrait_note?.tj || null,
    portrait_note_en: it.portrait_note?.en || null,
    bio_ru: it.bio_ru || null, bio_tj: it.bio_tj || null, bio_en: it.bio_en || null,
    education_ru: it.education_ru || null, education_tj: it.education_tj || null, education_en: it.education_en || null,
    career_ru: it.career_ru || null, career_tj: it.career_tj || null, career_en: it.career_en || null,
    achievements_ru: it.achievements_ru || null, achievements_tj: it.achievements_tj || null, achievements_en: it.achievements_en || null,
    contribution_ru: it.contribution_ru || null, contribution_tj: it.contribution_tj || null, contribution_en: it.contribution_en || null,
    awards_ru: it.awards_ru || null, awards_tj: it.awards_tj || null, awards_en: it.awards_en || null,
    timeline: JSON.stringify(it.timeline || []),
    sources: JSON.stringify(it.sources || []),
    confidence: it.confidence || 'needs-editorial-review',
    editorial_note: it.editorial_note || null,
    status: 'published',
    published_at: new Date().toISOString(),
    sort_order: it.sort_order || 100,
  };

  try {
    row.portrait_url = await localizePortrait(it.portrait_url, it.slug);
    if (row.portrait_url) summary.portraits++;
  } catch (e) {
    console.log(`  portrait skipped for ${it.slug}: ${e.message}`);
    row.portrait_url = null;
  }

  row.gallery = JSON.stringify(await localizeGallery(it.gallery, it.slug));

  const existing = findBySlug.get(row.slug) || (it.match_name ? findByName.get(it.match_name) : null);
  if (existing) {
    if (!FORCE && !DRY) {
      summary.skipped++;
      console.log(`  skip  ${row.slug} — already in the archive (use --force to refresh)`);
      continue;
    }
    if (!DRY) update.run({ ...row, id: existing.id });
    summary.updated++;
    console.log(`  upd   ${row.slug} — ${row.name_ru}`);
  } else {
    if (!DRY) insert.run(row);
    summary.inserted++;
    console.log(`  add   ${row.slug} — ${row.name_ru}${row.is_official_hero ? ' [Герой Тоҷикистон]' : ''}`);
  }
}

console.log(
  `[heroes-research] inserted=${summary.inserted} updated=${summary.updated} skipped=${summary.skipped} portraits=${summary.portraits}` +
    (DRY ? ' (dry-run: nothing written)' : '')
);
db.close();
