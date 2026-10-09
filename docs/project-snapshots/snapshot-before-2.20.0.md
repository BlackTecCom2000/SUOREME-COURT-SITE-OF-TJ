# Project Snapshot — BEFORE premium refinement (base: v2.19.3)

- Date: 2026-10-09
- Git: `874e183` (tag `v2.19.3`), branch `release-2.0`, remote mirror `main` in sync.
- Backup of this exact state: `C:\SUD_TJ_Backups\2.19.3 - neutral-glass-no-hue-drift\` (verify OK).
- Test suite: none — `package.json` has no test/lint scripts. QA = `tsc --noEmit` + `build:client` + smoke 11/11 + Playwright + mobile 375px. This is documented instead of invented.

## Architecture (verified)

`theme/presets.ts` (5 presets: glass-dark default, glass-light, glass-blue, glass-emerald, glass-royal)
+ DB `site_design_settings` (`theme_config_v1` JSON + `theme_preset`, published value is authoritative)
+ localStorage `supreme-court-theme`/`sud-theme` (explicit choice beats DB)
→ `theme/store.tsx` (validate, fingerprint, 30s poll) → `theme/cssVars.ts`
(`--theme-*`, `--glass-*`, `--lg-*` written inline on `<html>`)
→ `index.css` + `styles/tokens.css` + Tailwind `var()` aliases → components.
CMS: `SiteBuilder` + `LiquidGlassKit` → draft save → `POST /api/admin/site/publish` → public `GET /api/design-settings`.
First-paint defaults: `tokens.css`, `index.css :root/[data-theme=dark]`, `public/theme-bootstrap.js`.

## Card audit (~110 roots)

- ~68 fully token-driven glass (all homepage pods, `glass-card/chip/panel/premium`, `JudicialNewsHub`, `ui/Card`, nav shells, footer, `CourtSiteAdmin`, outer modal boxes).
- ~40 problematic, grouped:
  - Opaque light-breakers: `StateDutyCalculator` (outer `bg-[#f8f9fa]` + `dark:bg-[#1a2b49]` + gray/blue/red inners), 3D-slider 4/5 themes (`slate-950/95`, `#070b14/90`), `LibraryPage` reader (`#070a14`) + pager (`bg-white/5` invisible in light), 3 symbol stages (`#070b14`), Appeals/Media/Duty hex cards, admin `slate-900/90` inputs/cards, `gray-900` tooltips, guard `bg-[#04070f]`.
  - Flat-but-token (no blur): ~30 `bg-theme-bg/60` nested copies, `CourtSitePage` rows, `JudicialModal` bodies, `Section07Contacts` mobile (`p-6` only, glass ≥sm).
  - Duplicates: `.content-card`≡`.glass-card`≡`.glass-panel` (same rule, 3 names), `ui/Card` vs `AdminCard`, 4 modal shells, slider theme fns mirrored in `Slider3DManager`, 5+ navy hexes for one look.

## Why light feels cheaper (top-5)

1. Pod `0.88/0.80` near-opaque; working glass white `0.5–0.74` milky, no depth.
2. Shadows/borders tuned for dark; light shadow `0.06–0.12` too timid.
3. Muted text `#475569/#334155` on white veils risks < 4.5:1 in places.
4. Dead-dark nodes visible only in light (reader black box, symbol stages, slate pills).
5. No cool identity — plain white vs dark's moonlight character.

## Plan (locked with user)

- Phase 1 → 2.20.0: cool silver-blue light glass (preset + CSS + first-paint), light depth (shadows/borders/pod layering/muted contrast), flat public nodes to glass, shared inner-card class. Scope: public + modals + footer/nav.
- Phase 2 → 2.21.0: rest of public (3D-slider glass default, LibraryPage reader/pager, tooltips, emerald hardcodes, red-950 error, slate-800 pill).
- Phase 3 → 2.22.0: full admin (slate inputs, hex cards, AdminTable/Tabs/Modal/Drawer).
- Phase 4 → 2.23.0: dedupe, dead DB rows, Card API parity review.
- Per phase: snapshot file, QA gate, backup (same-disk `C:\SUD_TJ_Backups\`, NOT off-disk — disclosed), DB republish when theme tokens change, commit + annotated tag + push + `release-2.0:main` mirror + `ls-remote`.
- Out of scope: content/texts/logos/images, routes/API/business logic, dependencies, dark neutrality (v2.19.3 stands), `( 0x ) [ 00x / 007 ]` numbering system.
