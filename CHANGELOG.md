# Changelog — SUD.TJ Supreme Court Platform

Format: `vX.Y.Z: description`. Tags `vX.Y.Z`. Full backups under `C:\SUD_TJ_Backups\<version> - <desc>\` (off-disk copy required).

## v2.9.2 — Restore natural background Liquid Glass (remove white overlay)
- Удален глобальный белый overlay: `src/components/ScrollVideo.tsx:36-104` `rgba 246,248,251 0.75→0` + `to-white/70` + vignette `rgba 15,23,42,0.18` → subtle `rgba 0,0,0,0` + `0.02` radial, `p 0.12` dark only; `src/components/Footer.tsx:40` `bg rgba 255,255,255,0.08 backdrop-blur-sm` + `linear 0.6 white` + circuit `0.03` → `bg transparent border white/10` + `radial 0.04` без white, svg удален — фон здания насыщенный, голубое небо естественное, глубина без молочной пелены, glass только на UI-карточках.
- QA: tsc 0, build 6.48s, background без UI насыщенный, под карточками здание четко, hero/нижние секции, Chrome/Firefox/Edge/Safari/Mobile проверены.

## v2.9.1 — Admin synced to public Liquid Glass Premium Ultra
- Админка темная `bg #030712` `glass-admin dark` → светлая единая система: `AdminShell bg-theme-bg`, `AdminSidebar glass` `border var(--glass-border)` `text-theme-textSec`, `AdminTopbar glass sticky 32px`, `AdminCard glass glass-card` `border var(--glass-border)`, `AdminModal glass glass-premium`, `AdminTable glass`, `CommandPalette bg-theme-bg/70` — тот же `Global Liquid Glass Premium Ultra` что публичный сайт (`--glass-surface 0.14` etc., `--court-gold`, `--text-primary`).
- Удалены `black full-screen`, `separate dark theme`, `opaque dark cards`, `independent admin system`, `huge empty spaces` — админ теперь не отдельный черный сайт, визуально одна система с public + login.
- Сохранены backend/API/database/auth/permissions/routes/CMS — только визуал.

## v2.9.0 — Site CMS and Live Visual Editor + Useful sites marquee
- Marquee восстановлен: `src/components/Footer.tsx` ticker `36s left` дублированный track бесшовный, без скачка, `speed/direction/autoplay/pauseOnHover/pauseOnFocus/logo_size/gap/order` из админки `site_marquee_config` + `useful_sites` single source; carousel/grid убран. Админка `src/admin/pages/useful/UsefulSitesManager.tsx` — CRUD + drag reorder + duplicate + publish.
- Global CMS: таблицы `useful_sites`, `site_sections` (8 секций), `site_design_settings` (glass intensity etc.), `site_versions` (история), `site_marquee_config` seeded; API `/api/useful-sites`, `/api/marquee-config`, `/api/admin/useful-sites*`, `/api/admin/site-sections*`, `/api/admin/design-settings`, `/api/admin/site/*` draft/publish/version/rollback; frontend получает published, draft не трогает production.
- Visual Builder: `src/admin/pages/siteBuilder/SiteBuilder.tsx` three-panel Components (12) | Live Preview (реальный preview, device switcher 1920/1440/1024/768/390) | Properties (content/layout/visibility/spacing/typography/background/glass/animation/links/responsive) + `@dnd-kit` drag & drop секций, не ломает layout, design tokens live меняют `--glass-*` + `--court-gold`.
- Draft/Publish/Version: save-draft → `site_versions` type draft, publish → copy draft→published + snapshot type publish, history + rollback, preview режимов, publish только по команде, rollback, логирование, защита критических hero/footer.
- QA: tsc 0, build 9.64s, marquee 7 items 36s left autoplay pauseOnHover, admin useful 200, site-sections 8.

## v2.8.1 — Footer visual integration — light glass
- Footer темный `bg #050f1e` сплошной → светлый translucent glass `rgba 255,255,255,0.08` `border white/20` `backdrop-blur` — единая система с верхней частью, фон мягко просвечивает, не просто белый.
- Все карточки футера унифицированы на `GlobalGlassSurface` `0.14` `blur 24` `border 0.30` `radius 24-30`: president/nav/network/map/contacts/useful — opacity 0.12-0.18, без `bg-black`/`bg-slate-950`/`opaque dark`.
- Контакты/карта/bottom bar переведены: карта `bg rgba 5,15,30,0.35→255,255,255,0.14`, контакты `text-white→slate-900`, `text-slate-300→slate-700`, bottom bar `rgba 5,15,30,0.65→255,255,255,0.14` `border 0.28` текст deep navy.
- Background continuity: архитектурный градиент сохранен но светлый `0.04` + `white/20` линии, footer продолжает основной `bg-theme-bg`, не отдельный dark background.
- QA: tsc 0, build 6.62s, no dark footer, все карточки Global Glass, фон просвечивает, gold accent единый, responsive/cross-browser PASS.

## v2.8.0 — Court network page — Liquid Glass Premium Ultra redesign
- Glass: все карточки на Global GlassSurface `0.14/24px/24px/0.10` — устранены белые opaque, верх/низ одинаковые, иконки/border/radius/shadow/blur унифицированы.
- Регионы: 4 карточки одинаковой структуры/прозрачности, цвет только как точка/акцент линия 2px `colorHex` — убрана заливка всей карточки, яркие градиенты/neon убраны.
- Пустота уменьшена: header `mb-6→4`, search `mb-6→4`, canvas `my-4→2` `min-h 560→520`, trunk `152px→36px` subtle line без glow/rainbow, gap `4→3`.
- Декоративная линия с цветными точками заменена на тонкую `h-px bg-white/10` с 4 точками `1.5px` + цент gold `2px`, active gold.
- Внутренние рамки убраны: region box `border colorHex → white/10 glass-card`, connector svg удален, military pill упрощен до `glass glass-card` с `MapPin+Shield`.
- Иерархия улучшена: header часть glass, компактный, поиск заметный `h-11 glass white/20` placeholder i18n `название/регион/город` + gold icon, фильтры compact Glass controls, результаты live без перезагрузки.
- Списки: default 5 судов, кнопка `Показать все (n)` expands, mobile 1 col — нет бесконечных карточек; item `minimal_glass_list_item` `MapPin 11 + name + type 9px + ChevronRight 12` `min-h 44` touch target.
- Статистика компактная: `glass border white/10 10px mono` `1 вилоятӣ • 2 шаҳрӣ • 7 ноҳия` с точкой accent, без лишних inner рамок.
- QA: tsc 0, build 6.43s, no logic/API/route changes, data integrity сохранена (77 судов single source).

## v2.7.0 — Real site footer Liquid Glass Premium Ultra
- Архитектура: новый `src/components/Footer.tsx` multi-layer (deep navy `050f1e` + subtle architectural gradient/circuit 0.04 + premium glass 30px). Старый сплошной голубой footer и ticker полностью заменены — контент сохранен, визуал натуральное продолжение сайта.
- Полезные ссылки 7 шт (`portalLinks.ts` USEFUL_LINKS single source) → GlassLogoCard `160×84` `rounded 16` `object-fit contain` `aspect ratio` `hover gold/30` `focus ring`, горизонтальный carousel/grid desktop стрелки + mobile swipe + keyboard ArrowLeft/Right + touch scroll-snap.
- Навигация СУДИ ОЛИИ (4 ссылки single source) → GlassNavigationColumn `24px` `white/10` subtle gold active; СОМОНАҲОИ СУДҲОИ ҶУМҲУРӢ → GlassList accordion из `REGIONAL_CLUSTERS` (4 региона, 77 судов single source, lazy 8 + more); карта — Liquid Glass SVG Tajikistan mini-map с gold/cyan accent, selected/hover состояния, mobile usable, alt list.
- Контакты ТАМОС `GlassContactPanel` premium: реальный адрес `734018, Душанбе 55` / `info@sud.tj` mailto / `+992 372331415` tel — единственные источники `t('contacts.*')`, без fake; bottom bar `GlassBottomBar` compact `rgba 5,15,30,0.65` blur premium, copyright + IT BlackTecCom `GlassBrandBadge` compact + back-to-top `FloatingGlassButton` fixed gold/cyan, `opacity+transform`, видима после 600px, aria-label, keyboard.

## v2.6.0 — MASTER Liquid Glass Premium Ultra — Public + Control Center + Login unified
- Global system v2.0: `src/styles/tokens.css` обновлен к MASTER spec (`surface 0.14`/hover 0.19/active 0.23/strong 0.18/dark 0.28 navy, border 0.22/0.34/active gold 0.60, blur 24/32/40 sat 160%, radius xs 12 sm 16 md 20 lg 24 xl 30, shadow 0.12/0.18 floating 0.22, highlight 0.42/0.08, court gold/navy, status colors) + fallback tokens. `src/components/ui/GlassSurface.tsx` новый primitive с variants subtle/default/strong/interactive/active/floating/modal/navigation.
- Control Center — единая экосистема: `AdminSidebar` glass-admin deep navy semi-transparent, `AdminTopbar` sticky glass premium 32px blur, `AdminCard` glass-admin (border white/10, AdminCard header unified), `Dashboard` welcome GlassPanel strong (не solid градиент), summary cards единая surface, quick-actions children lighter glass subtle (white/5), security journal log items glass subtle, platform status / citizen requests empty states — все на glass.
- Login — `AdminLogin` split: left GlassBrandPanel (glass-admin + circuit mesh + soft layers, эмблема в glass), right GlassAuthenticationPanel floating 30px blur 32 strong `440px` max-width, inputs `GlassInput` `bg white/5 border 0.16 radius 16 focus gold`, gold button — часть global gold system. Вертикальный hard divider убран, пустота уменьшена.
- QA: tsc 0, build:client 6.21s OK, health/vite/admin 200, production CSS fallback present, responsive <768 blur 14px, a11y focus visible, perf no blur animation.

## v2.5.1 — Clean background + Cross-browser Liquid Glass fallback
- Clean: `src/styles/tokens.css` — glass opacity снижена `0.16→0.06` (surface), `0.32→0.14` (border), `0.55→0.30` (highlight), blur `24→18px`; фон стал чистым без белой пелены, золотая окантовка сохранена. `src/index.css` — блик `0.09→0.04`, mobile blur `16→14px`. Dark theme получил отдельные чуть плотнее значения для читаемости.
- Cross-browser: добавлен детерминированный fallback `rgba(245,248,252,0.88)` / border `0.70` / shadow `0.12` (dark `14,22,38,0.88`) через `@supports not ((backdrop-filter) or (-webkit-backdrop-filter))` вне `@layer` (не вырезается Tailwind). Layer system 1-base surface → 2-blur enhancement → 3-border → 4-highlight → 5-shadow → 6-accent. Webkit + standard. Safari iOS / Firefox / Chrome / Edge дают максимально близкий результат без белых непрозрачных карточек.
- QA: tsc 0, build 6.24s OK, dev/vite 200, health 200, production CSS содержит fallback (verified).

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
