<#
.SYNOPSIS
  Correct, additive rollback for SUD.TJ: restore a published version's tree and
  ship it as a NEW version+tag. History and existing tags are never rewritten,
  so every version stays reachable and the rollback itself is reversible.

.EXAMPLE
  powershell -File scripts\rollback.ps1 -List
  powershell -File scripts\rollback.ps1 -To 2.9.6 -Reason "visual regression" -WhatIf
  powershell -File scripts\rollback.ps1 -To 2.9.6 -Reason "visual regression"
#>
param(
  [switch]$List,
  [string]$To,
  [string]$Reason = 'rollback',
  [string]$NewVersion,
  [switch]$WhatIf
)

# native tools write warnings to stderr; rely on exit codes, not the error stream
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

# PowerShell 5.1's Get-Content assumes the system ANSI codepage for a file
# without a BOM, so reading our UTF-8 output with it corrupts every non-ASCII
# character and Write-Utf8NoBom then stores the corruption permanently. Always
# read UTF-8 explicitly.
function Read-Utf8Raw {
  param([string]$Path)
  [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

# ---------------------------------------------------------------- list
if ($List) {
  Say 'published versions (newest last)'
  $tags = & git tag -l --sort=v:refname | Where-Object { $_ -match '^v\d+\.\d+\.\d+$' }
  $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
  foreach ($t in $tags) {
    $sha = (& git rev-list -n 1 $t)
    $mark = if ($t -eq (git describe --tags --abbrev=0 2>$null)) { ' <- HEAD' } else { '' }
    $date = (& git log -1 --format=%ad --date=short $sha)
    $msg = (& git log -1 --format=%s $sha)
    Write-Host ("  {0,-10} {1,-9} {2}  {3}{4}" -f $t, $sha.Substring(0, 7), $date, $msg, $mark)
  }
  Write-Host "  branch: $branch"
  exit 0
}

if (-not $To) { Die 'specify -To <version> or -List' }

# ---------------------------------------------------------------- resolve target
$target = $To
if ($target -notmatch '^v') { $target = "v$To" }
if ((& git tag -l $target | Measure-Object).Count -eq 0) {
  Die "tag $target does not exist - run with -List to see published versions"
}
$targetSha = (& git rev-list -n 1 $target).Trim()
$headSha = (& git rev-parse HEAD).Trim()
Say "target  $target -> $($targetSha.Substring(0,7))"
Say "current $($headSha.Substring(0,7)) ($((& git describe --tags --abbrev=0).Trim()))"

if ($targetSha -eq $headSha) { Die 'already at that version - nothing to roll back' }

# ---------------------------------------------------------------- new version
if (-not $NewVersion) {
  $cur = (& git describe --tags --abbrev=0).Trim().TrimStart('v')
  $p = $cur -split '\.'
  $NewVersion = "$($p[0]).$($p[1]).$([int]$p[2] + 1)"
}
$newTag = "v$NewVersion"
if ((& git tag -l $newTag | Measure-Object).Count -gt 0) { Die "tag $newTag already exists" }

if ($WhatIf) {
  Say 'DRY RUN - nothing will be changed'
  Write-Host "    would restore tree of $target ($($targetSha.Substring(0,7))) as new version $newTag"
  Write-Host "    would set package.json version to $NewVersion"
  Write-Host "    would prepend CHANGELOG entry: v$newTag - Rollback to $target ($Reason)"
  exit 0
}

# ---------------------------------------------------------------- safety branch
$safety = "rollback/pre-$($headSha.Substring(0,7))"
Say "safety branch $safety"
& git branch $safety $headSha | Out-Null
Ok "current state preserved on $safety"

# ---------------------------------------------------------------- restore tree
Say "restoring tree of $target (history preserved, working tree replaced)"
& git checkout $targetSha -- . | Out-Null
if ($LASTEXITCODE -ne 0) { Die 'git checkout of target tree failed' }
# remove files that exist now but not in the target version
$currentFiles = & git ls-files
$targetFiles = & git ls-tree -r --name-only $targetSha
$toRemove = $currentFiles | Where-Object { $targetFiles -notcontains $_ }
foreach ($f in $toRemove) {
  if (Test-Path $f) { Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue }
}
if ($toRemove.Count -gt 0) { Ok "removed $($toRemove.Count) file(s) absent from $target" }
Ok "tree restored from $target"

# ---------------------------------------------------------------- verify build
Say "verify restored tree"
& node node_modules/typescript/bin/tsc --noEmit
if ($LASTEXITCODE -ne 0) { Die 'restored tree fails typecheck - aborting, nothing pushed' }
Ok 'tsc 0 errors'
& $pnpm run build:client | Out-Null
if ($LASTEXITCODE -ne 0) { Die 'restored tree fails build - aborting, nothing pushed' }
Ok 'build:client ok'

# ---------------------------------------------------------------- publish as new version
Say "publishing as $newTag"
$pkgPath = Join-Path $root 'package.json'
$pkg = Read-Utf8Raw $pkgPath | ConvertFrom-Json
$pkg.version = $NewVersion
Write-Utf8NoBom $pkgPath ($pkg | ConvertTo-Json -Depth 10)

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$entry = @"

## v$NewVersion - Rollback to $target ($Reason)
- Released: $stamp
- Restored tree from: ``$target`` ($($targetSha.Substring(0,7)))
- Previous state preserved on branch: ``$safety``
- The restored version remains available as tag ``$target``.
- QA: ``tsc 0``, ``build:client``.
"@
$changelog = Join-Path $root 'CHANGELOG.md'
$text = Read-Utf8Raw $changelog
$idx = $text.IndexOf("`n## ")
if ($idx -lt 0) { $text = $entry + "`n" + $text } else { $text = $text.Substring(0, $idx) + $entry + $text.Substring($idx) }
Write-Utf8NoBom $changelog $text

& git add -A -- . ':!data' | Out-Null
& git commit -m "v${NewVersion}: rollback to $target - $Reason" | Out-Null
if ($LASTEXITCODE -ne 0) { Die 'rollback commit failed' }
$sha = (& git rev-parse --short HEAD).Trim()
& git tag -a $newTag -m "v${NewVersion}: rollback to $target - $Reason" | Out-Null
Ok "commit $sha, tag $newTag"

# ---------------------------------------------------------------- push
$ok = $false
for ($i = 1; $i -le 6; $i++) {
  Say "push branch (attempt $i/6)"
  & git push origin HEAD 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Start-Sleep -Seconds 5
}
if (-not $ok) { Die 'branch push failed after 6 attempts' }
for ($i = 1; $i -le 6; $i++) {
  Say "push tag $newTag (attempt $i/6)"
  & git push origin $newTag 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Start-Sleep -Seconds 5
}
if (-not $ok) { Die 'tag push failed after 6 attempts' }
& git push origin $safety 2>&1 | Out-Null

Say 'verify remote'
& git ls-remote origin "refs/heads/$(git rev-parse --abbrev-ref HEAD)" "refs/tags/$newTag" | ForEach-Object { Write-Host "    $_" }

Write-Host ''
Write-Host "ROLLBACK COMPLETE"
Write-Host "  restored : $target ($($targetSha.Substring(0,7)))"
Write-Host "  new tag  : $newTag ($sha)"
Write-Host "  safety   : $safety (pre-rollback state)"
Write-Host "  forward  : powershell -File scripts\rollback.ps1 -To <current-version> -Reason \"...\""
