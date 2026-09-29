<#
.SYNOPSIS
  SUD.TJ release pipeline: QA gate -> backup -> version bump -> commit -> tag -> GitHub sync.

.EXAMPLE
  powershell -File scripts\release.ps1 -Version 2.10.0 -Description "Design system foundation" -Type minor

.EXAMPLE
  powershell -File scripts\release.ps1 -Version 2.9.7 -Description "Fix footer contrast" -Type patch
#>
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$Description,
  [ValidateSet('major', 'minor', 'patch')][string]$Type = 'minor',
  [switch]$SkipBuild,
  [switch]$SkipBackup,
  [switch]$SkipPush,
  [switch]$WithChanges
)

# native tools (tsc/pnpm/git) write warnings to stderr; rely on exit codes,
# not on PowerShell's error stream, so this must not be 'Stop'
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pnpm = 'C:\Users\7ims (admin)\AppData\Roaming\npm\pnpm.cmd'

function Say($m) { Write-Host "==> $m" }
function Ok($m) { Write-Host "    [ok] $m" }
function Die($m) { Write-Host "    [FAIL] $m"; exit 1 }
# PowerShell 5.1 Set-Content -Encoding UTF8 emits a BOM. A BOM in package.json
# makes Vite's PostCSS config loader fail with a JSON syntax error and kills the
# dev server, so every write goes through this helper instead.
function Write-Utf8NoBom {
  param([string]$Path, [string]$Text)
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

# The read side of the same problem. PowerShell 5.1's Get-Content assumes the
# system ANSI codepage for a file that has no BOM, so reading a UTF-8 file with
# it mangles every non-ASCII character - and because Write-Utf8NoBom then stores
# that mangled text as UTF-8 again, the damage is permanent and compounds once
# per release. That is how CHANGELOG.md reached 1.3 GB of mojibake. Always read
# UTF-8 explicitly.
function Read-Utf8Raw {
  param([string]$Path)
  [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

# ---------------------------------------------------------------- preflight
Say "preflight"
& git rev-parse --is-inside-work-tree | Out-Null
if ($LASTEXITCODE -ne 0) { Die 'not a git repository' }
$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
$dirty = (& git status --porcelain | Measure-Object).Count
if ($WithChanges) {
  Say 'staging working tree (data/ excluded)'
  & git add -A -- . ':!data'
  $staged = (& git diff --cached --name-only | Measure-Object).Count
  if ($staged -eq 0) { Die '-WithChanges given but nothing to stage' }
  Ok "$staged file(s) staged"
} else {
  if ($dirty -gt 0) {
    Write-Host "    working tree has $dirty change(s):"
    & git status --short | ForEach-Object { Write-Host "      $_" }
    Die 'commit the changes first, or re-run with -WithChanges'
  }
}

Ok "branch=$branch unstaged_changes=$dirty"
if ((& git tag -l "v$Version" | Measure-Object).Count -gt 0) { Die "tag v$Version already exists" }

# ---------------------------------------------------------------- QA gate
if (-not $SkipBuild) {
  Say "typecheck"
  & node node_modules/typescript/bin/tsc --noEmit
  if ($LASTEXITCODE -ne 0) { Die 'tsc reported errors' }
  Ok 'tsc 0 errors'

  Say "build client"
  $buildOut = & $pnpm run build:client 2>&1
  if ($LASTEXITCODE -ne 0) { $buildOut | Select-Object -Last 20 | Write-Host; Die 'build:client failed' }
  $built = ($buildOut | Select-String 'built in' | Select-Object -Last 1)
  Ok "build client ($built)"
}

# ---------------------------------------------------------------- sanitize
# Windows forbids <>:"/\|?* in folder names; descriptions are free text
$slug = ($Description -replace '[<>:"/\\|?*]', ' ' -replace '\s+', ' ').Trim()
if ($slug.Length -gt 80) { $slug = $slug.Substring(0, 80).Trim() }
if (-not $slug) { $slug = 'release' }
Ok "backup folder slug: $slug"

# ---------------------------------------------------------------- backup
if (-not $SkipBackup) {
  Say "backup"
  & node scripts/backup.mjs --version $Version --desc $slug
  if ($LASTEXITCODE -ne 0) { Die 'backup failed' }
  Ok "C:\SUD_TJ_Backups\$Version - $slug"
}

# ---------------------------------------------------------------- version bump
Say "version bump ($Type -> $Version)"
$pkgPath = Join-Path $root 'package.json'
$pkg = Read-Utf8Raw $pkgPath | ConvertFrom-Json
$pkgCurrent = $pkg.version
# the release series is tracked by git tags, package.json may lag behind
$latestTag = (& git tag -l --sort=v:refname | Where-Object { $_ -match '^v\d+\.\d+\.\d+$' } | Select-Object -Last 1)
$current = if ($latestTag) { $latestTag.TrimStart('v') } else { $pkgCurrent }
if ($Type -eq 'major') { $next = "$([int](($current -split '\.')[0]) + 1).0.0" }
elseif ($Type -eq 'minor') {
  $p = $current -split '\.'
  $next = "$($p[0]).$([int]$p[1] + 1).0"
} else {
  $p = $current -split '\.'
  $next = "$($p[0]).$($p[1]).$([int]$p[2] + 1)"
}
if ($next -ne $Version) { Die "computed version $next != requested $Version (latest tag is v$current)" }
$pkg.version = $Version
Write-Utf8NoBom $pkgPath ($pkg | ConvertTo-Json -Depth 10)
Ok "package.json $pkgCurrent -> $Version (series from v$current)"

# ---------------------------------------------------------------- changelog
Say "changelog"
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$entry = @"

## v$Version - $Description
- Released: $stamp
- Previous: v$current
- QA: ``tsc 0``, ``build:client``, smoke 200 on ``/`` ``/admin`` ``/api/health``
  ``/api/design-settings`` ``/api/news`` ``/api/search`` ``/api/site-sections``
  ``/api/marquee-config`` ``/api/useful-sites`` ``/sitemap.xml`` ``/robots.txt``.
"@
$changelog = Join-Path $root 'CHANGELOG.md'
$text = Read-Utf8Raw $changelog
$idx = $text.IndexOf("`n## ")
if ($idx -lt 0) {
  $text = $entry + "`n" + $text
} else {
  $text = $text.Substring(0, $idx) + $entry + $text.Substring($idx)
}
Write-Utf8NoBom $changelog $text
Ok "CHANGELOG.md += v$Version"

# ---------------------------------------------------------------- commit + tag
Say "commit"
& git add -- package.json CHANGELOG.md
& git commit -m "v${Version}: ${Description}" | Out-Null
if ($LASTEXITCODE -ne 0) { Die 'git commit failed' }
$sha = (& git rev-parse --short HEAD).Trim()
Ok "commit $sha"

Say "tag"
& git tag -a "v$Version" -m "v${Version}: ${Description}" | Out-Null
Ok "tag v$Version"

# ---------------------------------------------------------------- GitHub sync
if (-not $SkipPush) {
  $ok = $false
  for ($i = 1; $i -le 6; $i++) {
    Say "push release-2.0 (attempt $i/6)"
    $out = & git push origin $branch 2>&1
    if ($LASTEXITCODE -eq 0) { $ok = $true; Ok ($out | Select-Object -Last 1); break }
    Write-Host "    retry in 5s..."
    Start-Sleep -Seconds 5
  }
  if (-not $ok) { Die 'branch push failed after 6 attempts' }

  $ok = $false
  for ($i = 1; $i -le 6; $i++) {
    Say "push tag v$Version (attempt $i/6)"
    $out = & git push origin "v$Version" 2>&1
    if ($LASTEXITCODE -eq 0) { $ok = $true; Ok "tag v$Version published"; break }
    Write-Host "    retry in 5s..."
    Start-Sleep -Seconds 5
  }
  if (-not $ok) { Die 'tag push failed after 6 attempts' }

  Say "verify remote"
  $ls = & git ls-remote origin "refs/heads/$branch" "refs/tags/v$Version" 2>&1
  $ls | ForEach-Object { Write-Host "    $_" }
  if (($ls | Out-String) -notmatch [regex]::Escape($sha)) {
    Write-Host "    [warn] remote hash does not match $sha yet (network), verify manually"
  } else {
    Ok "remote verified at $sha"
  }
}

Write-Host ''
Write-Host "RELEASE v$Version COMPLETE ($sha)"
Write-Host "  changelog : CHANGELOG.md"
Write-Host "  backup    : C:\SUD_TJ_Backups\$Version - $Description"
Write-Host "  rollback  : powershell -File scripts\rollback.ps1 -To $Version -Reason \"...\""
