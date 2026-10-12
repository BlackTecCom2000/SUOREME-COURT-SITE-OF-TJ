# Project Snapshot — BEFORE homepage layout fixes (base: v2.25.2)

- Date: 2026-10-12
- Git: `6f80197` (tag `v2.25.2`), branch `release-2.0`, working tree clean.
  Remote: `release-2.0` = `6f80197`, tag `v2.25.2` pushed; `main` mirror
  lagging at `b19c217` (GitHub flaky — retry pending, no local divergence).
- Backup of this exact state: `C:\SUD_TJ_Backups\2.25.3 - pre-layout-fixes\`
  (verify OK; same-disk, NOT off-disk — disclosed, user copies manually).
- Test suite: none — `package.json` has no test/lint scripts. QA =
  `tsc --noEmit` + `build:client` + smoke 11/11 + Playwright (chromium-1243,
  executablePath) + overflow checks. Documented instead of invented.

## Stack (verified)

Vite 5 + React + Tailwind (tailwind.config.js `theme.*` → CSS vars) +
Express API on :8787 (`pnpm run start`), SPA served from `dist/client`.
Homepage judicial-map block: `JudicialSystemDashboard` (container `.judmap`,
`judicial-map.css` vars `--jm-*`) → `JudiciaryHeader` (title pod +
`LanguageSwitcher` + `SearchControl` + menu) → `TopCourtNavigation`
(3 court cards) → `DigitalConnectorNetwork` (circuit SVG, aria-hidden) →
4× `RegionalCourtPanel` → `JudiciaryFooter`. Footer: site `Footer.tsx`
(two `<footer>` in DOM — site footer is the last; map card well
strengthened in v2.25.1).

## Root causes (evidence, not guesses)

- UI-01 lines/markers = `DigitalConnectorNetwork.tsx:25-59` — designed
  circuit viz with `activeRegionId` dimming (`dim()` → 0.28) + `jm-flow`
  dash animation. NOT debug. Real defect was missing own band (fixed
  v2.25.2: `.judmap-panel` wrapper at `JudicialSystemDashboard:111`).
- UI-02 "empty panel" = same network pre-fix (bare SVG over photo).
  Post-v2.25.2 it is a slim scrim strip; height source = SVG
  `h-[110px]/lg:h-[130px]` + panel padding. No empty-for-decoration area.
- UI-03 unequal region heights = deliberate `items-start` with variable
  court counts (`JudicialSystemDashboard:113`). Tops/widths already aligned
  by grid; equalising heights would add dead whitespace. Verify, don't force.
- UI-04 footer-over-photo = site `Footer.tsx` in normal flow (no
  absolute/fixed on footer). Contrast of bottom caption over photo to verify
  in browser at both themes.
- UI-05 header = `JudiciaryHeader:71` row (`flex-col sm:flex-row`,
  languages left, search+menu right). v2.25.2 raised search/menu to 44px
  (`h-11`/`h-11 w-11`), dropdown wash `white/5` → `jm-gold/10`. Verify
  alignment + no overflow at 1920/1600/1366/768/390/360.
- UI-06 glass readability = `.judmap-panel` → `var(--glass-surface)` +
  blur/saturate + `var(--glass-shadow), var(--glass-highlight)`; titles use
  `--jm-text` (000 / F4F7FA per theme). Center-card `text-white` bug fixed
  v2.25.2. Verify body-text contrast on photo in both themes.
- UI-07 scroll/overlap = page grows on scroll (lazy-mount sections);
  two `<footer>` elements; SmoothScroll inertia breaks `scrollIntoView`.
  Reproduce in browser: measure `scrollWidth` vs `clientWidth` at 6 sizes,
  check z-index/negative-margin/overflow on `.judmap` (`overflow-hidden`
  present) and region panels.

## Risks

- GitHub flaky (21s connect timeouts) — pushes need retries; never rewrite
  published tags; mirror `main` only via `push -f origin release-2.0:main`.
- PowerShell 5.1: no `&&`/`??`/`rg`; long inline `node -e` breaks on
  quoting → `.mjs` helpers, deleted after use.
- No `margin` hacks allowed by brief (incl. my `-my-1` on the connector
  band — re-evaluate: drop it to stay strictly compliant).
- Content/routes/data/i18n must not change; tokens only, no new deps.

## Plan (this brief → v2.25.3, patch)

1. Reproduce: Playwright screenshots + overflow metrics at
   1920x1080, 1600x900, 1366x768, 768x1024, 390x844, 360x800, dark+light
   for the hero block (full-page shots impractical — lazy-grow).
2. Fix minimally: UI-01 keep+document; UI-02 tighten if needed; UI-03
   verify-only; UI-04 footer contrast/flow; UI-05 alignment/overflow;
   UI-06 surface/text tokens; UI-07 measured overflow/z-index audit.
3. Re-verify at 6 sizes, tsc + build + smoke, after-snapshot, backup
   `2.25.3 - homepage-layout-fixes`, CHANGELOG, commit + tag + pushes.
