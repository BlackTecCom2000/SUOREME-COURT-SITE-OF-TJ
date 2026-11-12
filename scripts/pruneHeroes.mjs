/**
 * Removes personalities that are not holders of the state title
 * «Қаҳрамони Тоҷикистон» from the published archive.
 *
 * The section is the archive of the Heroes of Tajikistan, so it lists the
 * people the state itself titled: Ayni, Ghafurov, Tursunzoda, Rahmon,
 * Maksum and Shotemur. The other researched figures (Ibn Sina, Somoni,
 * Kamol Khujandiy, Lahuti, Shakuri, Behbudiy, Qanoat, Yousafzai) are not
 * holders of the title — two of them were explicitly flagged for editorial
 * review — so they are removed from the archive at the client's request.
 *
 *   node scripts/pruneHeroes.mjs [--dry-run]
 */
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const root = process.cwd();
const dbPath = path.join(root, 'data', 'sudtj.sqlite');
const DRY = process.argv.includes('--dry-run');

const REMOVE = [
  'mumin-qanoat',
  'kamol-khujandiy',
  'abu-ali-ibn-sina',
  'ismail-somoni',
  'nisar-muhammad-yousafzai',
  'abulqosim-lahuti',
  'muhammadjon-shakuri',
  'mahmudhoja-behbudiy',
];

const db = new Database(dbPath);
const before = db.prepare('SELECT COUNT(*) n FROM heroes').get().n;
const rows = db
  .prepare(`SELECT slug, name_ru FROM heroes WHERE slug IN (${REMOVE.map(() => '?').join(',')})`)
  .all(...REMOVE);

if (!DRY) {
  const info = db
    .prepare(`DELETE FROM heroes WHERE slug IN (${REMOVE.map(() => '?').join(',')})`)
    .run(...REMOVE);
  console.log(`[prune] removed ${info.changes} rows`);

  // Portraits of the removed entries are orphans now.
  const portraitDir = path.join(root, 'data', 'uploads', 'portraits');
  if (fs.existsSync(portraitDir)) {
    for (const f of fs.readdirSync(portraitDir)) {
      if (REMOVE.some((s) => f.startsWith(`hero-${s}.`))) {
        fs.unlinkSync(path.join(portraitDir, f));
        console.log(`[prune] portrait removed: ${f}`);
      }
    }
  }
} else {
  console.log('[prune] dry-run, nothing written');
}

const after = db.prepare('SELECT COUNT(*) n FROM heroes').get().n;
console.log(`[prune] heroes ${before} -> ${after}`);
console.log(
  '[prune] remaining:\n' +
    db
      .prepare('SELECT slug, name_ru, category, is_official_hero FROM heroes ORDER BY sort_order')
      .all()
      .map((r) => `  ${r.slug} | ${r.name_ru} | ${r.category} | hero=${r.is_official_hero}`)
      .join('\n')
);
db.close();
