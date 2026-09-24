# Changelog — SUD.TJ Supreme Court Platform

Format: `vX.Y.Z: description`. Tags `vX.Y.Z`. Full backups under `C:\SUD_TJ_Backups\<version> - <desc>\` (off-disk copy required).

## v2.5.0 — Global Liquid Glass Premium Ultra
- Tokens: `src/styles/tokens.css` gains the single theme-independent glass family (`--glass-surface*/--glass-border*/--glass-blur*/--glass-saturation*/--glass-radius-*/--glass-shadow*/--glass-highlight*`).
- Primitives: `src/index.css` adds `.glass/.glass-card/.glass-panel/.glass-large/.glass-chip/.glass-premium/.glass-ultra/.glass-active` (surface + blur/saturate + border + radius + shadow + top highlight via ::before); `.content-card` migrated onto the same tokens (~40 usages auto-upgraded); low-end solid fallback, mobile/tablet blur reduction, a11y-mode opaque override.
- Migrated (~55 components): portal ui Kit (Card/Modal/Tabs), Breadcrumbs, footer, Navbar + CourtSiteNavbar shells, all digital-court modal panels + inner rows, CaseSearchEngine/CaseDashboard/QuickActionsGrid/InteractiveProcessFlow, JudicialNewsHub + 3D slider, JudicialModal shell/rows/tiles, all homepage section cards, court hubs/drawer/nodes/tree container, CourtQrCode tile, CourtSitePage/Admin tiles, StateDutyCalculator panel, About/Leadership/NotFound/Sitemap surfaces, leglible tooltip.
- White boxes removed: `bg-white/95` hubs, `bg-white/75` blueprint light branches, `bg-[#f8fafc]` containers, opaque `bg-theme-surface/bg-theme-bg` panels, `hover:bg-theme-surfaceHover` washes.
- Exceptions (documented): dark blueprint/judicial-map glow subsystems (no white boxes; light branches fixed), document paper (PDF/page/reader bodies), admin dark kit, inputs/tables/micro-rows, tooltips/badges, a11y opaque mode.
- QA: tsc 0 errors, build:client OK, smoke 8/8, routes 9/9 200, DOM SSR check (home 51 glass / 0 opaque-white). Screenshots desktop/tablet/mobile left to user in Chrome (no browser tooling in sandbox).

## v2.4.0 — Legal UX remediation (full audit)
- Legal honesty: CourtQrCode rewritten as real-URL tile (no fake QR); CourtDetailsDrawer/SelectedCourtContextHub blocks trilingual "official website" without scan claims; InteractiveProcessFlow VERIFIED→IN REGISTRY + QR caveat; CaseSearchEngine PUBLIC→DEMO LEDGER; CaseDashboard/DocumentCenter/CaseWorkspaceModal Demo badges trilingual.
- Data integrity: Hero/Dashboard live `/api/stats` + health status; Blueprint fake UPTIME/LOAD deleted; JudicialActsManager no sample-fallback (loadError); receptionGuarantee neutral ×3; NewFilingModal + JudicialModal appeals POST /api/appeals with submitError/rateLimited i18n.
- UX/i18n: hover→click copy ru/en/tj; tooltip keyboard focus-within (CourtLeaf/Navbar/CourtSiteNavbar); NewFilingModal trilingual submit.
- Legislation filters: LibraryPage language + year filters, expanded search (title/docNumber/badge/meta); LawBookshelf ShelfBook docNumber/actDate/publishedAt mapping + meta.
- Court network type filter: Section06 chips (all/city/district/military/regional) → JudicialTreeView; BlueprintRegionalColumn regional case + isMatched default-true fix.
- News attribution: AnnouncementItem.source + JudicialNewsHub trilingual court source + link title.
- Typecheck: AdminProfileMenu roles, SettingsManager typed settings, LawBookshelf LegislationLink from types, optional domain chains, getCourtAddress fallbacks, unused-import cleanup — tsc clean; build:client OK; smoke 8×200 (health/search/sitemap/news/shelf/courts/acts + Vite).

## v2.3.0 — Legal search and repository
- Поиск: фильтры дат/категории/суда, полнотекст (body+content), релевантность (заголовок первым), таб заседаний; фильтры списков актов и книг.
- Репозиторий: метаданные книг (номер/дата/опубликовано/external_id/sync), версионность с откатом, связанные документы, sync-now с источником (ADLIA-архитектура).

## v2.2.2 — Global shell (navbar + footer IA)
- Scroll-spy active states для якорей (десктоп + мобильное меню, только на главной).
- Мобильный паритет: аккордеон e-услуг (те же 6 табов) + кнопки поиска/AI.
- Footer: IA-группы Суд/Услуги/Информация (реальные роуты + табы модалки).

## v2.2.1 — Portal base UI kit
- Удалены мёртвые первые определения `.btn-primary/.btn-secondary/.btn-ghost/.btn-icon` (побеждал btn-base блок — визуал не изменился); `.btn-gold` оставлен алиасом, `.btn-outline`/`.btn-base` живы.
- Новый портал-кит `src/components/ui/` с API админ-кита на theme-токенах: Badge/Card/Input/Select/Table/Tabs/Modal/EmptyState. Админ-кит не тронут (конвергенция позже).
- Proof-use: SitemapPage → Card + Badge (те же gold-визуалы).

## v2.2.0 — IA + design tokens foundation
- Phase 3 first_task: аудит frontend (routes без дублей, инвентарь UI-кита портал/админка, порядок секций homepage), предложенная IA (новые URL только для новых разделов, существующие не тронуты), архитектура токенов, план версий.
- Фундамент: `src/styles/tokens.css` (spacing/radius/glass/focus/transitions/z/container/typography как алиасы, ноль визуальных изменений) + snapshot с IA-картой и последовательностью.

## v2.1.8 — Fix dead menu anchors
- Пункты «Саҳифаҳо» вели в никуда на внутренних страницах (/about, /leadership, /news/*, /sitemap): якоря есть только на главной. Теперь — переход на главную + плавный скролл к разделу (без перезагрузки, работает и в мобильном меню).

## v2.1.7 — Swap sections 001 and 006
- Главная: секции 001 (Hero) и 006 (Judicial Information) поменяны местами; сквозная нумерация сохранена; кнопка «далее» hero теперь ведёт к контактам.

## v2.1.6 — Scroll glass performance optimization
- `ScrollVideo`: убран setState на каждый scroll-tick (ноль ре-рендеров) — rAF + прямые DOM-записи, `scrollHeight` кэшируется (был forced reflow каждый тик), убран `transition-transform`, дерущийся с покадровыми обновлениями.
- `Reveal`: `transition-all` → только `opacity,transform`; `will-change` только до появления; observer отключается после первого показа (без повторных анимаций).
- `FoliantReader`: слоты PDF-страниц резервируют место через `aspect-ratio` (первая декодированная страница задаёт точное соотношение) — прогрессивная подгрузка больше не сдвигает layout; убран постоянный `will-change` зума.

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
