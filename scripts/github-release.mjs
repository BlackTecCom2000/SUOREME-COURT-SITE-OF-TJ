/**
 * SUD.TJ — GitHub Release publisher.
 *
 * Every release tag MUST also exist as a GitHub Release object: tags alone
 * are invisible to non-technical people and do not show on the repo front
 * page. This script is idempotent — running it twice never duplicates.
 *
 * Usage:
 *   node scripts/github-release.mjs --version 2.35.9 [--notes "..."]
 *   node scripts/github-release.mjs --backfill   # create Releases for every
 *                                                # tag that has none
 *
 * Auth: the token is read from the Windows Git credential manager
 * (the same credential that `git push` uses), so nothing is stored here.
 *
 * Notes source: the `## vX.Y.Z - Title` section of CHANGELOG.md. If the
 * section is missing (old tags), GitHub auto-generated release notes are
 * requested instead (generate_release_notes: true).
 */

import { execFileSync } from 'node:child_process';

const REPO = 'BlackTecCom2000/SUOREME-COURT-SITE-OF-TJ';
const API = `https://api.github.com/repos/${REPO}`;

function ghToken() {
  const out = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n',
    encoding: 'utf8',
  });
  const line = out.split(/\r?\n/).find((l) => l.startsWith('password='));
  if (!line) throw new Error('No GitHub credential found in the credential manager');
  return line.slice('password='.length).trim();
}

const TOKEN = ghToken();
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...HEADERS, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Full `## vX.Y.Z ...` section from CHANGELOG.md, or null. */
function changelogSection(version) {
  const text = readChangelog();
  const re = new RegExp(`^## v${version.replace(/\./g, '\\.')}\\b[^\\n]*`, 'm');
  const start = text.search(re);
  if (start === -1) return null;
  const rest = text.slice(start);
  const next = rest.slice(2).search(/^## /m);
  const section = next === -1 ? rest : rest.slice(0, next + 2);
  return section.trim();
}

import { readFileSync } from 'node:fs';
function readChangelog() {
  return readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
}

async function releaseForTag(tag) {
  // Releases are paginated; linear scan is fine for ~100 releases.
  const releases = await api('/releases?per_page=100');
  return releases.find((r) => r.tag_name === tag) || null;
}

async function createRelease(tag, { notes, backfill = false }) {
  const body = notes || '';
  const payload = {
    tag_name: tag,
    name: tag,
    body,
    // Auto notes (PRs/commits) only when we have no changelog text to show.
    generate_release_notes: !body,
    draft: false,
    prerelease: false,
  };
  const rel = await api('/releases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log(`[release] created ${tag} -> ${rel.html_url}${backfill ? ' (backfill)' : ''}`);
  return rel;
}

async function main() {
  const args = process.argv.slice(2);
  const version = args.includes('--version') ? args[args.indexOf('--version') + 1] : null;
  const notesArg = args.includes('--notes') ? args[args.indexOf('--notes') + 1] : null;
  const backfill = args.includes('--backfill');

  if (backfill) {
    const tags = execFileSync('git', ['tag', '-l', 'v*'], { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean);
    const releases = await api('/releases?per_page=100');
    const have = new Set(releases.map((r) => r.tag_name));
    let created = 0;
    for (const tag of tags) {
      if (have.has(tag)) continue;
      // CHANGELOG was regenerated 2026-09-29 from tag subjects, so only
      // recent tags have proper sections; the rest get auto notes.
      const version = tag.replace(/^v/, '');
      const notes = changelogSection(version);
      try {
        await createRelease(tag, { notes, backfill: true });
        created += 1;
      } catch (e) {
        console.error(`[release] ${tag}: ${e.message}`);
      }
    }
    console.log(`[release] backfill done: ${created} releases created, ${tags.length - created} already existed`);
    return;
  }

  if (!version) {
    console.error('Usage: node scripts/github-release.mjs --version X.Y.Z [--notes "..."] | --backfill');
    process.exit(1);
  }
  const tag = `v${version}`;
  if (await releaseForTag(tag)) {
    console.log(`[release] ${tag} already exists on GitHub — nothing to do`);
    return;
  }
  const notes = notesArg || changelogSection(version);
  if (!notes) console.log(`[release] no CHANGELOG section for ${version}, using auto-generated notes`);
  await createRelease(tag, { notes });
}

main().catch((e) => {
  console.error(`[release] FAILED: ${e.message}`);
  process.exit(1);
});
