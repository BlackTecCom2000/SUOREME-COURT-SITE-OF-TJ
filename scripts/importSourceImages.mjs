/**
 * Downloads the photographs of the imported publications into the local
 * media library, so the site does not hotlink the official server.
 *
 *   node scripts/importSourceImages.mjs [--dry-run]
 *
 * Every file is stored under data/uploads/<yyyy-mm>/ and registered in the
 * `media` table; the original URL is kept in the media row (original_name) so
 * the attribution to https://sud.tj stays traceable.
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = process.cwd();
const dbPath = path.join(root, 'data', 'sudtj.sqlite');
const uploadsDir = path.join(root, 'data', 'uploads');
const DRY = process.argv.includes('--dry-run');

const month = new Date().toISOString().slice(0, 7);
const targetDir = path.join(uploadsDir, month);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const rows = db
  .prepare(
    `SELECT id, type, slug, gallery FROM content
     WHERE gallery IS NOT NULL AND gallery <> '' AND status='published'`
  )
  .all();

if (!DRY) fs.mkdirSync(targetDir, { recursive: true });

const findMedia = db.prepare('SELECT id FROM media WHERE original_name=?');
const insertMedia = db.prepare(
  `INSERT INTO media(filename, original_name, mime_type, size, alt_text, uploaded_by, created_at)
   VALUES(?,?,?,?,?,NULL,CURRENT_TIMESTAMP)`
);
const updateGallery = db.prepare('UPDATE content SET gallery=? WHERE id=?');

const download = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'sud-tj-portal/2.33 (+content importer)' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const type = res.headers.get('content-type') || 'application/octet-stream';
  if (!type.startsWith('image/')) throw new Error('not an image: ' + type);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, type };
};

let downloaded = 0;
let reused = 0;
let failed = 0;
const pending = []; // { row, local: string[] }

for (const row of rows) {
  let gallery = [];
  try {
    gallery = JSON.parse(row.gallery);
  } catch {
    continue;
  }
  if (!Array.isArray(gallery) || gallery.length === 0) continue;

  const local = [];
  for (const url of gallery) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      local.push(url);
      continue;
    }
    const ext = (url.match(/\.(jpe?g|png|webp|gif)$/i)?.[1] || 'jpg').toLowerCase();
    const filename = `src-${row.type}-${row.slug}-${local.length}.${ext}`;
    if (findMedia.get(url)) {
      reused++;
      local.push(`/uploads/${month}/${filename}`);
      continue;
    }
    try {
      const { buf, type } = await download(url);
      if (!DRY) {
        fs.writeFileSync(path.join(targetDir, filename), buf);
        insertMedia.run(filename, url, type, buf.length, `Официальное фото: ${url}`);
      }
      downloaded++;
      local.push(`/uploads/${month}/${filename}`);
    } catch (e) {
      failed++;
      // Keep the original URL when the download fails - the page still works.
      local.push(url);
    }
  }
  pending.push({ row, local });
}

if (!DRY) {
  const apply = db.transaction(() => {
    for (const p of pending) updateGallery.run(JSON.stringify(p.local), p.row.id);
  });
  apply();
}

console.log(
  `[images] downloaded=${downloaded} reused=${reused} failed=${failed} ` +
    (DRY ? '(dry-run: nothing written)' : `-> data/uploads/${month}`)
);
db.close();
