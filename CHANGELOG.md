# Changelog — SUD.TJ Supreme Court Platform

Format: `vX.Y.Z: description`. Tags `vX.Y.Z`. Full backups under `C:\SUD_TJ_Backups\<version> - <desc>\` (off-disk copy required).

## v2.1.5 — Useful links footer ticker
- «Полезные сайты» в футере — бегущая строка (пауза при наведении, остановка при `prefers-reduced-motion`, дублирующий прогон скрыт от скринридеров/таба).

## v2.1.4 — CSP dev report-only fix
- Enforced CSP (`script-src 'self'`) blocked Vite dev inline preamble on the `:8787` SSR path → unstyled, non-hydrated page. Fix: `CMS_CSP_MODE` (`enforce` = prod default, `report-only` = dev default, `off`); dev serves Report-Only, production enforces. `.env.example` documents the variable.

## v2.1.3 — Cleanup + continuity docs
- Deleted verified-dead legacy readers: `TurnFlipBook.tsx`, `ElectronicLibraryView.tsx`, `ConstitutionReader.tsx(.css)`, `public/lib/{jquery,turn}.min.js` (pdf.js kept for FoliantReader; zero external imports verified).
- Documented `server/db/schema.ts` drift vs live SQLite schema (kept, not auto-deleted).
- README (install/run/migrate/recovery/env/git), `.env.example` (`CMS_COOKIE_SECURE`, `CMS_HSTS`), new `CHANGELOG.md`, `scripts/{backup,restore-test}.mjs` documented.
- Clean-clone continuity test passed (clone → install → build → boot → smoke).

## v2.1.2 — SEC-06 CSP enforce, SEC-07 HSTS config, curl.exe removal
- `Content-Security-Policy` switched Report-Only → enforce (same allowlist, verified clean).
- `Strict-Transport-Security` opt-in via `CMS_HSTS=1` (default off until production TLS verified).
- Removed `curl.exe` dependency: PDF proxy + legislation import now use cross-platform `fetch` (`server/utils/fetch.ts`, timeout + size caps, IPv4-first DNS).

## v2.1.1 — SEC-05 httpOnly cookie auth + CSRF
- Login sets `cms_token` httpOnly cookie (`SameSite=Lax`, `Secure` on HTTPS); frontend sends `credentials: include`, zero tokens in `sessionStorage`/JS.
- Bearer fallback retained server-side; new `POST /api/admin/auth/logout` clears the cookie.
- CSRF: cookie-authenticated mutations require matching Origin/Referer (Bearer exempt, SameSite=Lax as base layer).
- New `src/admin/context/adminHttp.ts`; all 14 admin/court-admin modules migrated; `AdminLogin` + `AdminAuthContext` rewritten (session restores from cookie on reload).

## v2.1.0 — Phase 1+2 lock-in
- Global search (`GET /api/search` + `GlobalSearchModal`), sitemap page + dynamic `sitemap.xml`, breadcrumbs, per-page SEO meta, 404 route, `/admin/ai` route.
- Real RBAC (`server/middleware/rbac.ts`, 9 roles × 17 permissions, enforced server-side) + editorial workflow (draft→review→approved→published, reject-with-reason, pre-publish snapshots, rollback guards) + NewsEditor workflow UI.
- Rate limiting (`server/middleware/rateLimit.ts`): login/appeals/questionnaire/AI/editor/index.
- In-app backup/restore API (`data/backups`, retention, integrity-checked atomic restore).
- Baseline security headers; unified gold primary buttons.

## v2.0 — Release 2.0 full snapshot
- Prior baseline: e-library, shelf-books admin, AI assistant, admin audit, security hardening (see git history).
