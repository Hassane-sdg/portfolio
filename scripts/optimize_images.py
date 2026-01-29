"""
Python fallback optimizer using Pillow.
Usage:
  - Create a virtualenv or use your Python environment
  - pip install pillow
  - python scripts/optimize_images.py Images/profil.png

This script will generate Images/profil.optim.png and Images/profil.optim.webp (if webp supported).
"""
from PIL import Image
import sys
from pathlib import Path

if len(sys.argv) < 2:
    print("Usage: python scripts/optimize_images.py <path-to-image>")
    sys.exit(1)

src = Path(sys.argv[1])
if not src.exists():
    print(f"Source not found: {src}")
    sys.exit(1)

out_png = src.parent / (src.stem + ".optim.png")
out_webp = src.parent / (src.stem + ".optim.webp")

with Image.open(src) as im:
    im = im.convert('RGBA')
    im.thumbnail((400,400), Image.LANCZOS)
    # save optimized png
    im.save(out_png, optimize=True)
    print(f"Saved optimized PNG: {out_png}")
    # save webp if supported
    try:
        im.save(out_webp, 'WEBP', quality=80, method=6)
        print(f"Saved WebP: {out_webp}")
    except Exception as e:
        print(f"WebP not available or failed: {e}")

print("Done.")
