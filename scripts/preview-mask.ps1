$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Set-Location (Split-Path -Parent $PSScriptRoot)

$srcPath = (Resolve-Path 'public\supreme-court-day.jpg').Path
$maskPath = (Resolve-Path 'public\supreme-court-sky-mask.png').Path

$photo = New-Object System.Drawing.Bitmap($srcPath)
$mask = New-Object System.Drawing.Bitmap($maskPath)
$w = $photo.Width
$h = $photo.Height

function Read-Pixels($bmp) {
  $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $b = New-Object byte[] ($stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $b, 0, $b.Length)
  $bmp.UnlockBits($data)
  return @{ Bytes = $b; Stride = $stride; W = $bmp.Width; H = $bmp.Height }
}

$p = Read-Pixels $photo
$m = Read-Pixels $mask

$out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$o = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$d1 = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$d2 = $o.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$b1 = New-Object byte[] ($d1.Stride * $h)
$b2 = New-Object byte[] ($d2.Stride * $h)

$green = 0
for ($y = 0; $y -lt $h; $y++) {
  $prow = $y * $p.Stride
  $mrow = $y * $m.Stride
  $orow = $y * $d1.Stride
  for ($x = 0; $x -lt $w; $x++) {
    $pi = $prow + $x * 4
    $mi = $mrow + $x * 4
    $a = $m.Bytes[$mi + 3]
    # composite preview: photo where kept, green where removed
    if ($a -ge 128) {
      $b1[$pi] = $p.Bytes[$pi]; $b1[$pi+1] = $p.Bytes[$pi+1]; $b1[$pi+2] = $p.Bytes[$pi+2]
    } else {
      $b1[$pi] = 0; $b1[$pi+1] = 200; $b1[$pi+2] = 120; $green++
    }
    $b1[$pi+3] = 255
    # grayscale mask view: white = photo kept, black = removed
    $b2[$pi] = $a; $b2[$pi+1] = $a; $b2[$pi+2] = $a; $b2[$pi+3] = 255
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($b1, 0, $d1.Scan0, $b1.Length)
[System.Runtime.InteropServices.Marshal]::Copy($b2, 0, $d2.Scan0, $b2.Length)
$out.UnlockBits($d1); $o.UnlockBits($d2)

$out.Save((Join-Path $env:TEMP 'opencode\mask-composite.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$o.Save((Join-Path $env:TEMP 'opencode\mask-gray.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $o.Dispose(); $photo.Dispose(); $mask.Dispose()
Write-Host ("removed(green)={0:N1}%  files written to %TEMP%\opencode\" -f ($green / ($w * $h) * 100))
