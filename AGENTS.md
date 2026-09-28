# AGENTS.md — SUD.TJ Supreme Court Platform

## Repository facts (do not get these wrong)

- Working repo: `C:\Users\7ims (admin)\Downloads\SUOREME-COURT-SITE-OF-TJ-main\SUOREME-COURT-SITE-OF-TJ-main`
  (the parent folder is an empty Git repo on `master` — never run git there).
- Remote: `https://github.com/BlackTecCom2000/SUOREME-COURT-SITE-OF-TJ.git`
- Release branch: `release-2.0`. GitHub default branch: `main` (mirror of `release-2.0`).
- API: `pnpm run server` → port 8787. Frontend: `pnpm run dev` → port 5173 (proxies `/api` → 8787).
- Use `pnpm.cmd` on Windows. `rg` is not installed; use Grep/Glob tools.

## MANDATORY release protocol

This is a standing user instruction. Apply it to **every** completed change,
no matter how small. Never skip it because a change "looks cosmetic".

1. **+1 version.** Bump the version in `package.json` (`minor` for features/design
   work, `patch` for fixes). Never reuse or skip a number.
2. **QA gate.** All must pass before tagging:
   - `node node_modules/typescript/bin/tsc --noEmit` → 0 errors
   - `pnpm run build:client` → success
   - smoke: `/`, `/admin`, `/api/health`, `/api/design-settings`, `/api/news`,
     `/api/search`, `/api/site-sections`, `/api/marquee-config`, `/api/useful-sites`,
     `/sitemap.xml`, `/robots.txt` all HTTP 200
3. **Backup.** `node scripts/backup.mjs --version <X.Y.Z> --desc "<description>"`
   → `C:\SUD_TJ_Backups\<version> - <desc>\`. Data (`data/sudtj.sqlite`) is backed
   up but must never be committed to git.
4. **Commit + tag.** Conventional message `v<version>: <description>`.
   Annotated tag `v<version>`. History is **immutable** — tags are never moved.
5. **Sync GitHub.** `git push origin release-2.0` then `git push origin <tag>`.
   If the default branch must move: `git push -f origin main` (only ever
   `release-2.0`'s exact commit). Retry on network flakiness; do not give up
   after one failure.
6. **Verify remote.** `git ls-remote origin refs/heads/release-2.0 refs/heads/main refs/tags/v<version>`.

Automate with:

```powershell
powershell -File scripts\release.ps1 -Version 2.10.1 -Description "short desc" -Type minor
```

## Rollback

Rollback must be correct and reversible. **Never** rewrite or delete published
tags, and never `git reset --hard` a shared branch.

```powershell
# inspect available versions
powershell -File scripts\rollback.ps1 -List

# create a NEW version that restores an old one (safe, additive)
powershell -File scripts\rollback.ps1 -To 2.9.6 -Reason "visual regression"

# dry run first, then apply
powershell -File scripts\rollback.ps1 -To 2.9.6 -Reason "..." -WhatIf
```

`rollback.ps1` reverts to the tagged tree, verifies the build, and publishes a
new `v<new>` tag, so history stays linear and any version remains reachable.

## Design system rules (v2.9+)

- **One background, one glass system.** `GlobalBackground` renders the image +
  atmospheric overlay. Glass lives only on cards/buttons/inputs/modals/nav.
  `backdrop-filter` must NOT be on `body`, `main`, page halves or the login
  split — it caused a hard seam and blank pages.
- Background tokens (`--bg-*`) are independent from glass tokens (`--glass-*`).
  Overlay is weak (≤0.15) so the architecture stays visible and saturated.
- Public Portal, Admin and Login must read the same tokens. No separate admin
  dark theme, no opaque dark cards, no `#030712`/`bg-black/80` full-screen layers.
- Every glass surface needs a `@supports not (backdrop-filter: blur(1px))`
  fallback with enough opacity to stay readable.
- No stray white hairlines: avoid one-off `border-t border-theme-border/30` on
  sections. Section separation is done with spacing and background, not borders.
- Touch targets ≥ 44px. No horizontal overflow at 320px.

## Never do

- Never commit `data/`, `.env`, secrets, or `node_modules`.
- Never force-push `release-2.0` (only `main` mirror may be forced).
- Never leave a failing build tagged as a release.
