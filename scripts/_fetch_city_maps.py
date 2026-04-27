"""Fetch OpenStreetMap tiles for downtown KC, LA, Manhattan and composite
each into a 1024x1024 PNG with city name overlay. Output: scripts/models/
city_<key>.png — used as print textures by the art-frame trio.
"""
import os, math, time, urllib.request, ssl
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(OUT, exist_ok=True)

ZOOM = 12

CITIES = {
    "kansas_city": (39.0997, -94.5786, "Kansas City"),
    "los_angeles": (34.0522, -118.2437, "Los Angeles"),
    "new_york":    (40.7580, -73.9855, "Manhattan"),
}

UA = "LevlIconRenderer/1.0 (caydonac@gmail.com)"
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE

def lonlat_to_tile(lon, lat, z):
    x = (lon + 180.0) / 360.0 * 2**z
    rad = math.radians(lat)
    y = (1 - math.log(math.tan(rad) + 1/math.cos(rad)) / math.pi) / 2 * 2**z
    return x, y

def fetch_tile(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        data = r.read()
    return Image.open(__import__("io").BytesIO(data))

def fetch_city(lat, lon, name, key):
    cx, cy = lonlat_to_tile(lon, lat, ZOOM)
    # Center tile + 1 each side = 4x4 grid (covers city downtown nicely)
    tx0 = int(cx) - 2
    ty0 = int(cy) - 2
    SIZE = 4
    canvas = Image.new("RGB", (256 * SIZE, 256 * SIZE), (240, 240, 240))
    for dy in range(SIZE):
        for dx in range(SIZE):
            tx = tx0 + dx
            ty = ty0 + dy
            try:
                tile = fetch_tile(ZOOM, tx, ty)
                canvas.paste(tile, (dx * 256, dy * 256))
                time.sleep(0.15)
            except Exception as e:
                print(f"  [WARN] tile ({tx},{ty}) failed: {e}")
    # Crop the canvas (1024x1024 center) — already exactly 1024x1024
    # Add city label
    d = ImageDraw.Draw(canvas)
    paths = ["/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"]
    fnt = None
    for p in paths:
        if os.path.exists(p):
            try: fnt = ImageFont.truetype(p, 78); break
            except Exception: pass
    if fnt:
        # Render label on a small image, V-flip + paste at texture bottom-right
        # so the print mesh's UV (V-axis flipped, span v=0.193-0.998) lands it
        # at display top-right right-side-up.
        bbox = d.textbbox((0, 0), name.upper(), font=fnt)
        tw = bbox[2] - bbox[0] + 14
        th = bbox[3] - bbox[1] + 14
        ti = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        td = ImageDraw.Draw(ti)
        # subtle white halo for legibility on top of map
        for dx_, dy_ in [(-2,0),(2,0),(0,-2),(0,2),(-2,-2),(2,2),(-2,2),(2,-2)]:
            td.text((-bbox[0] + 7 + dx_, -bbox[1] + 7 + dy_), name.upper(),
                    fill=(255,255,255,220), font=fnt)
        td.text((-bbox[0] + 7, -bbox[1] + 7), name.upper(), fill=(15, 15, 15), font=fnt)
        ti = ti.transpose(Image.FLIP_TOP_BOTTOM)
        # Bottom-right of texture, inside front face UV (u≤0.811, v≥0.193)
        px = 800 - tw       # right edge at PIL x=800 → u≈0.78
        py = 819 - th       # bottom edge at PIL y=819 → v≈0.20
        canvas.paste(ti, (px, py), ti)
    out = os.path.join(OUT, f"city_{key}.png")
    canvas.save(out)
    print(f"saved {out}")

for key, (lat, lon, name) in CITIES.items():
    fetch_city(lat, lon, name, key)
