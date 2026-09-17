import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { RAW_REGIONAL_CLUSTERS, SUPREME_COURT_NODE } from '../src/data/sudTjData';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const db = new Database(path.join(dataDir, 'sudtj.sqlite'));

console.log('Starting Phase 1 Seeding: Judicial Network (Courts)');

try {
  const stmt = db.prepare(`
    INSERT INTO courts (name_ru, name_tj, name_en, region, type, address_ru, phone, email, website, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    // 1. Seed Supreme Court
    console.log(`Seeding: ${SUPREME_COURT_NODE.nameRu}`);
    stmt.run(
      SUPREME_COURT_NODE.nameRu,
      SUPREME_COURT_NODE.nameTj,
      SUPREME_COURT_NODE.nameEn || null,
      SUPREME_COURT_NODE.regionId,
      SUPREME_COURT_NODE.type,
      SUPREME_COURT_NODE.addressRu,
      SUPREME_COURT_NODE.phone,
      SUPREME_COURT_NODE.email,
      SUPREME_COURT_NODE.url,
      1
    );

    // 2. Seed Regional Courts
    for (const region of RAW_REGIONAL_CLUSTERS) {
      for (const court of region.courts) {
        console.log(`Seeding: ${court.nameRu}`);
        stmt.run(
          court.nameRu,
          court.nameTj,
          court.nameEn || null,
          court.regionId,
          court.type,
          court.addressRu,
          court.phone || null,
          court.email || null,
          court.url || null,
          court.status === 'online' ? 1 : 1 // Mapping status to active for now
        );
      }
    }
  })();

  console.log('Phase 1 Seeding Complete! Seeded ~70 courts into the SQLite database.');
} catch (error) {
  console.error('Seeding failed:', error);
}
