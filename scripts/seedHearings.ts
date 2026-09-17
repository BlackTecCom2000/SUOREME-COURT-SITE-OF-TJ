import Database from 'better-sqlite3';
import path from 'node:path';
import { HEARINGS_SCHEDULE } from '../src/data/sudTjData';

const root = process.cwd();
const db = new Database(path.join(root, 'data', 'sudtj.sqlite'));

const toISO = (d: string) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d || '');
  return m ? m[3] + '-' + m[2] + '-' + m[1] : null;
};

try {
  const hc = (db.prepare('SELECT count(*) as c FROM hearings').get() as any).c;
  if (hc === 0) {
    console.log('Seeding hearings...');
    const stmt = db.prepare('INSERT INTO hearings (court_ru, court_tj, judge_ru, judge_tj, hearing_date, hearing_time, category_ru, category_tj, parties_ru, parties_tj, room) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    db.transaction(() => {
      for (const h of HEARINGS_SCHEDULE) {
        stmt.run(h.courtRu, h.courtTj || null, h.judgeRu, h.judgeTj || null, toISO(h.date), h.time, h.categoryRu, h.categoryTj || null, h.partiesRu, h.partiesTj || null, h.room || null);
      }
    })();
    console.log('Hearings seeded: ' + HEARINGS_SCHEDULE.length);
  } else { console.log('Hearings already seeded: ' + hc); }

  const sc = (db.prepare('SELECT count(*) as c FROM sample_docs').get() as any).c;
  if (sc === 0) {
    console.log('Seeding sample docs...');
    const docs: Array<[string, string, string]> = [
      ['Аризаи даъвогӣ — бекор кардани ақди никоҳ', 'Оилавӣ', 'DOCX'],
      ['Аризаи даъвогӣ — рӯёнидани алимент', 'Оилавӣ', 'DOCX'],
      ['Аризаи даъвогӣ — барқарор кардан ба кор', 'Меҳнатӣ', 'DOCX'],
      ['Шикояти кассатсионӣ — парвандаи маданӣ', 'Маданӣ', 'DOCX'],
      ['Ариза — шиносоӣ бо маводи парванда', 'Маъмурӣ', 'DOCX'],
      ['Дархост — додани нусхаи ҳалнома', 'Умумӣ', 'DOCX'],
    ];
    const stmt = db.prepare('INSERT INTO sample_docs (title_ru, title_tj, category_ru, category_tj, format) VALUES (?,?,?,?,?)');
    db.transaction(() => {
      for (const d of docs) stmt.run(d[0], d[0], d[1], d[1], d[2]);
    })();
    console.log('Sample docs seeded: ' + docs.length);
  } else { console.log('Sample docs already seeded: ' + sc); }
} catch (e) { console.error('Seeding failed:', e); }
