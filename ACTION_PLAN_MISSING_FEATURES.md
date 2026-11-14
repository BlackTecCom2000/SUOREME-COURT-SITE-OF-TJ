# SUD.TJ — Action Plan: Missing Features

Created: 2026-11-15. Ordered by impact/effort. Each batch = one release (v2.37.x).

## Batch 1 — Core public pages (high impact, low risk)
1. **Search results page** `/search` — consume `/api/search`, show paginated results with highlight.
2. **Wire Leon Vasari archive into `/library`** — replace `LibraryPage` content with the new archive (iframe or redirect to `/leon-vasari-archive.html`).
3. **Contact / feedback page** `/contact` — form (name, email, message) posting to a new `/api/feedback` endpoint + display court address/hours.
4. **Privacy policy** `/privacy` and **accessibility statement** `/accessibility` — static pages.

## Batch 2 — Content & discoverability
5. **RSS/Atom feed** `/feed.xml` (and `/rss`) generated from news.
6. **Open Graph / Twitter Card meta** tags in `index.html` + per-route via react-helmet or manual.
7. **HTML sitemap page** `/sitemap` (visual) — already routed, verify content.
8. **Advanced search filters** (date range, category, court) on `/search`.

## Batch 3 — UX & platform
9. **Print styles** `@media print` for court decisions/documents.
10. **Sorting & pagination** in news/heroes lists.
11. **PWA** — service worker + manifest.json (offline shell).
12. **Analytics** (Plausible/Umami) — optional, needs user decision on provider.

## Batch 4 — Quality & hardening
13. **Hydration errors** #418/#422/#425 investigation (dev build + sourcemaps).
14. **Slow 4G / Fast 3G** testing + documentation.
15. **Preload critical fonts** (Inter/Cormorant subsets).
16. **Dark theme audit** — ensure full portal supports dark mode.

## Notes
- Each batch released per AGENTS.md protocol (version bump, QA, backup C:+H:, commit/tag/push, GitHub Release, Cloudflare deploy when incident-free).
- Batch 1 starts now.
"