# Project Snapshot — BEFORE toolkit upgrade (base: v2.25.3)

- Date: 2026-10-12
- Git: `afd1a0c` (tag `v2.25.3`), branch `release-2.0`, working tree clean.
- Backup of this exact state: `C:\SUD_TJ_Backups\2.25.4 - pre-toolkit-upgrade\`
  (verify OK; same-disk, NOT off-disk — disclosed).
- Agent environment: OpenCode (NOT Antigravity IDE) — IDE extensions and
  Antigravity-side MCP servers cannot be installed from here; they are
  documented as manual steps. Repo-side deps + user-level opencode config
  (skills dir, opencode.jsonc) ARE manageable.

## Inventory (verified, not assumed)

- Repo deps: react 18.3.1, typescript 5.9.3, tailwindcss 3.4.19,
  lucide-react 1.49.0, motion 13.5.0, gsap 3.15.0, @playwright/test 1.63.0,
  clsx + tailwind-merge. Scripts: dev/server/build/build:client/start —
  NO test/lint scripts. No eslint/prettier/axe/storybook/shadcn configs.
- User skills (`~/.config/opencode/skills`, 60 present): figma* (8),
  frontend-design, frontend-developer, playwright, playwright-interactive,
  react-specialist, typescript-pro, tailwind-patterns, ui-*, ux-*,
  web-accessibility, wcag-audit-patterns, ui-ux-tester, microinteractions,
  theme-factory, design-bridge, anti-ui-slop-reviewer, browser-debugger…
- MCP: `opencode.jsonc` is a 3-line schema stub — NO MCP servers configured.
  Browser testing works via direct `@playwright/test` node import
  (chromium-1243, executablePath) — verified repeatedly this session.
- Registry reachable: axe-core 4.14.0, @playwright/mcp 0.0.83.
- prefers-reduced-motion already guarded in `judicial-map.css:61-64`.
- NOTE: motion + gsap both installed (pre-existing duplication, out of
  scope — brief forbids adding a third, not removing working code).

## Decision matrix (phase 2-3 result)

| Tool | Verdict | Reason |
|---|---|---|
| axe-core 4.14.0 (devDep) | INSTALL | Real gap (no a11y automation); tiny, maintained, Deque; verified by audit run |
| @playwright/mcp 0.0.83 (MCP server) | INSTALL | No MCP configured; official Microsoft server; user-level config + backup |
| Figma MCP | MANUAL | Needs Figma token + user auth; cannot complete from here |
| UX Pilot MCP | MANUAL | External service, needs API key + subscription decision |
| shadcn/ui | REJECT | Conflicts with bespoke Liquid Glass system; zero need |
| Storybook | REJECT | Heavy; Playwright screenshots + metrics cover isolation needs |
| ESLint / Prettier | DEFER | No config exists; whole-repo rollout = owner style decision + noisy diff; documented |
| pixelmatch / VR service | DEFER | Before/after PNG + metrics practice already works; no paid service approved |
| Lighthouse | TRY npx (no install) | No repo change; report result as-is |

## Plan → v2.25.4 (patch)

1. `pnpm add -D axe-core` (targeted; no full lockfile churn beyond addition).
2. `.audit-a11y.mjs` helper reusing the proven Playwright launch pattern;
   run homepage + admin login; record violations.
3. Add `playwright` MCP server to `opencode.jsonc` (backup file first);
   verify server spawns (`--help` / stdio handshake).
4. Lighthouse npx attempt vs localhost:8787 (both themes where possible).
5. Docs: `docs/TOOLKIT.md` (matrix, install commands, usage recipes).
6. Bump 2.25.3 → 2.25.4, CHANGELOG, tsc + build + smoke, post-backup,
   commit + tag + pushes, final report in brief format.
