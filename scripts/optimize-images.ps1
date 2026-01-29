# PowerShell image optimization script using ImageMagick (magick command)
# Usage: Open PowerShell in project root and run: .\scripts\optimize-images.ps1

$src = "Images\profil.png"
$webpOut = "Images\profil.optim.webp"
pngOut = "Images\profil.optim.png"

if (-Not (Test-Path $src)) {
    Write-Error "Source image not found: $src"
    exit 1
}

# Check for ImageMagick (magick)
$magick = Get-Command magick -ErrorAction SilentlyContinue
if ($magick) {
    Write-Host "ImageMagick found. Generating optimized images..."
    magick convert $src -resize 400x400 -strip -quality 80 $pngOut
    magick convert $pngOut -quality 80 $webpOut
    Write-Host "Generated: $pngOut and $webpOut"
    exit 0
}

# Fallback: try `cwebp` if available
$cwebp = Get-Command cwebp -ErrorAction SilentlyContinue
if ($cwebp) {
    Write-Host "cwebp found. Generating WebP..."
    & cwebp -q 80 $src -o $webpOut
    Write-Host "Generated: $webpOut"
    exit 0
}

Write-Warning "Neither ImageMagick (magick) nor cwebp were found."
Write-Host "Option A: Install ImageMagick (https://imagemagick.org) and rerun this script."
Write-Host "Option B: Use Python script scripts/optimize_images.py (requires Pillow)."; exit 1
