# Project Snapshot: sud.tj / Электронный суд

## Architecture
- **Frontend**: React, Vite, Tailwind CSS. Glassmorphism UI for Digital Court.
- **Backend**: Node.js, Express, better-sqlite3.
- **Database**: SQLite (WAL mode). Custom AI schema (knowledge_sources, knowledge_chunks, FTS5).
- **AI Core**: Hybrid RAG + AI Gateway (Local/OpenAI).
- **Coding Agent Runtime**: DeepSeek Harness (DSH) running locally via AI Orchestrator adapter.

## Modifiable Components
- `src/components/*` (React UI)
- `server/services/*` (Backend Logic)
- `C:\Users\djabo\.gemini\config\plugins\ai-orchestrator\agents\deepseek-harness\*` (Integration)

## Known Issues
- The local AI Gateway currently mocks the OpenAI stream if `OPENAI_API_KEY` is absent.
- FTS5 Keyword Search works, but vector embedding generation requires an external API if JS fallback is insufficient.
- DeepSeek Harness Python SDK is executing via CLI `npx @deepseek-ai/dsh` because native python bindings are pending local environment validation.

### Performance Bottlenecks & Optimization (In Progress)

#### Baseline Metrics (Before Optimization)
- **DOM Interactive**: ~3900ms
- **First Contentful Paint (FCP)**: ~4200ms
- **LCP (Estimated)**: >4500ms
- **Bundle Analysis**: Initial bundle was loading `three.js` (972 KB), `lucide-react` (heavy full import patterns), and all `AdminApp` components concurrently on the public homepage. Main chunk size `index.js` was 703 KB (gzipped 190 KB) and `three.js` chunk was loaded synchronously.

#### After Lazy Loading Fixes (Phase 1 & 2 Complete)
- **DOM Interactive**: ~600ms (↓ 85%)
- **First Contentful Paint (FCP)**: ~1088ms (↓ 74%)
- **Main Bundle Size**: ~250 KB (↓ 64%)
- **Action Taken**: 
  - Segregated `AdminApp` from `App` in `src/main.tsx` utilizing `React.lazy` and `Suspense`.
  - Implemented `InViewLoad` component (IntersectionObserver wrapper) to lazy-load the heavy 3D asset section (`Section03DigitalJustice`) only when scrolled into view.
  - Deferred loading of heavy global modals (`CaseWorkspaceModal`, `NewFilingModal`, `DocumentCenter`, `NotificationCenterModal`, `AILegalAssistantModal`) via `React.lazy` in `HomePage.tsx` and `Layout.tsx`. 
  - **Phase 3 (Backend & Database):** Created performance indexes for `content`, `judicial_acts`, `courts`, and `leadership` in SQLite. Implemented `Cache-Control` headers middleware (`max-age=60` up to `3600`) for public API routes to eliminate redundant database hits.

#### Mobile Performance Audit (Baseline before Capability Optimization)
- **Page Load Time (Network Idle)**: ~5143ms
- **LCP (Largest Contentful Paint)**: ~4712ms
- **JS Heap**: ~6.4MB
- **DOM Nodes**: ~2630
- **Bottlenecks Found**:
  - Heavy initial JS payload blocking the main thread.
  - CSS layout and style recalculations are high.
  - 3D models and continuous `requestAnimationFrame` loops (like `DigitalDataRain` and Canvas) run immediately, degrading LCP and INP on mobile.
- **Capability Strategy**: Implement a `DeviceCapabilityContext` to scale visual fidelity (3D rendering, particles, blur) based on device capabilities without breaking the UI.

#### Mobile Performance Audit (After Capability Optimization)
- **Page Load Time (Network Idle)**: ~1684ms (↓ 67%)
- **LCP (Largest Contentful Paint)**: ~1244ms (↓ 74%)
- **JS Heap**: ~6.2MB
- **Estimated FPS during scroll/idle**: ~60.5
- **Action Taken**:
  - Implemented `DeviceCapabilityContext` to assign `high-end`, `medium`, or `low-end` tiers based on hardware concurrency and memory.
  - Added `priority` prop to `Reveal` components for above-the-fold Hero content to bypass IntersectionObserver and mount immediately.
  - `JusticeScene3D` now scales DPR and shadow mapping, and pauses rendering when not in view (`frameloop="demand"` on low-end).
  - `DigitalDataRain` particle density halved on medium tier, entirely disabled on low-end.
  - Heavy `backdrop-filter` removed globally via `data-device-tier` attributes for low-end devices.

#### Adaptive 3D System Architecture (New)
- **Problem**: Loading three 15MB+ `.glb` files and running multiple WebGL `<Canvas>` contexts simultaneously crushes mobile devices and causes severe LCP penalties.
- **Solution**: Dynamic tiered asset registry + Adaptive Rendering
  - **High-End**: Loads master GLB (`themis.glb`). Immediate viewport rendering with 150-250px `rootMargin`. Dynamic shadows, DPR ~2.
  - **Medium**: Loads optimized GLB (`themis-medium.glb`) if available, falls back to master GLB. `rootMargin` of 100px. DPR 1-1.5. Shadows disabled.
  - **Low-End**: Avoids WebGL entirely. Uses `Static3DFallback` to render a transparent `.webp` image.
  - **Graceful WebGL Unmounting**: When an element exits the viewport (`inView === false`), rendering is paused immediately via `frameloop="demand"`. After a 1.5s - 3s grace period, the `<Canvas>` is entirely unmounted.
  - **Safe Disposal**: Individual GLB wrapper components (`ThemisGLB`, `ScalesGLB`, `GavelGLB`) accept a `modelPath`, clone the scene, and explicitly call `.dispose()` on geometries and uniquely cloned materials during unmount to prevent GPU memory leaks without destroying shared master assets.

### AI Integration Status
- **Local Model**: Qwen2.5-coder:14b downloaded and active via Ollama.
- **Provider setup**: `OllamaProvider` built and set as primary inside `aiGateway.ts`, successfully responding in stream mode via `/api/ai/chat`.

## Last Updated By
Antigravity (AI Orchestrator)

## Map Redesign 2026-09-14 - BEFORE state (audit)
- Map = Section04JudicialSystem (state, CMS fetch, KPI, region buttons, search) + JudicialTreeView (own fetch, hover) + blueprint/*.
- Old top: Council (dead), Supreme (selects node), Administration (dead). Old connectors: curved SVG rays.
- Old columns: header pill + uptime/load placeholder + regional node + court grid + military fallback.
- Data: REGIONAL_CLUSTERS gbao/khatlon/sugd/dushanbe_rrp; CMS /api/courts 77 rows; static fallback.
- Preserve: court/region/supreme select, stat toggles, search dimming, immersive modal, i18n, routes, modal tab.

## Map Redesign + AI Module 2026-09-14 - AFTER state
- NEW dir src/components/judicial-map/: JudicialSystemDashboard, JudiciaryHeader, TopCourtNavigation (Constitutional->constcourt.tj verified 200, Supreme->node select, Economic->sud.tj), DigitalConnectorNetwork (SVG circuit, 4 regional colors, mobile vertical variant), RegionalCourtPanel/Stats/CourtList/CourtListItem/MilitaryCourtButton, SearchControl, LanguageSwitcher, JudiciaryFooter, judicial-map.css vars, regionAccent.
- Section04 slimmed to section wrapper + dashboard + hubs + immersive modal. Old KPI/search/region buttons/tree canvas removed from render; JudicialTreeView.tsx + blueprint/* kept on disk deprecated.
- Stats computed from live CMS data by type; military fallback synthesized as before; no invented courts; region order gbao/khatlon/sugd/dushanbe_rrp.
- AI: /api/editor/translate (gtx->MyMemory fallback, echo detect), /api/editor/magic modes generate/improve/formal/shorten/expand/rewrite/official + pubType/length/context/variant; ai_meta statuses Draft/AI/Reviewed + dirty; settings endpoints + SettingsManager AI tab; NewsEditor Magic panel + per-lang retranslate + backdate published_at.
- Fixes: scheduler date-format bug (UTC normalize), NewsEditor corrupt label line, settings SQL reserved words, scoped roles/site_id system.
- Tests: all pages 200, e2e publish/edit/schedule/backdate/translate/magic/scopes/toggles verified live; test rows removed.

## Audit sud.tj 2026-09-17 - BEFORE state
- Target: live https://sud.tj (Bitrix, nginx). Normative base: Gov. Decree N344 10.07.2017 + Unified Rules (129818: 2.3K chars, 129819: 57K chars, both extracted from docx). Pages checked: ~25. Requirements: ~185.

## Audit sud.tj 2026-09-17 - AFTER state (results)
- PASS 84 / PARTIAL 33 / FAIL 36 / UNKNOWN 32. Full matrix: SUD_TJ_AUDIT.md (19 categories, 15 required sections). Critical (P0): dead search (?q=sud empty), no robots.txt, no sitemap.xml, no sitemap page, no privacy policy. P1: phone mask +7 (must be +992), http-downgrade redirect, X-Powered-CMS leak, no Secure/HSTS/CSP, no FAQ/copyright/update-dates, thin doc catalog/stats, EN leftovers. Evidence: curl statuses/sizes, HTML markers, CDP screenshots desktop 1440 + mobile 390 (sud-home-d/m, sud-news). Next: week-plan P0/P1/P2 in report section 14 + final checklist section 15.

## Flipbook Rework 2026-09-17 - BEFORE state
- Viewer: BookReaderView (3D closed cover + open btn) -> text? TurnFlipBook(text pages) : pdf? PdfFlipBook(text-extract->TurnFlipBook, fallback file-card) : empty. No iframe (removed earlier). Two counters coexist: elib-docpos (doc idx/docs, e.g. 16/19) + page counter (cur/totalFlipPages) = reported 18-vs-21 confusion. mmk.tj refs: server cleanMmkText+LIB_PDF_HOSTS+import endpoint(docId), admin import UI labels. Stack: React+vite+turn.js r3+pdf.js 3.11 vendored in public/lib. Known issue: mmk.tj file backend flaps 503.

## Flipbook Rework 2026-09-17 - AFTER state
- Reader: closed 3D cover -> open -> text? TurnFlipBook(text pages) : pdf? PdfPageFlipBook(rendered page images) : file-card fallback(download preserved). No iframe anywhere. Counters separated+labeled: doc-nav 'Dokument N/M' vs page toolbar 'Stranitsa X/Y' from turn state (single source = turn events + doc.numPages). mmk.tj purged: LIB_PDF_HOSTS sans mmk, import endpoint takes allowlisted sourceUrl (adliya-ready), cleanImportedText rename, admin labels updated. New: public/lib/{jquery,turn,pdf}.min.js, TurnFlipBook(resize/initialPage), PdfPageFlipBook(lazy render radius2, cache cap 24, zoom .75-2.5, fullscreen, keyboard, URL ?doc=&page=), LibraryPage URL sync, breakpoint 900px single/double. Tests: 1/2/21/50-page PDFs, flip both dirs, zoom %, keyboard, URL deep-link (?doc=db:18&page=1 selects doc), mobile verified earlier, no console errors. Remaining: adliya doc URLs unknown (backend unreachable from sandbox); thumbnails skipped (optional); print skipped (optional).

## Foliant Reader 2026-09-17 - BEFORE state
- Reader: BookReaderView (3D closed cover + open btn) -> text? TurnFlipBook(text pages) : pdf? PdfFlipBook(pdf.js extract->TurnFlipBook, fallback file-card). Counters: doc-nav labeled + page toolbar. User provided antigravity 3D_book_reader (Tailwind CDN + turn.js + sound/TOC/themes/autoplay/scrubber/bookmark). Plan: delete BookReaderView.tsx + PdfFlipBook.tsx, new FoliantReader on vendored turn.js+jquery (no CDN), same UX adapted to site tokens.

## MODERNIZATION MISSION 2026-09-22 - AUDIT (Phase 1, Senior Product Architect review)
- Stack: react 18.3 + router 7.18 + vite 5 + tailwind 3 + express 5 + better-sqlite3 13 + tiptap 3 + three/fiber/drei + gsap + motion. Types mismatch: @types/react-router-dom@5 vs router@7.
- Routes portal: / /about /leadership /news|announcements|vacancies|journal/:slug /courts/:courtId /courts/:courtId/admin /library (+/sitemap +/* 2026-09-22). Admin /admin: dashboard news acts books courts structure-editor appeals media users audit settings duty (+ai 2026-09-22). AiDashboard was orphan — wired.
- Backend: single live router server/index.ts (914 lines); server/routes/* + middleware/auth.ts + db/schema.ts DEAD (schema drift vs live). No global /api/search (was) — added 2026-09-22. No PATCH leadership/hearings/courts, no DELETE users. RBAC nominal: editor==admin on publish; reviewer unrestricted; /api/ai/* unauthenticated. No helmet/CSP/HSTS/CSRF; JWT in sessionStorage; multer-2rc4 stream buffered to RAM (100MB risk); curl.exe Win-only proxy.
- Frontend gaps (were): no global search (Navbar search scrolled to #case-search), no sitemap page (static sitemap.xml 5 URLs only), no per-page title/meta/OG, no breadcrumbs, no 404 route (empty Layout on unknown URL), btn-primary defined twice (gold 275 vs blue 568 — blue won), admin slate/amber hardcode vs portal theme vars.
- i18n: LanguageContext tj|ru|en (?lang > localStorage > navigator > ru), View Transitions; ru.ts ~272 keys mirrored in tj/en (coverage diff pending); hardcoded strings in Navbar/Layout/LibraryPage bypass t().
- Perf: lazy admin split + InViewLoad + DeviceCapabilityContext tiers done earlier; three/gsap/motion/tiptap still in base deps.

## MODERNIZATION MISSION 2026-09-22 - IMPLEMENTED (Phases 2-4 partial)
- Design system: .btn-primary unified to judicial gold (was sky-blue override); .btn-gold alias kept. No other visual changes (official строгий характер preserved).
- Global search: GET /api/search?q=&type= (content published + judicial_acts published + shelf_books visible, LIKE, limit 30, cache 60s) + GlobalSearchModal (lazy, debounce 320ms, tabs all/news/announcement/vacancy/journal/act/book, grouped results, Esc/backdrop close, autofocus, tj/ru/en) wired to Navbar search button (was: scroll to #case-search).
- IA: /sitemap page (SitemapPage: main/info/library/courts/citizens groups, glass cards, tj/ru/en) + footer link; Breadcrumbs component; dynamic /sitemap.xml (static sections + up to 500 published content URLs, cache 3600) registered before static mounts.
- SEO: usePageMeta hook (title + description + og:title/og:description) applied to Home/About/Leadership/Library/ContentDetail/Sitemap/404; NotFoundPage + catch-all * route (was: empty Layout).
- Admin: /admin/ai route + sidebar item (AiDashboard repaired: removed motion/react-hot-toast deps, sessionStorage cms-token, inline notice instead of toast).
- Security: baseline headers middleware (nosniff, SAMEORIGIN, strict-origin-when-cross-origin, minimal Permissions-Policy) on all responses.
- Content rules respected: zero invented documents/positions/stats; only structures + real DB content surfaced.
- Remaining (phases 5-12): citizens forms validation review, legislation search filters UI, judicial practice sections, media gallery, transparency/careers sections, language-mixing sweep (hardcoded strings → t()), dead-code removal decision (Section03DigitalHammer etc. still on disk, unused), RBAC publish separation, backup/restore endpoint, rate limits on /appeals|/ai/chat, helmet/CSP, sitemap hreflang/canonical, link audit, mobile QA.

## PHASE 2 BASELINE 2026-09-22 - BEFORE (Security/RBAC/CMS stabilization)
- AuthN: JWT Bearer 8h (CMS_JWT_SECRET or dev default), sessionStorage cms-token, loginRateLimit in-memory 10 fails/15min/IP (login only). No limits on /api/appeals, /api/questionnaire, /api/ai/chat, /api/editor/*.
- AuthZ live: auth (JWT+disabled check), requireSuper (users CRUD only), denyScoped (site users off portal endpoints), scopeOf (content/leadership/hearings region filter), canManageLibrary (super_admin|admin|administrator|editor|publisher). DB roles CHECK(super_admin,admin,editor,reviewer) — only 4 values possible; any authenticated user can POST/PATCH/DELETE content incl. publish; reviewer unrestricted; roles publisher|court_manager|viewer|content_manager|administrator exist only in AdminAuthContext/middleware (dead). No permission matrix. /api/admin/auth/me returns user without permissions.
- Content lifecycle: status free text (draft|published|pending|pending_review mixed), no transitions, no review_notes/reviewer fields, versions+rollback exist (content_versions). Publishing is one click for any role.
- Headers: nosniff (global+statics), SAMEORIGIN, Referrer-Policy, Permissions-Policy (Phase 1). No CSP/HSTS/CSRF; JWT in sessionStorage.
- Persistence: data/sudtj.sqlite (WAL) + data/library + uploads dir. No backup/restore endpoint or script; no retention; no recovery doc.
- Backend shape: server/index.ts ~963 lines live router; server/routes/{admin,public,upload}.ts + server/db/schema.ts + server/middleware/auth.ts dead (schema drift documented Phase 1).
- SEO/i18n: usePageMeta title+desc+OG on 6 pages; no hreflang/canonical/robots-noindex-admin; sitemap.xml dynamic valid-public-only; hardcoded UI strings remain (esp. admin RU-only + some portal spots).
- Rules for Phase 2: no data deletion, no invented data/roles content, no public URL changes, keep tj/ru/en + search/sitemap/admin green (quality gate).

## PHASE 2 AFTER 2026-09-22 - IMPLEMENTED (Security/RBAC/CMS/Backend)
- SEC-02 rate limiting: NEW server/middleware/rateLimit.ts (sliding-window, in-memory, Retry-After, safe {error:'Too many requests'}). Presets: login 10/15min/IP, appeals 5/15min/IP, questionnaire 5/15min/IP, ai/chat 30/hour/IP, editor 120/hour/user, index-knowledge 30/hour/user. Wired in index.ts + routes/ai.ts (old loginRateLimit removed). BUG FOUND BY TESTS: shared buckets map without prefixes caused cross-limiter blocking (logins consumed appeals budget) — fixed with per-limiter prefix.
- SEC-01 real RBAC: NEW server/middleware/rbac.ts — 9 roles x 17 permissions matrix (ROLE_PERMS, permissionsFor, hasPerm, requirePerm, permForContentStatus). Role read ONLY from DB-backed session (never client). Enforced on: users.* (users.manage, replaces requireSuper), settings POST (settings.manage), shelf-books/library x6 (library.manage, replaces canManageLibrary), judicial-acts x3 (acts.manage), hearings x2 (hearings.manage), leadership x2 (leadership.manage), courts POST (courts.manage), appeals PATCH (appeals.manage), media POST (media.manage), content POST/PATCH/DELETE/versions/rollback (granular, see CMS-01). GET /api/admin/auth/me now returns permissions[]. Frontend: AdminAuthContext permissions + hasPerm (+ immediate pull on login), AdminSidebar items gated by anyOf[] (groups hidden when empty), ShelfBooksManager canEdit via permission, NewsEditor action bar gated (draft/edit, review submit, approve, reject+reason, publish) + review_notes editor field.
- CMS-01 workflow: statuses extended draft|pending_review|approved|rejected|published (+archived|scheduled kept). DRAFT->REVIEW(submit)->APPROVED->PUBLISHED, REJECTED->DRAFT(rework). DB migration (additive): content.review_notes/reviewed_by/reviewed_at/published_by. Reject without reason -> 400. Approve/reject stamp reviewer+time. Publish auto-snapshots row into content_versions (recoverable) + published_by. Rollback to published snapshot requires content.publish. Public endpoints still filter status='published' only (no leaks). NewsEditor: new statuses in select, reject-reason textarea, per-action buttons, AdminBadge variants approved/rejected/pending_review.
- ARCH-01: NEW server/utils/cache.ts (shared), server/routes/search.ts (GET /api/search), server/routes/system.ts (GET /api/health|sync|stats, /sitemap.xml) mounted in index.ts; moved code deleted from index.ts; getSyncEpoch export. Dead server/routes/{admin,public,upload}.ts + db/schema.ts + middleware/auth.ts untouched (still dead, schema drift documented — full rewrite explicitly out of scope).
- SEC-03 CSP: Content-Security-Policy-Report-Only on all responses (self + fonts.googleapis/gstatic + unsafe-inline styles (justified: Tailwind/inline-style app) + data:/blob: images + ws/wss + workers + object-src none + frame-ancestors self). No console violations observed; enforce mode deferred (documented risk).
- SEC-04 backup/restore: POST /api/admin/backup (users.manage) -> data/backups/backup-<ts>/{sudtj.sqlite via VACUUM INTO, uploads/, library/, manifest.json with table counts + sizes}; retention 5 backups + 2 pre-restore copies. POST /api/admin/restore {name} (strict ^[a-zA-Z0-9_-]+$, traversal blocked) -> safety VACUUM copy first, readonly integrity_check, atomic ATTACH table copy in transaction (FTS shadows excluded, triggers rebuild FTS), files merge, bumpSync, audit. GET /api/admin/backups list. Recovery: restore safety copy; copy backups off-host (redundancy note).
- SEO-01: usePageMeta extended (canonical absolute URL, hreflang tg/ru/en/x-default via ?lang=, robots opt); AdminApp sets noindex,nofollow globally.
- I18N-01: scan report — portal Cyrillic is ~all inside tj/ru/en ternaries/L() (already synchronized); sites/ zero bare strings; fixed 3 bare-RU spots in NewFilingModal (filename + ECP block) to ternaries; official bilingual names (court titles/options) + demo case data intentionally untouched (no auto-translation of legal names); ElectronicLibraryView/ConstitutionReader/TurnFlipBook verified zero-import dead code, left on disk (removal candidate Phase 3).
- Tests (35/35 PASS, scripts in TEMP/opencode: phase2_tests.ps1): 401 no/bad token, 403 reviewer on users-list/role-escalation/content-create/publish/approve/backup, 400 reject-without-reason, full lifecycle draft>rejected>draft>review>approved>published with snapshot 0>1 + public visibility + soft-delete invisibility, backup 201 + manifest + list, restore identical 200 with counts 7>7, traversal 400, disable>login 401, appeals 5x201+429, login burst 429. Two test-found bugs fixed: limiter prefix collision, FTS shadow tables in restore (knowledge_chunks_fts_data) + sqlite_sequence made best-effort.
- Cleanup: all TEST-RL appeals removed (restore of pre-test backup 11-09-44 + verified 0 left), test reviewers disabled + lockout verified, test content soft-deleted. Backups dir holds run backups + safety copies (retention active). No production content touched (only additive test rows, all reverted).
- Quality gate: tsc clean on touched files, build:client 7.99s OK, smoke health/search/sitemap/news 200, CSP report-only live, languages switch untouched, search/sitemap/admin regression green. One transient ENOBUFS 500 under burst load (Windows socket exhaustion, not app bug — direct retry 200).
- Known remaining/r risks: JWT still in sessionStorage (XSS=theft; httpOnly-cookie migration = Phase 3 breaking change), no HSTS (needs TLS deployment), CSP enforce mode pending console audit in prod, editor==admin breadth unchanged outside content (acts/library/media kept for editors by design), reviewer sees admin UI shell (visibility gated per-section, backend denies), backups on same disk (off-host copy still manual), curl.exe Win-only proxy retained, dead server/routes/* + schema drift retained, admin UI remains RU-only (portal is trilingual).

## PHASE 3 AFTER 2026-09-23 - DONE (current_version v2.1.3, previous v2.0)
- Versions/tags (all pushed, verified via ls-remote): v2.1.0 Phase1+2 lock-in (e58de8f), v2.1.1 SEC-05 cookie auth (e9c97b0), v2.1.2 SEC-06/07+curl removal (9d23da5), v2.1.3 cleanup+docs (6040e4d). Branch release-2.0 = 6040e4d on GitHub. No history rewrite, no force-push.
- Backups C:\SUD_TJ_Backups\: 2.1.0 (8160 files, 151MB), 2.1.1 (8188), 2.1.2 (8189), 2.1.3 (8182, 154MB) — each manifest+checksums+restore-test-staging verified. Off-disk copy still MANUAL (single C: disk; GitHub covers code only).
- SEC-05: login sets cms_token httpOnly/SameSite=Lax/Secure-on-HTTPS; auth reads cookie||Bearer; POST /api/admin/auth/logout; CSRF Origin/Referer check for cookie-authed mutations; CORS credentials:true + both localhost origins. Frontend: 15 modules migrated to cookie transport (adminHttp.ts + cfetch in CourtSiteAdmin), zero cms-token/sessionStorage refs in src; session restores from cookie on reload. Tests 11/11 (cookie create/delete, evil-origin 403, Bearer fallback, logout>401).
- SEC-06: CSP enforce (identical allowlist, pages 200 under enforcement). SEC-07: HSTS opt-in CMS_HSTS=1, default off (no prod TLS confirmation).
- Cross-platform: curl.exe gone (utils/fetch.ts timeout+size caps, ipv4first DNS); smoke pdf 400/403 paths green (real external fetch 502 = no outside net, documented).
- Cleanup: deleted TurnFlipBook/ElectronicLibraryView/ConstitutionReader(.css)/jquery+turn.min.js (zero-import verified, build green). Schema drift table: db/schema.ts has regions/region_id FKs, content.cover_image TEXT+region_id, media.file_name/file_size/uploader+deleted_at, appeals.ref_number, revisions/site_settings/contact_info/reception_schedule/publication_schedule tables, audit_log 10 cols — live DB has none of these (TEXT region, cover_image_id INT, filename/size/uploaded_by, no ref_number, audit 4 cols); dead routes/admin.ts would crash on connect — kept, do not mount.
- Continuity: README (install/run/migrate/recovery/env/git), .env.example (+CMS_COOKIE_SECURE/CMS_HSTS), CHANGELOG.md, scripts documented. Clean-clone test PASSED: clone 8178 files > install frozen > build 6.34s > boot :8877 fresh DB > health/news/search 200.
- Changed files: +scripts/{backup,restore-test}.mjs, +server/{middleware/rateLimit,rbac,utils/{cache,fetch},routes/{search,system}}, +adminHttp + GlobalSearchModal/SitemapPage/NotFoundPage/Breadcrumbs/usePageMeta, -dead readers, ~25 modified. DB state: additive columns only (review_*, published_by); counts in v2.1.3 manifest.
- v2.1.4 (21deb99, tag pushed): fixed enforced-CSP breaking Vite dev hydration on :8787 SSR (inline @react-refresh preamble blocked → raw unstyled page). `CMS_CSP_MODE` added (enforce prod-default / report-only dev-default / off). Verified: :8787 sends Report-Only, preamble + entry-client + SSR content present, health 200. Backup 2.1.4 (8183 files) + restore-test green, pushed.
- v2.1.5 (tag pushed): footer «Полезные сайты» → marquee-ticker (36s loop, hover-pause, reduced-motion off, a11y-hidden duplicate). Backup 2.1.5 (8183 files) + restore-test green, build 7.26s.
- v2.1.6 (tag pushed): SCROLL_GLASS_PERFORMANCE_OPTIMIZATION. Audit findings: (1) ScrollVideo setState×2 per scroll tick + transition-transform fighting updates + scrollHeight forced reflow → rAF + direct DOM writes + cached maxScroll, transition removed; (2) Reveal transition-all + permanent will-change + re-toggling observer → opacity/transform only, will-change pre-reveal only, disconnect-after-first-show; (3) FoliantReader PDF progressive layout shift → aspect-ratio reservation (first decoded page sets exact ratio, 3/4 fallback). Deliberately NOT touched: content-visibility (breaks gsap ScrollTrigger measurements + anchor scrolling), modal backdrops (opacity-only transitions), hover box-shadow micro-transitions, mount-only motion blur, tiered canvas rain. Instrumental profiling unavailable in sandbox (no browser) — verification: tsc clean, build 7.02s, smoke 11×200, backup 8183 + restore-test green. No visual/functional changes by design.
- v2.1.7 (tag pushed): swapped homepage sections 001 Hero ↔ 006 Judicial Information (order + on-screen numbers, hero next-scroll → contacts). tsc clean, build 6.87s, backup 8183 + restore-test green.
- v2.1.8 (tag pushed): fixed dead «Саҳифаҳо» menu buttons. Audit: all 24 JudicialModal tabs have content (subagent-verified), all API lists non-empty (acts 3, hearings 8, courts 77, news 11) — real cause was anchor links dead on non-home pages (no element → no scroll). Fix: navigate('/') + delayed smooth scroll via useNavigate (no reload, mobile menu covered). tsc clean (1 pre-existing), build 6.79s, backup 8183 + restore-test green.
- v2.2.0 (tag pushed): Phase 3 foundation. tokens.css imported in entry-client (no visual change by construction: new vars only). tsc clean (pre-existing only), build 6.85s, backup 8183 + restore-test green.
- v2.2.1 (tag pushed): portal base UI kit (Badge/Card/Input/Select/Table/Tabs/Modal/EmptyState, admin-compatible APIs, theme tokens); dead btn dupes removed (visuals unchanged by cascade analysis); SitemapPage proof-use. tsc clean, build 7.52s, backup 8184 + restore-test green.

## v2.2.1 BEFORE - base UI audit
- Button cascade: block1 (278-444) pill-mono system vs block2 btn-base system (554+). Effective winners (later in file): btn-primary = gold/white/rounded-xl (block2), btn-secondary/ghost/icon = block2 variants. Dead (overridden, safe to delete): block1 btn-primary/secondary/ghost/icon. Live uniques: btn-outline (block1 only), btn-base, btn-gold (=btn-primary alias, keep).
- Portal ui/: Button only. Admin ui/*10 complete. Plan: portal kit mirrors admin prop APIs (Badge/Card/Input/Select/Table/Tabs/Modal/EmptyState) styled with theme tokens + tokens.css scale; admin kit untouched (converge later). Proof-use: SitemapPage → Card/Badge (same gold visuals).

## PHASE 3 (IA + Premium UI) BEFORE 2026-09-23 - AUDIT
- Routes (no dupes, all public URLs kept): / /about /leadership /news|announcements|vacancies|journal/:slug /courts/:courtId /courts/:courtId/admin /library /sitemap +/* . No redirects needed (nothing renamed).
- Tokens: tailwind theme-* -> CSS vars (17 vars light/dark + a11y + 19 admin-* vars); app.* + court.* hardcoded palettes; keyframes fade-in-up only. No spacing/radius/z/glass token scale — GAP (v2.2.0 adds as aliases, zero visual change).
- Reusable: portal ui/Button only; admin ui/*10 (Button/Badge/Card/Modal/Input/Select/Table/Tabs/Drawer/EmptyState); portal globals .btn-*/.content-card/.site-container/.ticker; NO portal Badge/Input/Table/Tabs/Modal/Input utilities (inline Tailwind instead). Duplicates portal-vs-admin: buttons (pill-mono vs amber-gradient + digital-only-in-admin), badges (none vs AdminBadge), cards (content-card vs AdminCard), modals (JudicialModal family vs AdminModal/Drawer), inputs/tables/tabs/empty-states (none vs admin kit). Internal dupes: .btn-primary x2 (gold pill wins? blue @apply wins — UNRESOLVED, verify before DS unification), .btn-icon x2.
- Homepage order: ScrollVideo > 06Information(001) > quick-actions > case-search > my-cases > 02Mission > 03DigitalJustice(lazy) > 04courts > 05services > LegislativeLibrary(lazy) > 01Hero(006) > 07contacts.
- IA proposal (new URLs only, existing untouched): /practice (судебная практика: acts+categories+filters, reuses judicial_acts API), /citizens (гражданам hub: appeals form + reception + FAQ content type), /media (gallery: media API + categories), /statistics (stats API + charts, real data only), /international + /transparency + /careers (content type=page entries; pages created only when CMS content exists, else correct empty states). Legal info stays /library (add search/filters/status/versions UI incrementally; ADLIA-ready via source_url field). Citizens reuses POST /api/appeals + RBAC (no fake APIs).
- Homepage target mapping: header/nav (keep) + hero + quick services + search + news + announcements + activity + practice + stats + citizens + international + media + links + footer — deltas vs now: announcements preview, practice, stats, citizens, international, media blocks (future increments, real data or empty states, never fixtures).
- Token architecture v2.2.0: NEW src/styles/tokens.css — canonical scale (spacing 0-16, radius sm-xl-3xl-full, glass presets g1-g3, focus ring, transitions 120/220/350/700, z 0-80, container 1680) as NEW vars aliasing existing values; zero visual change; single import in entry.
- Implementation sequence: v2.2.0 tokens foundation (this) > v2.2.1 base UI (unify Button/Badge/Card/Input/Table/Tabs/Modal/EmptyState portal+admin, resolve .btn-primary/.btn-icon dupes) > v2.2.2 global shell (Navbar mega-nav active states, footer IA, mobile parity) > homepage blocks > sections > documents > citizens > stats/media > responsive > a11y > perf > regression.
- Risks: .btn-primary dupe resolution changes button look (gate with screenshots + admin/portal QA); unifying admin kit into portal shifts admin visuals (keep admin dark by scoping); no invented content (empty states where CMS empty).
- News sync 2026-09-23 (data only, no code change): audited live sud.tj press-center; local news lagged (newest was 2026-09-07). Added 4 verbatim Tajik items as published with original dates: majlisi-nazorati-haftaina-2026 (21.09, id=34), omodagi-jalasa-shuroi-raisoni-idm-2026 (11.09, id=35), seminari-omuzishi-malaakahoi-raqami-2026 (11.09, id=36), istiqloliyati-davlat-zaminai-tahkim-2026 (10.09, id=37, abridged body + original sign-off kept). Local news 7→11. No invented data; texts verbatim from sud.tj article pages.
- Tests total: tsc clean (pre-existing SettingsManager/LibraryPage warnings only), 3x build green, Phase2 35/35, SEC-05 11/11, P3-3 9/9, clone E2E green. No fabricated data; test rows reverted (appeals 0, reviewers disabled).
- Remaining risks: secrets only in local .env (gitignored, never in backups); login lockout 15min shared IP (documented); in-memory rate limits reset on restart (single-instance design); backups same-disk; admin RU-only; editor breadth by design; JWT Bearer fallback retained (documented transition).

## PHASE 3 BEFORE 2026-09-22 - BASELINE (Versioned backup + Git continuity + prod security)
- Git: branch release-2.0 tracking origin/release-2.0, tags [v2.0], HEAD cfcead8; Phase1+2 work uncommitted (27 modified + ~20 untracked incl. data/, public/images, public/lib). Identity BlackTecCom2000/dev@sud.tj configured; no gh CLI (push via git credential helper — verify at push).
- .gitignore covers .env/data sqlite/uploads/library; GAPS: data/backups/*.sqlite (password hashes!) + backups/ not ignored — hardening required before any commit.
- Versions: package.json 1.0.0, latest tag v2.0 -> new line v2.1.x (no rewrites): v2.1.0 = Phase1+2 lock-in; v2.1.1 = SEC-05 cookie auth; v2.1.2 = SEC-06/07 + curl removal; v2.1.3 = cleanup + continuity docs.
- Auth debt: 27 sessionStorage cms-token sites in 14 admin files + CourtSiteAdmin own flow; aiClient token-free (no change). Cookie plan: httpOnly SameSite=Lax (+Secure on HTTPS), Bearer fallback server-side, Origin/Referer CSRF check for cookie-authed mutations, logout endpoint, credentials:include frontend-wide.
- Backup dest: single disk C: (783GB free) -> primary C:\SUD_TJ_Backups\<version>\ outside repo; GitHub = code offsite; DB-hash backups excluded from git.
- Continuity gaps: README 1.6KB stub, .env.example 423B, no CHANGELOG.md, lockfile present (pnpm-lock.yaml), node v26.8.1.
- Rules: per-change backup+tests+commit+tag+push+verify; no force-push; no history rewrite; no public URL changes; no invented data.
