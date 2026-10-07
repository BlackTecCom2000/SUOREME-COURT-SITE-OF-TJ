# Changelog

All releases of the SUD.TJ Supreme Court platform, newest first.

This file was regenerated on 2026-09-29 from the git tags and commit
subjects. The original had been corrupted into a mojibake fractal by a
PowerShell 5.1 encoding bug in `scripts/release.ps1`: it read this
UTF-8 file with `Get-Content`, which assumes the system ANSI codepage
for a file without a BOM, then wrote the mangled text back as UTF-8.
The damage compounded once per release and the file reached 1.3 GB, over
GitHub's 100 MB push limit. The scripts now read UTF-8 explicitly.

## v2.18.11 - Glass-card readability polish: ink shadows applied to every glass surface
- Released: 2026-10-02
- Previous: v2.18.10
- Added a single text-shadow treatment for all hero/glass typography
  (`.glass`, `.glass-card`, `.content-card`, `.liquid-glass-title-pod`)
  via `--glass-ink-shadow`: a soft white halo in light mode, a short dark
  shadow in dark mode. Small matte-glass surfaces now carry every label
  at AA-level contrast against the gradient tint.
- Browsers' screenshot check (Chromium headless): light hero unchanged but
  all body/title text now legible; dark unchanged.

## v2.18.10 - Light-scheme readability fix: toggle swaps the full palette (was dark colors on light background)
- Released: 2026-10-02
- Previous: v2.18.9
- Root cause of the "barely readable on light sections" report: the
  legacy light/dark toggle (Navbar sun/moon) called `store.patch({ scheme:
  newTheme })`, which updated only the scheme flag. CSS variables in
  `<html style>` stayed on the active dark preset, because `validateTheme`
  kept whatever colors the current theme held. Result:
  `data-theme="light"` brand new light pod backgrounds, but
  `--text-primary: #ffffff` and light-grey secondary colours still applied
  via `text-theme-text/text-theme-textSec` — white text on light glass.
- Fix: the toggle now runs `store.applyPreset(scheme === 'light' ?
  'glass-light' : 'glass-dark')`, so the entire design token set (colors,
  surfaces, glass radius, glow) switches with the scheme. Light mode now
  uses `textPrimary: #0b1220`, `textSecondary: #1e293b`,
  `textMuted: #475569`, `bg-primary: #f5f7fb` and the glass-light
  surfaces — readable over the day sky.
- QA: `tsc 0`, builds 0, smoke 11/11, verified in a real browser:
  toggle to light produces `data-theme="light"` + light `--theme-*` tokens,
  title color `rgb(11,18,32)`, description `rgb(30,41,59)`, screenshot
  shows high-contrast dark text on the light building.

## v2.18.9 - Security L-pass (L1–L7): perms, rate limits, CSP, HSTS, failed-login audit, dead code
- Released: 2026-10-02
- Previous: v2.18.8
- **L1** — `GET /api/admin/appeals` now requires `appeals.manage`; the
  handler was returning citizens' full name/phone/email to any logged-in
  role (viewer, reviewer, editor).
- **L2** — `GET /api/admin/settings` → `settings.manage`;
  `GET /api/admin/audit` → `users.manage`; the dashboard's `activity`
  field (last 8 `audit_log` rows) is now only included when the caller
  holds `users.manage`, otherwise `[]`.
- **L3** — `POST /api/duty/history` now behind `dutyLimiter`
  (30 req / 15 min / IP). It previously wrote to `duty_history` with no
  auth and no rate limit (DB spam vector). PoC: 30×201 then 429.
- **L4** — CSP narrowed: `connect-src 'self' ws: wss:` (was `+ https:`)
  and `img-src 'self' data: blob: https://images.unsplash.com
  https://www.google.com` (was `https:` — any origin). The only external
  image hosts actually used are the judicial-modal avatars (unsplash) and
  the admin useful-sites favicons (google s2/favicons); styles still allow
  `unsafe-inline` + Google Fonts for Tailwind. A stored-XSS (M2) payload
  can no longer beacon to arbitrary https origins via `fetch`/img.
- **L5** — failed logins are now written to `audit_log`
  (`action='login_failed'`, `object_title` = attempted email,
  `ip_address` = client IP) with an idempotent ALTER-migration adding
  `object_title`/`ip_address` columns for older DBs and an extended CREATE
  statement for fresh ones.   PoC: bad email/password returns 401 and writes the row
  `{"object_type":"auth","object_title":"brute@example.com","ip_address":"::ffff:127.0.0.1"}`.
  NOTE: the in-memory rate-limit store is per-process (resets on restart,
  not shared between instances) — fine for the single-instance deployment;
  if it is ever scaled out, swap `server/middleware/rateLimit.ts` for a
  Redis-backed limiter (comment documents this).
- **L6** — deleted dead routers `server/routes/public.ts` (never imported)
  and `server/routes/upload.ts` (never mounted; if mounted it would be a
  path-traversal via `?category=` plus an SVG allowlist hole).
- **L7** — `CMS_HSTS=1` set in the local `.env`; verified
  `Strict-Transport-Security: max-age=31536000; includeSubDomains` header
  is emitted (harmless over plain http, active behind TLS). Default remains
  env-gated (`CMS_HSTS=0` to disable).
- QA: `tsc 0`, builds 0, smoke 11/11 (`/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`),
  PoC matrix: admin JWT passes all four gated GETs (200), bad login → 401
  + audit row, duty limiter 429 at #31, fake-upload rejection still 415,
  test artifacts cleaned.

## v2.18.8 - Security M5: dependency updates — 6 advisories to 0 (multer, tiptap, qs, file-type)
- Released: 2026-10-02
- Previous: v2.18.7
- `pnpm audit --prod`: 6 → **0** vulnerabilities.
  - `multer` `2.0.0-rc.4` → `2.4.0`: fixes 5 advisories (3 high: crafted
    multipart field-name DoS, fd leak on aborted uploads, oversized array
    index; moderate: orphaned disk writes; low: fileFilter race) and drops
    the vulnerable `stream-file-type > file-type@16` chain entirely.
  - `@tiptap/*` `3.30.2` → `3.31.4`: high quadratic ReDoS in Markdown
    attribute parsing + `mergeAttributes()` `__proto__` injection.
  - `qs` `6.15.3` → `6.16.0` (via `express > body-parser`): 2 moderate
    DoS advisories.
- Multer 2.4 no longer provides the rc.4-only `detectedMimeType` /
  `originalName` / stream fields, so both upload handlers
  (`/api/admin/media`, `/api/admin/library/upload`) were migrated to the
  standard multer API (`f.buffer`, `f.originalname`) and content sniffing
  was **restored** with direct `file-type@21.3.1` (the patched line) —
  magic-byte detection still gates uploads server-side.
- Removed the dead `pnpm` field from `package.json` (pnpm 11 ignores it;
  `allowBuilds` already lives in `pnpm-workspace.yaml`) — clears the
  warning printed by every pnpm command.
- QA: `tsc 0`, builds 0, smoke 11/11, `pnpm audit --prod` = 0. Live
  upload PoC with a real admin token: `.txt` library → 201, real PNG →
  201 library + 201 media, text disguised as `image/png` → **415**
  (magic sniff rejects client-declared mime). Test artifacts cleaned.

## v2.18.7 - Security M4: opt-in `trust proxy` for correct client IPs behind a reverse proxy
- Released: 2026-10-02
- Previous: v2.18.6
- Express had no `trust proxy` setting: behind nginx/LB every request
  shares the proxy's socket address, so rate limiters (`login`,
  `appeals`, `questionnaire`, AI chat) and `audit.user_ip` keyed on the
  wrong IP — one external client could exhaust a shared limiter for
  everyone.
- Fix: new `TRUST_PROXY` env (documented in `.env.example`, default
  **off**). Accepts hop count (`1`), subnet name (`loopback`,
  `uniquelocal`) or IP list; `0/false/off` keeps the current behaviour.
  Deliberately opt-in: enabling it without a real proxy would let
  clients spoof `X-Forwarded-For` and bypass rate limits.
- QA: `tsc 0`, builds 0, smoke 11/11. PoC (split-brain test):
  default instance — 11 logins with 11 rotating spoofed
  `X-Forwarded-For` values → `401×10 then 429` (spoof ignored, limiter
  counts the real IP); instance started with `TRUST_PROXY=1` on :8788 —
  same 11 requests → `401×11, no 429` (XFF trusted, each spoofed IP is
  its own rate key). Test instance killed, main limiter reset
  (single login → 401).

## v2.18.6 - Security M3: SSRF-proof redirects in server-side fetch
- Released: 2026-10-02
- Previous: v2.18.5
- `fetchCapped` used `redirect: 'follow'` with a pre-fetch host check only
  on the **initial** URL — an allowlisted host (`sud.tj`, `adliya.tj`, …)
  answering `302 http://169.254.169.254/…` or `http://127.0.0.1:8787/…`
  would have been followed by the server (SSRF; `/api/library/pdf` is
  unauthenticated, so unauthenticated SSRF via an open redirect on any
  allowlisted domain).
- Fix (`server/utils/fetch.ts`): redirects are no longer auto-followed.
  Every hop (max 5) is re-validated by `assertSafeTarget` **before** the
  request is sent: protocol http/https, hostname ∈ caller allowlist, and
  DNS resolution public-only (`isPrivateIp` blocks loopback, RFC1918,
  link-local/metadata 169.254/16, CGNAT, multicast/reserved, IPv6
  ULA/link-local/mapped). `allowHosts` is now a required option; all 3
  call sites pass `LIB_PDF_HOSTS`.
- QA: `tsc 0`, builds 0, smoke 11/11, unit matrix (16 private + 4 public
  IPs, allowlist/protocol/DNS/suffix-spoof rejects) PASS; e2e negative —
  direct loopback fetch via `fetchCapped` → `Private address`; live PoC —
  `/api/library/pdf` returns 403 for loopback/metadata/evil-host targets,
  400 for `javascript:`, and **200 via a real 301** (`http://sud.tj/` →
  `https://sud.tj/`, 84 KB) proving manual redirect following works.

## v2.18.5 - Release metadata fix: package.json version restored (v2.18.4 tag shipped stale)
- Released: 2026-10-02
- Previous: v2.18.4
- The published `v2.18.4` tag (commit `a5bb567`) contains a stale
  `package.json` field `version: 2.18.3` — a local tooling glitch during
  that release reverted the version bump between QA and commit. The M2
  sanitizer code itself is intact in the tag; only the metadata field is
  wrong. Published tags are immutable, so the correction ships as a new
  patch release: `package.json` now reads `2.18.5`.
- Process fix: the version is verified three times around the commit
  (after bump, after QA+smoke, and from the committed blob itself before
  tagging) so a silent revert can never be tagged again.
- QA: `tsc 0`, `build:client`, `build:server`, smoke 11/11 paths
  (0 fail).

## v2.18.4 - Security M2: sanitize stored HTML at every write
- Released: 2026-10-02 (tagged; package.json version field stale — fixed in v2.18.5)
- Previous: v2.18.3
- Rich HTML stored in `shelf_books.content*` (public `/library` reader,
  `dangerouslySetInnerHTML`) and `content.body_*` (admin previews) is now
  sanitized **at write time** with a strict allowlist
  (`server/utils/sanitizeHtml.ts`, `sanitize-html`):
  - no script/style/iframe/form/svg/math and no event-handler attributes —
    stored XSS is neutralized even when CSP is off (dev mode /
    `CMS_CSP_MODE=off`), not only when `script-src 'self'` blocks it;
  - no `javascript:`/`data:` on href/src; no class/style attributes
    (blocks overlay/UI-redress markup inside the reader);
  - allowed: p/headings/lists/inline emphasis/blockquote/a/table/img/pre.
- Sanitized on: shelf-book create + PATCH, shelf-book version **rollback**
  (snapshots may predate this release), sync/import from allowlisted
  sources, content create + PATCH (`setRich` for body_*), content version
  rollback. Existing rows verified tag-free and harmless (no migration
  needed).
- QA: `tsc 0`, `build:client`, `build:server`, smoke 200 on `/` `/admin`
  `/api/health` `/api/design-settings` `/api/news` `/api/search`
  `/api/site-sections` `/api/marquee-config` `/api/useful-sites`
  `/sitemap.xml` `/robots.txt`. Live PoC: create/PATCH shelf-book with
  `<script>`/`onerror`/`javascript:`/`<iframe>`/`<svg onload>`/`<form>`
  payload → stored content keeps `<p>/<h2>/<strong>/<a href="https:">`
  and drops every vector (verified via public GET); dirty snapshot
  inserted directly into `shelf_book_versions` → rollback → stored
  sanitized; content `body_ru` sanitized on create and PATCH; all test
  artifacts removed from the DB.
## v2.18.3 - Security M1: strict public contract for /api/ai/chat
- Released: 2026-10-02 (pending tag)
- Previous: v2.18.2
- `/api/ai/chat` stays anonymous (citizens' AI assistant) but is now a
  validated contract instead of a raw LLM proxy (M1 of the white-box
  security audit):
  - `history[].role` must be `user|assistant` — a client-supplied
    `system` role was prompt injection into the model context;
  - `message` required after trim, ≤4000 chars (the modal textarea got
    the matching `maxLength`), history ≤200 turns × ≤8000 chars, only
    the last 40 turns go to the model (bounded token/cost);
  - `conversationId` must match `^[A-Za-z0-9_-]{1,64}$` before it can
    reach the DB; server-generated `new-<ts>` ids still round-trip.
  - invalid payloads → 400 `{"error":"Invalid request"}` before SSE
    headers are sent.
- QA: `tsc 0`, `build:client`, `build:server`, smoke 200 on `/` `/admin`
  `/api/health` `/api/design-settings` `/api/news` `/api/search`
  `/api/site-sections` `/api/marquee-config` `/api/useful-sites`
  `/sitemap.xml` `/robots.txt`; live PoC matrix: empty body, system
  role, path-traversal conversationId, 4500-char message and
  whitespace-only message all 400; valid request 200 SSE with
  citations/token/done events; conversation id reuse 200 and rows
  confirmed in `ai_conversations`/`ai_messages`.
## v2.18.2 - Security H2: require auth + RBAC for AI knowledge indexing
- Released: 2026-10-02 (pending tag)
- Previous: v2.18.1
- `/api/ai/index-knowledge` (was: unauthenticated POST that wrote to
  `knowledge_sources`/`knowledge_chunks` and triggered one embedding call
  per chunk — RAG poisoning + cost/DoS vector; H2 of the white-box
  security audit) now requires a session and `ai.manage`
  (super_admin/admin). `/api/ai/chat` stays public and rate-limited.
- `aiRouter` is mounted after the auth middleware so the guard runs
  before the route handler.
- QA: `tsc 0`, `build:client`, `build:server`, smoke 200 on `/` `/admin`
  `/api/health` `/api/design-settings` `/api/news` `/api/search`
  `/api/site-sections` `/api/marquee-config` `/api/useful-sites`
  `/sitemap.xml` `/robots.txt`; live matrix: anon 401, editor 403,
  super_admin passes guard, chat still public (400 on empty body).
## v2.18.1 - Security H1: remove hardcoded admin credentials
- Released: 2026-10-02 (pending tag)
- Previous: v2.18.0
- `AdminLogin.tsx` no longer prefills the demo email/password — the old
  default password was shipping in the public JS bundle (H1 of the
  white-box security audit). Both fields start empty.
- Local seed password rotated to a 24-char random value (kept in `.env`
  only; `.env` is git-ignored). The live `users` row was re-hashed; the
  old default password no longer authenticates (401).
- QA: `tsc 0`, `build:client`, `build:server`, smoke 200 on `/` `/admin`
  `/api/health` `/api/design-settings` `/api/news` `/api/search`
  `/api/site-sections` `/api/marquee-config` `/api/useful-sites`
  `/sitemap.xml` `/robots.txt`, login 200 (new) / 401 (old),
  `grep` for the old password = 0 in `dist/` and in the source tree.
## v2.18.0 - Courts admin CRUD and self-hosted fonts
- Released: 2026-10-02 13:58
- Previous: v2.17.0
- QA: `tsc 0`, `build:client`, smoke 200 on `/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`.
## v2.17.0 - Unified Glassmorphism Theme System
- Released: 2026-10-01 17:16
- Previous: v2.16.0
- QA: `tsc 0`, `build:client`, smoke 200 on `/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`.
## v2.16.0 - Browser audit fixes: SSR hydration restored, CSP-safe theme bootstrap, 17px body, 44px tap targets, heading outline
- Released: 2026-09-30 12:32
- Previous: v2.15.0
- QA: `tsc 0`, `build:client`, smoke 200 on `/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`.
## v2.15.0 - Theme transition as a CMS setting: variant, direction, blur, on/off, admin preview
- Released: 2026-09-30 09:00
- Previous: v2.14.0
- QA: `tsc 0`, `build:client`, smoke 200 on `/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`.
## v2.1.0 - Phase 1+2 lock-in - search, sitemap, RBAC, workflow, rate limiting, backup system
- Released: 2026-09-22 16:32

## v2.1.1 - SEC-05 httpOnly cookie auth + CSRF
- Released: 2026-09-23 10:01

## v2.1.2 - SEC-06 CSP enforce, SEC-07 HSTS config, curl.exe removal
- Released: 2026-09-23 10:56

## v2.1.3 - Cleanup dead readers, schema drift doc prep, continuity docs
- Released: 2026-09-23 11:00

## v2.1.4 - CSP report-only in dev, enforce in prod
- Released: 2026-09-23 11:14

## v2.1.5 - Useful links footer ticker
- Released: 2026-09-23 11:23

## v2.1.6 - Scroll glass performance optimization
- Released: 2026-09-23 12:20

## v2.1.7 - Swap sections 001 and 006
- Released: 2026-09-23 12:34

## v2.1.8 - Fix dead menu anchors
- Released: 2026-09-23 12:54

## v2.2.0 - IA and design tokens foundation
- Released: 2026-09-23 13:07

## v2.2.1 - Portal base UI kit
- Released: 2026-09-23 13:29

## v2.2.2 - Global shell navbar footer
- Released: 2026-09-23 13:52

## v2.3.0 - Legal search and repository
- Released: 2026-09-23 14:13

## v2.4.0 - Legal UX remediation
- Released: 2026-09-23 16:24

## v2.5.0 - Global Liquid Glass Premium Ultra
- Released: 2026-09-24 09:18

## v2.5.1 - Clean background cross-browser fallback
- Released: 2026-09-24 10:04

## v2.6.0 - Master liquid glass public admin login unified
- Released: 2026-09-24 10:23

## v2.7.0 - Real site footer liquid glass premium ultra
- Released: 2026-09-24 10:33

## v2.8.0 - Court network page liquid glass redesign
- Released: 2026-09-24 10:48

## v2.8.1 - Footer visual integration light glass
- Released: 2026-09-24 11:05

## v2.9.0 - Site CMS and live visual editor marquee
- Released: 2026-09-24 11:22

## v2.9.1 - Admin synced to public liquid glass
- Released: 2026-09-24 13:42

## v2.9.2 - Restore natural background liquid glass
- Released: 2026-09-24 13:52

## v2.9.3 - Redesign admin login to match public portal
- Released: 2026-09-24 14:13

## v2.9.4 - Finalize global liquid glass managed atmosphere
- Released: 2026-09-24 14:23

## v2.9.6 - sync admin with public liquid glass - one global system
- Released: 2026-09-28 13:36

## v2.9.7 - Release automation - version bump, QA gate, backup, tag, GitHub sync, safe rollback
- Released: 2026-09-28 15:59

## v2.10.0 - Interactive WebGL clouds around the court building via generated sky silhouette masks
- Released: 2026-09-28 17:28

## v2.10.1 - Design foundation - one type system, one palette, readable label sizes
- Released: 2026-09-28 17:55

## v2.10.2 - Component foundation - token-driven buttons and inputs, real focus rings, 11px label floor, Vite watch fix
- Released: 2026-09-28 18:12

## v2.10.3 - Admin and login on shared tokens - replaced 275-line brute-force contrast engine
- Released: 2026-09-29 09:40

## v2.10.4 - Accessibility and state kit - skip link, StateBlock loading/empty/error, semantic form colours
- Released: 2026-09-29 09:46

## v2.10.5 - Wire StateBlock into news and court sections, replace opaque black cards with glass
- Released: 2026-09-29 10:10

## v2.11.0 - Apple-style Liquid Glass material - specular rim, pointer-tracked light, spring press physics, reduced-transparency support
- Released: 2026-09-29 11:51

## v2.11.1 - Everything is glass - .glass IS the liquid material, all 10 surface variants unified, cyan accent removed, rain respects reduced-transparency
- Released: 2026-09-29 12:35

## v2.12.0 - Forms and readability - glass fields, 17px body, readable measure, consistent section headings
- Released: 2026-09-29 14:02

## v2.12.1 - Fix court network layout - min-w-0 columns, wrapping stats, clipped brand, panel overflow
- Released: 2026-09-29 14:15

## v2.12.2 - Remove matrix rain from 17 sections, cap atmospheric haze so the glass material stays readable
- Released: 2026-09-29 14:31

## v2.12.3 - Fix dark-mode vanishing building (broken night mask removed) and make clouds non-interactive - autonomous drift only
- Released: 2026-09-29 15:38

## v2.13.0 - Three-level spacing scale, breakpoint ladder to 1440, section rhythm, action-result-benchmark CTA copy
- Released: 2026-09-29 16:09

## v2.14.0 - Dark-mode clouds via masked veil, Skiper26 theme reveal, service worker and cache tiers
- Released: 2026-09-29 16:57
