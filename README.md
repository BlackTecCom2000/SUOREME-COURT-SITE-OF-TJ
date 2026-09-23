# Supreme Court of the Republic of Tajikistan — Digital Platform (SUD.TJ)

Official digital judicial platform: public portal (TJ/RU/EN) + court subsites + e-library + integrated admin CMS + hybrid AI assistant.

## Tech Stack

- **Frontend**: React 18, Vite 5, TailwindCSS 3, React Router 7, motion, GSAP, three.js (lazy)
- **Backend**: Express 5 (Node.js), better-sqlite3 (WAL), JWT (httpOnly cookie + Bearer fallback), zod, multer 2.x
- **CMS**: integrated admin dashboard (`/admin`) — RBAC, editorial workflow, audit log, backups
- **AI**: hybrid RAG (FTS5 + embeddings) via Ollama or OpenAI-compatible gateway

## Requirements

- **Node.js**: v22+ (developed/tested on v26.8.1; portable Node 22.16.0 for native modules)
- **pnpm**: v9+ (`npm i -g pnpm`); lockfile `pnpm-lock.yaml` is committed
- **Git**: 2.40+
- OS: Windows 10/11 or Linux (no OS-specific runtime deps since v2.1.2)

## Clean Install (new machine)

```bash
git clone https://github.com/BlackTecCom2000/SUOREME-COURT-SITE-OF-TJ.git
cd SUOREME-COURT-SITE-OF-TJ
cp .env.example .env        # then fill in secrets (see below)
pnpm install                # or: npm install
pnpm run build:client       # production frontend -> dist/client
```

## Environment Variables (see `.env.example` — never commit real `.env`)

| Variable | Required | Purpose |
|---|---|---|
| `CMS_PORT` | no (default 8787) | Backend API port |
| `CMS_ORIGIN` | no | Public frontend origin for CORS/CSRF allowlist |
| `CMS_JWT_SECRET` | **yes (prod)** | JWT signing secret (long random string) |
| `CMS_SEED_ADMIN_EMAIL` / `CMS_SEED_ADMIN_PASSWORD` | yes (first boot) | Initial super_admin account |
| `CMS_COOKIE_SECURE` | no (`1` = always Secure cookies) | Force Secure cookies (auto on HTTPS) |
| `CMS_HSTS` | no (`1` = enable) | HSTS — enable ONLY behind verified production TLS |
| `OLLAMA_BASE_URL` / `OLLAMA_CHAT_MODEL` / `OLLAMA_EMBED_MODEL` | no | Local AI (falls back to mock provider) |

## Running

```bash
pnpm run dev          # Vite frontend  -> http://localhost:5173
pnpm run server       # Express backend -> http://localhost:8787 (tsx)
pnpm start            # production: serves dist/client + API (needs build first)
```

Default admin: `admin@sud.tj` / value of `CMS_SEED_ADMIN_PASSWORD` at first boot → `/admin`.

## Database Setup & Migrations

- SQLite file `data/` is created automatically on first boot (`data/sudtj.sqlite`, WAL mode).
- Schema + lightweight migrations run inside `server/index.ts` on every boot (idempotent `ALTER TABLE` guards).
- Editorial workflow columns (`review_notes`, `reviewed_by/at`, `published_by`) migrate automatically.
- Seed data (duty tariffs, demo content) inserts only when tables are empty.

## Backup & Restore

- **DB-level** (in-app): `POST /api/admin/backups` → list; `POST /api/admin/backup` → snapshot to `data/backups/` (retention: 5 + 2 safety copies); `POST /api/admin/restore {name}` → integrity-checked atomic restore (super_admin only).
- **Full-project** (scripts, cross-platform, no deps beyond repo `node_modules`):
  ```bash
  node scripts/backup.mjs --version 2.1.3 --desc "Short description" [--dest C:\SUD_TJ_Backups] [--offsite DIR]
  node scripts/restore-test.mjs --version 2.1.3 [--dest C:\SUD_TJ_Backups]
  ```
  Backup layout: `<dest>/<version> - <desc>/{code,database,files,manifest.json,checksums.sha256}`.
  Excluded by design: `node_modules`, `dist`, `.env*` secrets, logs, `data/backups`.
- **Recovery**: copy the version dir back (code over repo, `database/sudtj.sqlite` over `data/`), `pnpm install`, `pnpm start`. Full steps per incident go to `Project_Snapshot.md`.
- **Off-host rule**: a backup on the same disk is NOT disaster recovery — copy every version off-disk (`--offsite`) and push code to GitHub.

## Git Workflow (mandatory per change)

1. Snapshot BEFORE in `Project_Snapshot.md` → 2. implement → 3. `tsc` + `build:client` + smoke tests → 4. `node scripts/backup.mjs --version X.Y.Z` → 5. verify + `restore-test` → 6. `git commit -m "vX.Y.Z: description"` → 7. `git tag -a vX.Y.Z` → 8. `git push origin <branch>` + `git push origin vX.Y.Z` → 9. verify on GitHub → 10. snapshot AFTER → 11. CHANGELOG entry.
- Never force-push, never rewrite published history, never overwrite a version.

## Versioning

`MAJOR.MINOR.PATCH`, tag `vX.Y.Z`. See `CHANGELOG.md` for history.

## Deployment Notes

- Full-stack app: needs Node.js runtime + persistent `data/` (SQLite, uploads, library). Static hosts alone are insufficient.
- Behind TLS: set `CMS_COOKIE_SECURE=1` and, after verification, `CMS_HSTS=1`.
- Production serves `dist/client` + API from one Express process (`pnpm start`).
