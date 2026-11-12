import { Router } from 'express';
import { db } from '../index';
import { cache } from '../utils/cache';

/**
 * Public archive of historical personalities ("heroes").
 *
 * GET /api/heroes                 ?category=&q=&official=1  → list
 * GET /api/heroes/categories      → categories with counts
 * GET /api/heroes/:slug           → one biography with timeline + sources
 *
 * Rows are managed through /api/admin/heroes (see server/index.ts) so the
 * archive stays editable in the CMS instead of being frozen in code.
 */
const router = Router();

const parseJsonArray = (raw: unknown): any[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const LIST_COLUMNS = `id,slug,name_ru,name_tj,name_en,profession_ru,profession_tj,profession_en,
  category,is_official_hero,birth_date,death_date,portrait_url,
  portrait_note_ru,portrait_note_tj,portrait_note_en,
  hero_decree_ru,hero_decree_tj,hero_decree_en,seo_title,seo_description,
  confidence,published_at,sort_order`;

router.get('/', cache(60), (req, res) => {
  const category = String(req.query.category || '').trim().slice(0, 64);
  const q = String(req.query.q || '').trim().slice(0, 120);
  const official = String(req.query.official || '');

  const where: string[] = ["status='published'"];
  const vals: any[] = [];
  if (category) {
    where.push('category=?');
    vals.push(category);
  }
  if (official === '1' || official === 'true') where.push('is_official_hero=1');
  if (q) {
    where.push(`(
      name_ru LIKE ? OR name_tj LIKE ? OR name_en LIKE ? OR
      profession_ru LIKE ? OR profession_tj LIKE ? OR profession_en LIKE ? OR
      bio_ru LIKE ? OR bio_tj LIKE ? OR bio_en LIKE ? OR
      achievements_ru LIKE ? OR achievements_tj LIKE ? OR achievements_en LIKE ?
    )`);
    const like = `%${q}%`;
    for (let i = 0; i < 12; i++) vals.push(like);
  }

  const rows = db
    .prepare(`SELECT ${LIST_COLUMNS} FROM heroes WHERE ${where.join(' AND ')} ORDER BY sort_order, published_at DESC`)
    .all(...vals) as any[];
  res.json(rows);
});

router.get('/categories', cache(60), (_req, res) => {
  const rows = db
    .prepare(`SELECT category, COUNT(*) AS n, SUM(is_official_hero) AS official
               FROM heroes WHERE status='published' GROUP BY category ORDER BY n DESC`)
    .all() as any[];
  res.json(rows);
});

router.get('/:slug', cache(120), (req, res) => {
  const row = db
    .prepare(`SELECT * FROM heroes WHERE slug=? AND status='published'`)
    .get(String(req.params.slug)) as any;
  if (!row) return res.status(404).json({ error: 'Not found' });

  const related = db
    .prepare(
      `SELECT ${LIST_COLUMNS} FROM heroes
       WHERE status='published' AND slug<>? AND category=?
       ORDER BY sort_order LIMIT 4`
    )
    .all(row.slug, row.category) as any[];

  res.json({
    ...row,
    timeline: parseJsonArray(row.timeline),
    sources: parseJsonArray(row.sources),
    gallery: parseJsonArray(row.gallery),
    related,
  });
});

export const heroesRouter = router;
