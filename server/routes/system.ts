import { Router } from 'express';
import { db, getSyncEpoch } from '../index';
import { cache } from '../utils/cache';

// Portal system routes (ARCH-01: extracted from server/index.ts).
// Mounted at '/' — all paths below are explicit and conflict-free.
const router = Router();

router.get('/api/health', (_req, res) => res.json({ api: 'ok', database: 'ok', storage: 'ok' }));

router.get('/api/sync', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ epoch: getSyncEpoch() });
});

router.get('/api/stats', cache(300), (_req, res) => {
  const q = (sql: string, ...a: any[]) => (db.prepare(sql).get(...a) as any)?.c || 0;
  res.json({
    courts: q('SELECT count(*) c FROM courts WHERE active=1'),
    hearings: q('SELECT count(*) c FROM hearings'),
    acts: q("SELECT count(*) c FROM judicial_acts WHERE status='published'"),
    news: q("SELECT count(*) c FROM content WHERE type='news' AND status='published' AND deleted_at IS NULL"),
    announcements: q(
      "SELECT count(*) c FROM content WHERE type='announcement' AND status='published' AND deleted_at IS NULL"
    ),
    vacancies: q("SELECT count(*) c FROM content WHERE type='vacancy' AND status='published' AND deleted_at IS NULL"),
    appeals: q('SELECT count(*) c FROM appeals'),
  });
});

// Dynamic sitemap.xml: static sections + published content (public URLs only).
router.get('/sitemap.xml', cache(3600), (_req, res) => {
  const base = 'https://sud.tj';
  const urls: string[] = ['/', '/about', '/leadership', '/library', '/sitemap', '/courts/sino', '/courts/dushanbe'];
  try {
    const rows = db
      .prepare(
        "SELECT type,slug FROM content WHERE status='published' AND deleted_at IS NULL ORDER BY published_at DESC LIMIT 500"
      )
      .all() as any[];
    for (const r of rows) urls.push(`/${r.type === 'news' ? 'news' : r.type}/${r.slug}`);
  } catch {}
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${base}${u}</loc></url>`)
    .join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.send(body);
});

export const systemRouter = router;
