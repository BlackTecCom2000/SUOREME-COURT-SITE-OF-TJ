$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Set-Location (Split-Path -Parent $PSScriptRoot)

# The day and night photographs share the same silhouette, so the night mask is
# derived from the day mask instead of re-segmenting a dark image. The sky is
# kept at a low alpha so the night sky's stars stay faintly visible behind the
# live drifting clouds.
$srcPath = (Resolve-Path 'public\supreme-court-sky-mask.png').Path
$outPath = Join-Path (Get-Location) 'public\supreme-court-sky-mask-night.png'
$skyAlpha = 90   # 0-255, ~35%

$m = New-Object System.Drawing.Bitmap($srcPath)
$w = $m.Width; $h = $m.Height
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$d = $m.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$b = New-Object byte[] ($d.Stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $b, 0, $b.Length)

$sky = 0
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $d.Stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    if ($b[$i + 3] -lt 128) { $b[$i + 3] = $skyAlpha; $sky++ }
    else { $b[$i + 3] = 255 }
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($b, 0, $d.Scan0, $b.Length)
$m.UnlockBits($d)

$out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $m.Dispose()

Write-Host ("night mask: public\supreme-court-sky-mask-night.png  ${w}x${h}  sky={0:N1}%  skyAlpha={1}  size={2} KB" -f ($sky/($w*$h)*100), $skyAlpha, [math]::Round((Get-Item $outPath).Length/1kb,1))
