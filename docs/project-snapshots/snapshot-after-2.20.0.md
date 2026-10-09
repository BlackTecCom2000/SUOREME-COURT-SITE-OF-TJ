# Project Snapshot — AFTER Phase 1 (release v2.20.0)

- Date: 2026-10-09
- Git: `0d968e1` (tag `v2.20.0`), `release-2.0` = `main` = tag target (ls-remote verified).
- Backup: `C:\SUD_TJ_Backups\2.20.0 - phase1-cool-light-glass-public\` (verify OK, 8224 files).
- Scope delivered: public + modals + footer/nav (admin untouched — Phase 3).

## What changed (23 files, +215/−119)

- `theme/presets.ts` — `glass-light`: cool silver-blue surfaces, deeper shadows.
- `index.css` — `:root` light mirror, layered cool hero pod, new shared `.glass-nest` (+`@supports` fallback).
- `styles/tokens.css` — cool first-paint surfaces.
- `calculator/StateDutyCalculator.tsx` — opaque panel/inputs/buttons/red/blue boxes → glass system.
- `sections/Section05CourtServices.tsx` — mini-calc input → `glass-input`, reception boxes → nest.
- `sections/Section07Contacts.tsx` — panels glass on mobile too, rows → nest.
- `sections/Section09CitizenAppeals.tsx`, `Section10SupremeCourt.tsx` — rows → nest.
- `judicial-ecosystem/*ContextHub.tsx` (3) — rows → nest.
- `sites/CourtSitePage.tsx` — carousel wrapper/tiles/rows/president card → glass/nest.
- `digital-court/CaseDashboard.tsx`, `InteractiveProcessFlow.tsx`, `CaseSearchEngine.tsx` (case card) — nest.
- `Footer.tsx` — monogram disc → nest.
- `JudicialModal.tsx` — ~40 bodies/cells/pill → nest (headers, tab selection, semantic boxes, book art, table wrapper left).
- `symbols/InteractiveThemis/JusticeScales/JudicialHammer.tsx` — control pills readable in light, gold actives via `text-theme-gold`.
- `package.json` 2.20.0, `CHANGELOG.md` entry, this snapshot dir.

## QA results

- `tsc --noEmit`: 0 errors. `build:client`: success.
- Smoke 11/11 HTTP 200 (restarted :8787).
- Playwright: light hero/services/contacts/bank-acts modal, dark hero/services/contacts — premium and readable; 375px scrollWidth = clientWidth.
- Console: only pre-existing React hydration #425/#418/#422 + WASM CSP (present on unmodified paths, documented since v2.18.x).
- No DB republish: published config is dark-scheme (untouched); light flows from code preset.

## Deliberately left (with reason)

- Symbol stage photo frames + cinematic vignettes (content, bg invisible), gradient heroes, modal header/footer strips, tab selection states, emerald success box, gold info box, book-cover gradients, table `<tr>` rows, tiny link rows/chips/switchers/badges/inputs.
- `( 0x ) [ 00x / 007 ]` numbering, section rhythms, all texts/routes/APIs.

## Remaining for next phases

- Phase 2 → 2.21.0: 3D-slider opaque themes, LibraryPage reader/pager, gray-900 tooltips, red-950 error, remaining hardcodes.
- Phase 3 → 2.22.0: full admin (slate inputs, hex cards, AdminTable/Tabs/Modal/Drawer).
- Phase 4 → 2.23.0: dedupe, dead DB rows, Card API review. Final report after 2.23.0.
