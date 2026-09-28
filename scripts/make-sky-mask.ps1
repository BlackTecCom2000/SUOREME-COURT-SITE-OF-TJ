<#
  Generates an alpha mask for the court photographs so the live WebGL sky
  (CloudSky) shows through ONLY where the photo is actually sky.

  White  = keep the photo opaque (building, trees, plaza, lamps)
  Black  = photo removed, live clouds visible

  Sky is detected as a cool light blue: blue clearly above red, bright, and
  not blown out. Building limestone is warm (R >= B) and the dark window glass
  is far too dark to pass the brightness floor, so neither is cut out.

  Usage: powershell -File scripts\make-sky-mask.ps1
#>
param(
  [string]$Source = 'public\supreme-court-day.jpg',
  [string]$Out = 'public\supreme-court-sky-mask.png',
  [int]$Downscale = 3,
  [int]$BlurPasses = 5
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path $Source)) { throw "source not found: $Source" }

$src = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
$w = $src.Width
$h = $src.Height
Write-Host "source: $Source  ${w}x${h}"

# --- downscale for the blur pass, then we upscale the mask back up
$mw = [int]($w / $Downscale)
$mh = [int]($h / $Downscale)
$small = New-Object System.Drawing.Bitmap($mw, $mh)
$g = [System.Drawing.Graphics]::FromImage($small)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, $mw, $mh)
$g.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $mw, $mh)
$data = $small.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $mh)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

$mask = New-Object 'int[,]' $mw, $mh
$skyCount = 0

# The building occupies the central column almost the full height, so the
# "bright neutral" rule (which catches the photo's own baked-in clouds) is only
# allowed OUTSIDE that column and above the plaza.
$bldX0 = 0.32; $bldX1 = 0.68
$bldY0 = 0.06; $bldY1 = 0.95
$horizonGuard = 0.74   # below this the pavement would be caught as cloud

for ($y = 0; $y -lt $mh; $y++) {
  $row = $y * $stride
  $fy = $y / $mh
  for ($x = 0; $x -lt $mw; $x++) {
    $i = $row + $x * 4
    $b = $bytes[$i]
    $gch = $bytes[$i + 1]
    $r = $bytes[$i + 2]
    $fx = $x / $mw

    # A: cool bright blue sky
    $isSky = ($b -ge ($r + 16)) -and ($b -ge 132) -and ($gch -ge 100) -and ($r -ge 70)

    if (-not $isSky) {
      # B: the photograph's own clouds (bright, near neutral) - sky only
      $mx = [Math]::Max($r, [Math]::Max($gch, $b))
      $mn = [Math]::Min($r, [Math]::Min($gch, $b))
      $outsideBuilding = ($fx -lt $bldX0) -or ($fx -gt $bldX1) -or ($fy -lt $bldY0)
      if ($outsideBuilding -and $fy -lt $horizonGuard -and $r -ge 196 -and $gch -ge 198 -and $b -ge 200 -and ($mx - $mn) -le 30) {
        $isSky = $true
      }
    }

    if ($isSky) { $mask[$x, $y] = 0; $skyCount++ } else { $mask[$x, $y] = 255 }
  }
}
$small.UnlockBits($data)
$small.Dispose()
$src.Dispose()

# --- separable box blur, few passes, to avoid a hard cut line
$tmp = New-Object 'int[,]' $mw, $mh
for ($pass = 0; $pass -lt $BlurPasses; $pass++) {
  for ($y = 0; $y -lt $mh; $y++) {
    for ($x = 0; $x -lt $mw; $x++) {
      $sum = 0; $n = 0
      for ($d = -2; $d -le 2; $d++) {
        $xx = $x + $d
        if ($xx -ge 0 -and $xx -lt $mw) { $sum += $mask[$xx, $y]; $n++ }
      }
      $tmp[$x, $y] = [int]($sum / $n)
    }
  }
  for ($y = 0; $y -lt $mh; $y++) {
    for ($x = 0; $x -lt $mw; $x++) {
      $sum = 0; $n = 0
      for ($d = -2; $d -le 2; $d++) {
        $yy = $y + $d
        if ($yy -ge 0 -and $yy -lt $mh) { $sum += $tmp[$x, $yy]; $n++ }
      }
      $mask[$x, $y] = [int]($sum / $n)
    }
  }
}

# --- write alpha-only PNG at full resolution (nearest upscale keeps the edge tight)
$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$orect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$odata = $outBmp.LockBits($orect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$obytes = New-Object byte[] ($odata.Stride * $h)
$ostride = $odata.Stride
for ($y = 0; $y -lt $h; $y++) {
  $my = [int]($y / $Downscale)
  if ($my -ge $mh) { $my = $mh - 1 }
  $orow = $y * $ostride
  for ($x = 0; $x -lt $w; $x++) {
    $mx = [int]($x / $Downscale)
    if ($mx -ge $mw) { $mx = $mw - 1 }
    $a = $mask[$mx, $my]
    $i = $orow + $x * 4
    $obytes[$i] = 255
    $obytes[$i + 1] = 255
    $obytes[$i + 2] = 255
    $obytes[$i + 3] = $a
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($obytes, 0, $odata.Scan0, $obytes.Length)
$outBmp.UnlockBits($odata)

$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$outBmp.Save((Join-Path (Get-Location) $Out), [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

$pct = [math]::Round(($skyCount / ($mw * $mh)) * 100, 1)
$size = (Get-Item $Out).Length
Write-Host "mask: $Out  ${w}x${h}  sky=$pct%  size=$([math]::Round($size/1kb,1)) KB"

