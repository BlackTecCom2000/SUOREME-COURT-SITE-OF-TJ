import { Router } from 'express';
import { db } from '../index';
import { cache } from '../utils/cache';

// Global search across public portal data (ARCH-01: extracted from server/index.ts).
// GET /api/search?q=&type=news|announcement|vacancy|journal|act|book
const router = Router();

router.get('/', cache(60), (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 120);
  if (q.length < 2) return res.json({ items: [], total: 0 });
  const like = `%${q}%`;
  const limit = 30;
  const type = String(req.query.type || 'all');
  const items: any[] = [];
  const push = (rows: any[], kind: string, pick: (r: any) => any) => {
    for (const r of rows) items.push({ ...pick(r), kind });
  };
  try {
    if (type === 'all' || ['news', 'announcement', 'vacancy', 'journal', 'page'].includes(type)) {
      const t = type === 'all' ? null : type;
      const rows = (
        t
          ? db
              .prepare(
                "SELECT id,type,slug,title_ru,title_tj,title_en,excerpt_ru,published_at FROM content WHERE type=? AND status='published' AND deleted_at IS NULL AND (title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR excerpt_ru LIKE ?) ORDER BY published_at DESC LIMIT ?"
              )
              .all(t, like, like, like, like, limit)
          : db
              .prepare(
                "SELECT id,type,slug,title_ru,title_tj,title_en,excerpt_ru,published_at FROM content WHERE status='published' AND deleted_at IS NULL AND (title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR excerpt_ru LIKE ?) ORDER BY published_at DESC LIMIT ?"
              )
              .all(like, like, like, like, limit)
      ) as any[];
      push(rows, 'content', (r) => ({
        id: r.id,
        type: r.type,
        slug: r.slug,
        title_ru: r.title_ru,
        title_tj: r.title_tj,
        title_en: r.title_en,
        excerpt: r.excerpt_ru,
        date: r.published_at,
      }));
    }
    if (type === 'all' || type === 'act') {
      const rows = db
        .prepare(
          "SELECT id,title_ru,title_tj,title_en,doc_number,category,act_date FROM judicial_acts WHERE status='published' AND (title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR doc_number LIKE ?) ORDER BY act_date DESC LIMIT ?"
        )
        .all(like, like, like, like, limit) as any[];
      push(rows, 'act', (r) => ({
        id: r.id,
        title_ru: r.title_ru,
        title_tj: r.title_tj,
        title_en: r.title_en,
        doc_number: r.doc_number,
        category: r.category,
        date: r.act_date,
      }));
    }
    if (type === 'all' || type === 'book') {
      const rows = db
        .prepare(
          'SELECT id,title_ru,title_tj,title_en,badge,kind FROM shelf_books WHERE is_visible=1 AND (title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ?) ORDER BY sort_order, id LIMIT ?'
        )
        .all(like, like, like, limit) as any[];
      push(rows, 'book', (r) => ({
        id: r.id,
        title_ru: r.title_ru,
        title_tj: r.title_tj,
        title_en: r.title_en,
        badge: r.badge,
        kind: r.kind,
      }));
    }
  } catch {
    return res.status(500).json({ error: 'Search failed' });
  }
  res.json({ items: items.slice(0, limit), total: items.length });
});

export const searchRouter = router;
