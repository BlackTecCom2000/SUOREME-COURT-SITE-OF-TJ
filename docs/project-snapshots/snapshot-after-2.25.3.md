# Project Snapshot — AFTER homepage layout fixes (v2.25.3)

- Date: 2026-10-12
- Git: `6f80197` + working changes → commit `v2.25.3`, branch `release-2.0`.
- Backup after: `C:\SUD_TJ_Backups\2.25.3 - homepage-layout-fixes\` (verify OK;
  same-disk, NOT off-disk — disclosed). Pre-change backup kept separately:
  `C:\SUD_TJ_Backups\2.25.3 - pre-layout-fixes\`. Old backups never
  overwritten.

## Disposition per brief issue (measured)

- UI-01: `DigitalConnectorNetwork` confirmed functional (active-region
  dimming, animated flow). Kept. Contained in `.judmap-panel` scrim band
  (v2.25.2); `-my-1` removed (v2.25.3, brief margin rule).
- UI-02: band measured 136px desktop / 246px mobile (SVG + padding only).
  Slim scrim strip, no decorative empty area. No further change.
- UI-03: desktop tops equal, widths 344px ×4; heights 816/1864/1433/1371 =
  real court counts (`items-start` deliberate). Mobile stacks 1 column.
  Verify-only, no change. No clipping/overlap at any size.
- UI-04: two footers, `static` + `relative`, normal flow. Contrast verified
  dark+light screenshots. No change.
- UI-05: root-caused by measurement (right 166px vs 122px reserved;
  108px/138px brand clipping). Fixed: navbar wraps to two rows on mobile
  (`flex-wrap`, `max-w-full`, `ml-auto`); verified clip=0 at 390+360,
  overflow=false. Desktop untouched. Search/menu 44px from v2.25.2 kept.
- UI-06: verified both themes on screenshots; center-card + sky fixes were
  v2.25.2. No new change.
- UI-07: overflow=false at 1920/1600/1366/768/390/360 × dark+light.
  Hydration #418/#422 pre-existing (no nondeterminism in judmap render;
  class-only diff cannot regress SSR HTML). `.judmap` `overflow-hidden`
  intact. Sticky-nav overlap in element captures is a capture artifact
  (fixed nav at viewport top), not a page defect.

## Files changed (v2.25.3)

- `src/components/Navbar.tsx` (3 classes: wrap, max-w, ml-auto)
- `src/components/judicial-map/JudicialSystemDashboard.tsx` (`-my-1` drop)
- `package.json` 2.25.2 → 2.25.3, `CHANGELOG.md`, this snapshot.

## QA

- `tsc --noEmit` 0 errors; `build:client` ✓ (rebuilt AFTER version bump,
  dist carries 2.25.3); smoke 11/11; Playwright repro at 6 sizes × 2 themes
  + targeted nav verify (clip 108/138 → 0).
- Helpers used and deleted: `.repro-layout.mjs`, `.repro2.mjs`,
  `.repro3.mjs`, `.measure-nav.mjs`, `.verify-nav.mjs`.
