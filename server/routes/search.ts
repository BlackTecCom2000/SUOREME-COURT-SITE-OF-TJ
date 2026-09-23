import { Router } from 'express';
import { db } from '../index';
import { cache } from '../utils/cache';

// Global legal search (v2.3.0: filters + full-text + relevance).
// GET /api/search?q=&type=news|announcement|vacancy|journal|act|book|hearing
//   &date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&category=&court=
const router = Router();

const normDate = (v: string): string | null => {
  const s = String(v || '').trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

router.get('/', cache(60), (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 120);
  if (q.length < 2) return res.json({ items: [], total: 0 });
  const like = `%${q}%`;
  const limit = 30;
  const type = String(req.query.type || 'all');
  const from = normDate(String(req.query.date_from || req.query.from || ''));
  const to = normDate(String(req.query.date_to || req.query.to || ''));
  const category = String(req.query.category || '').slice(0, 120);
  const court = String(req.query.court || '').trim().slice(0, 160);
  const ql = q.toLowerCase();

  // Relevance: title/number hit first, then body/full-text hits.
  const score = (r: any): number => {
    const hay = [r.title_ru, r.title_tj, r.title_en, r.doc_number].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(ql) ? 0 : 1;
  };
  const items: any[] = [];
  const push = (rows: any[], kind: string, pick: (r: any) => any) => {
    for (const r of rows) items.push({ ...pick(r), kind, _s: score(r) });
  };
  try {
    if (type === 'all' || ['news', 'announcement', 'vacancy', 'journal', 'page'].includes(type)) {
      const t = type === 'all' ? null : type;
      const where: string[] = [
        "status='published'",
        'deleted_at IS NULL',
        '(title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR excerpt_ru LIKE ? OR body_ru LIKE ? OR body_tj LIKE ? OR body_en LIKE ?)',
      ];
      const vals: any[] = t ? [t] : [];
      vals.push(like, like, like, like, like, like, like);
      if (t) where.unshift('type=?');
      if (from) { where.push('substr(published_at,1,10)>=?'); vals.push(from); }
      if (to) { where.push('substr(published_at,1,10)<=?'); vals.push(to); }
      const rows = db
        .prepare(
          `SELECT id,type,slug,title_ru,title_tj,title_en,excerpt_ru,published_at FROM content WHERE ${where.join(' AND ')} ORDER BY published_at DESC LIMIT ?`
        )
        .all(...vals, limit) as any[];
      push(rows, 'content', (r) => ({
        id: r.id, type: r.type, slug: r.slug,
        title_ru: r.title_ru, title_tj: r.title_tj, title_en: r.title_en,
        excerpt: r.excerpt_ru, date: r.published_at,
      }));
    }
    if (type === 'all' || type === 'act') {
      const where: string[] = [
        "status='published'",
        '(title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR doc_number LIKE ? OR case_number LIKE ?)',
      ];
      const vals: any[] = [like, like, like, like, like];
      if (category) { where.push('category=?'); vals.push(category); }
      if (from) { where.push('act_date>=?'); vals.push(from); }
      if (to) { where.push('act_date<=?'); vals.push(to); }
      const rows = db
        .prepare(`SELECT id,title_ru,title_tj,title_en,doc_number,category,act_date FROM judicial_acts WHERE ${where.join(' AND ')} ORDER BY act_date DESC LIMIT ?`)
        .all(...vals, limit) as any[];
      push(rows, 'act', (r) => ({
        id: r.id, title_ru: r.title_ru, title_tj: r.title_tj, title_en: r.title_en,
        doc_number: r.doc_number, category: r.category, date: r.act_date,
      }));
    }
    if (type === 'all' || type === 'book') {
      const where: string[] = [
        'is_visible=1',
        '(title_ru LIKE ? OR title_tj LIKE ? OR title_en LIKE ? OR doc_number LIKE ? OR content_ru LIKE ? OR content_tj LIKE ? OR content_en LIKE ? OR content LIKE ?)',
      ];
      const vals: any[] = [like, like, like, like, like, like, like, like];
      if (category) { where.push('kind=?'); vals.push(category); }
      if (from) { where.push('substr(COALESCE(published_at,act_date),1,10)>=?'); vals.push(from); }
      if (to) { where.push('substr(COALESCE(published_at,act_date),1,10)<=?'); vals.push(to); }
      const rows = db
        .prepare(`SELECT id,title_ru,title_tj,title_en,badge,kind,doc_number FROM shelf_books WHERE ${where.join(' AND ')} ORDER BY sort_order, id LIMIT ?`)
        .all(...vals, limit) as any[];
      push(rows, 'book', (r) => ({
        id: r.id, title_ru: r.title_ru, title_tj: r.title_tj, title_en: r.title_en,
        badge: r.badge, kind: r.kind, doc_number: r.doc_number,
      }));
    }
    if (type === 'all' || type === 'hearing') {
      const where: string[] = [
        '(court_ru LIKE ? OR court_tj LIKE ? OR court_en LIKE ? OR category_ru LIKE ? OR category_tj LIKE ? OR category_en LIKE ? OR parties_ru LIKE ?)',
      ];
      const vals: any[] = [like, like, like, like, like, like, like];
      if (court) {
        const cl = `%${court}%`;
        where.push('(court_ru LIKE ? OR court_tj LIKE ? OR court_en LIKE ?)');
        vals.push(cl, cl, cl);
      }
      if (from) { where.push('hearing_date>=?'); vals.push(from); }
      if (to) { where.push('hearing_date<=?'); vals.push(to); }
      const rows = db
        .prepare(`SELECT id,court_ru,court_tj,court_en,category_ru,judge_ru,hearing_date,hearing_time,room FROM hearings WHERE ${where.join(' AND ')} ORDER BY hearing_date DESC LIMIT ?`)
        .all(...vals, limit) as any[];
      push(rows, 'hearing', (r) => ({
        id: r.id,
        title_ru: `${r.court_ru || ''} — ${r.category_ru || ''}`.trim(),
        title_tj: `${r.court_tj || r.court_ru || ''}`,
        title_en: `${r.court_en || r.court_ru || ''}`,
        date: r.hearing_date, category: r.category_ru,
      }));
    }
  } catch {
    return res.status(500).json({ error: 'Search failed' });
  }
  items.sort((a, b) => a._s - b._s);
  res.json({ items: items.slice(0, limit).map(({ _s, ...rest }) => rest), total: items.length });
});

export const searchRouter = router;
