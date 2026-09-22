// Full-project versioned backup (Phase 3). Node stdlib only — cross-platform.
// Usage: node scripts/backup.mjs --version 2.1.0 --desc "Short description" [--dest C:\SUD_TJ_Backups] [--offsite DIR]
// Layout: <dest>/<version> - <desc-slug>/{code,database,files,manifest.json,checksums.sha256}
// Excludes: node_modules, dist, secrets (.env*), logs, data/backups, temp.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => (a.startsWith('--') ? [[a.slice(2), arr[i + 1] ?? '']] : []))
);
const version = args.version || '';
const desc = args.desc || '';
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node scripts/backup.mjs --version X.Y.Z --desc "text" [--dest DIR] [--offsite DIR]');
  process.exit(2);
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = desc.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'backup';
const DEST = path.resolve(args.dest || 'C:\\SUD_TJ_Backups');
const OFFSITE = args.offsite ? path.resolve(args.offsite) : null;
const OUT = path.join(DEST, `${version} - ${desc}`);

const GIT_BIN =
  process.env.GIT_BIN ||
  (process.platform === 'win32' && fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
    ? 'C:\\Program Files\\Git\\cmd\\git.exe'
    : 'git');
const git = (...a) => execFileSync(GIT_BIN, a, { cwd: ROOT, encoding: 'utf8' }).trim();
const gitCommit = git('rev-parse', 'HEAD');
const changedFiles = git('status', '--short').split('\n').map((s) => s.trim()).filter(Boolean);
const fail = (m) => { console.error('BACKUP FAIL: ' + m); process.exit(1); };

console.log(`[backup] version=${version} out=${OUT}`);
if (fs.existsSync(OUT)) fail('destination already exists (never overwrite versions)');
fs.mkdirSync(path.join(OUT, 'code'), { recursive: true });

// 1) Code: git-tracked files only (never junk, never secrets — .env is untracked+ignored).
const tracked = git('ls-files', '-z').split('\0').filter(Boolean);
let codeCount = 0;
for (const rel of tracked) {
  const src = path.join(ROOT, rel);
  const dst = path.join(OUT, 'code', rel);
  try {
    const st = fs.statSync(src);
    if (!st.isFile()) continue;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    codeCount++;
  } catch { /* deleted after ls-files; skip */ }
}
console.log(`[backup] code files: ${codeCount}`);

// 2) Database: consistent snapshot via VACUUM INTO + row counts.
const require = createRequire(path.join(ROOT, 'scripts', 'backup.mjs'));
const Database = require('better-sqlite3').default || require('better-sqlite3');
const liveDb = path.join(ROOT, 'data', 'sudtj.sqlite');
const dbOutDir = path.join(OUT, 'database');
fs.mkdirSync(dbOutDir, { recursive: true });
let tables = {};
if (fs.existsSync(liveDb)) {
  const src = new Database(liveDb, { readonly: true });
  try {
    src.exec(`VACUUM INTO '${path.join(dbOutDir, 'sudtj.sqlite').replace(/'/g, "''")}'`);
    const names = src.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    for (const t of names) {
      try { tables[t.name] = src.prepare(`SELECT count(*) c FROM "${t.name.replace(/"/g, '""')}"`).get()?.c ?? 0; } catch { tables[t.name] = -1; }
    }
  } finally { src.close(); }
  const snap = new Database(path.join(dbOutDir, 'sudtj.sqlite'), { readonly: true });
  try {
    const ic = snap.prepare('PRAGMA integrity_check').get();
    if (ic?.integrity_check !== 'ok') fail('snapshot integrity_check failed');
  } finally { snap.close(); }
  console.log(`[backup] database snapshot ok, tables: ${Object.keys(tables).length}`);
} else {
  console.log('[backup] WARNING: no live database found, skipping snapshot');
}

// 3) Files: uploads + library + public assets (product data, no secrets).
const copyTree = (rel) => {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) return 0;
  const dst = path.join(OUT, 'files', rel);
  fs.cpSync(src, dst, { recursive: true });
  let n = 0;
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else n++; } };
  walk(dst);
  return n;
};
const fileCounts = {
  'data/library': copyTree(path.join('data', 'library')),
  'data/uploads': copyTree(path.join('data', 'uploads')),
  uploads: copyTree('uploads'),
  'public/images': copyTree(path.join('public', 'images')),
  'public/lib': copyTree(path.join('public', 'lib')),
};
console.log('[backup] files: ' + JSON.stringify(fileCounts));
for (const extra of ['.env.example', 'README.md', 'CHANGELOG.md', 'Project_Snapshot.md', 'SUD_TJ_AUDIT.md', 'package.json', 'pnpm-lock.yaml']) {
  const s = path.join(ROOT, extra);
  if (fs.existsSync(s)) { fs.mkdirSync(path.join(OUT, 'code'), { recursive: true }); }
}

// 4) Checksums (sha256 per file, relative paths with forward slashes).
const hashFile = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const entries = [];
const walkAll = (d, base) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkAll(p, base);
    else if (e.name !== 'checksums.sha256') entries.push(path.relative(base, p).split(path.sep).join('/'));
  }
};
walkAll(OUT, OUT);
entries.sort();
const lines = entries.map((rel) => `${hashFile(path.join(OUT, ...rel.split('/')))}  ${rel}`);
fs.writeFileSync(path.join(OUT, 'checksums.sha256'), lines.join('\n') + '\n');
const treeChecksum = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');

// 5) Manifest.
const dirSize = (d) => {
  let t = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) t += dirSize(p);
    else { try { t += fs.statSync(p).size; } catch {} }
  }
  return t;
};
const manifest = {
  version,
  description: desc,
  timestamp: new Date().toISOString(),
  git_commit: gitCommit,
  git_tag: `v${version}`,
  changed_files: changedFiles,
  code_files: codeCount,
  database: { snapshot: fs.existsSync(path.join(dbOutDir, 'sudtj.sqlite')), tables },
  files: fileCounts,
  backup_size: dirSize(OUT),
  checksum: treeChecksum,
  restore_status: 'pending',
  offsite: OFFSITE,
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`[backup] manifest written, size=${manifest.backup_size} bytes`);

// 6) Verify: re-hash everything + manifest presence + db integrity (already checked).
const verifyLines = fs.readFileSync(path.join(OUT, 'checksums.sha256'), 'utf8').trim().split('\n');
let bad = 0;
for (const ln of verifyLines) {
  const [h, ...rest] = ln.split('  ');
  const rel = rest.join('  ');
  const p = path.join(OUT, ...rel.split('/'));
  if (!fs.existsSync(p) || hashFile(p) !== h) { bad++; console.error('[backup] MISMATCH: ' + rel); }
}
if (bad > 0) fail(`${bad} checksum mismatches`);
if (!fs.existsSync(path.join(OUT, 'manifest.json'))) fail('manifest missing');
console.log(`[backup] verify OK: ${verifyLines.length} files, checksum ${treeChecksum.slice(0, 16)}…`);

// 7) Offsite copy (optional but recommended; GitHub covers code separately).
if (OFFSITE) {
  const od = path.join(OFFSITE, `${version} - ${desc}`);
  if (!fs.existsSync(od)) {
    fs.cpSync(OUT, od, { recursive: true });
    const same = fs.readFileSync(path.join(od, 'checksums.sha256'), 'utf8') === fs.readFileSync(path.join(OUT, 'checksums.sha256'), 'utf8');
    if (!same) fail('offsite copy checksum mismatch');
    console.log(`[backup] offsite copy OK: ${od}`);
  } else console.log('[backup] offsite destination exists, skipped (no overwrite)');
} else {
  console.log('[backup] WARNING: no --offsite given; copy this backup off-disk manually (see README recovery).');
}
console.log(`[backup] DONE version=${version} tag=v${version}`);
