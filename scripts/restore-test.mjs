// Backup restore test (Phase 3). Verifies a versioned backup WITHOUT touching production.
// Usage: node scripts/restore-test.mjs --version 2.1.0 [--dest C:\SUD_TJ_Backups]
// Copies backup to OS temp staging, verifies checksums + sqlite integrity + required files.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => (a.startsWith('--') ? [[a.slice(2), arr[i + 1] ?? '']] : []))
);
const version = args.version || '';
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node scripts/restore-test.mjs --version X.Y.Z [--dest DIR]');
  process.exit(2);
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.resolve(args.dest || 'C:\\SUD_TJ_Backups');
const cands = fs.readdirSync(DEST).filter((n) => n.startsWith(version + ' - '));
if (cands.length === 0) { console.error(`RESTORE-TEST FAIL: no backup for ${version} in ${DEST}`); process.exit(1); }
const SRC = path.join(DEST, cands[0]);
console.log(`[restore-test] backup=${SRC}`);

const stage = fs.mkdtempSync(path.join(os.tmpdir(), `sudtj-restore-${version}-`));
fs.cpSync(SRC, stage, { recursive: true });
console.log(`[restore-test] staged at ${stage}`);

// 1) manifest
const manPath = path.join(stage, 'manifest.json');
if (!fs.existsSync(manPath)) { console.error('RESTORE-TEST FAIL: manifest missing'); process.exit(1); }
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
if (man.version !== version) { console.error('RESTORE-TEST FAIL: manifest version mismatch'); process.exit(1); }
console.log(`[restore-test] manifest ok: ${man.description} @ ${man.timestamp}`);

// 2) checksums
const lines = fs.readFileSync(path.join(stage, 'checksums.sha256'), 'utf8').trim().split('\n');
let bad = 0;
for (const ln of lines) {
  const [h, ...rest] = ln.split('  ');
  const rel = rest.join('  ');
  const p = path.join(stage, ...rel.split('/'));
  if (!fs.existsSync(p)) { bad++; console.error('[restore-test] MISSING: ' + rel); continue; }
  const cur = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  if (cur !== h) { bad++; console.error('[restore-test] MISMATCH: ' + rel); }
}
if (bad > 0) { console.error(`RESTORE-TEST FAIL: ${bad} checksum problems`); process.exit(1); }
console.log(`[restore-test] checksums ok: ${lines.length} files`);

// 3) required product files
for (const rel of ['code/package.json', 'code/server/index.ts', 'code/src/App.tsx', 'manifest.json', 'checksums.sha256']) {
  if (!fs.existsSync(path.join(stage, ...rel.split('/')))) { console.error('RESTORE-TEST FAIL: missing ' + rel); process.exit(1); }
}
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'code', 'package.json'), 'utf8'));
console.log(`[restore-test] package.json ok (name=${pkg.name})`);

// 4) database integrity on the staged snapshot
const require = createRequire(path.join(ROOT, 'scripts', 'restore-test.mjs'));
const Database = require('better-sqlite3').default || require('better-sqlite3');
const snap = path.join(stage, 'database', 'sudtj.sqlite');
if (fs.existsSync(snap)) {
  const db = new Database(snap, { readonly: true });
  try {
    const ic = db.prepare('PRAGMA integrity_check').get();
    if (ic?.integrity_check !== 'ok') { console.error('RESTORE-TEST FAIL: integrity_check'); process.exit(1); }
    const counts = {};
    for (const t of Object.keys(man.database?.tables || {})) {
      try { counts[t] = db.prepare(`SELECT count(*) c FROM "${t.replace(/"/g, '""')}"`).get()?.c ?? -1; } catch { counts[t] = -1; }
    }
    console.log('[restore-test] integrity ok, counts: ' + JSON.stringify(counts));
  } finally { db.close(); }
} else console.log('[restore-test] note: no database snapshot in backup');

// 5) cleanup staging
fs.rmSync(stage, { recursive: true, force: true });
console.log(`[restore-test] DONE version=${version} — restore verified in staging, production untouched`);
