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
    "kansas_city": (39.0997, -94.5786,  "Kansas City"),
    # Westside LA (Brentwood/West LA) — coast at far-left edge, ocean visible
    # but not dominant; ~5km inland from the Pacific.
    "los_angeles": (34.0600, -118.4400, "Los Angeles"),
    "new_york":    (40.7580, -73.9855,  "Manhattan"),
}

UA = "LevlIconRenderer/1.0 (caydonac@gmail.com)"
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE

def lonlat_to_tile(lon, lat, z):
    x = (lon + 180.0) / 360.0 * 2**z
    rad = math.radians(lat)
    y = (1 - math.log(math.tan(rad) + 1/math.cos(rad)) / math.pi) / 2 * 2**z
    return x, y

# Per-city background + water lavender shades (graduated dark→light for KC/LA/NY).
# Roads are always black; this just controls the land bg + water tint.
CITY_PALETTE = {
    #              (land bg RGB,            water lavender RGB,      building tint RGB)
    "kansas_city": ((220, 208, 240),        ( 78,  52, 162),         (200, 188, 224)),
    "los_angeles": ((232, 222, 248),        ( 95,  70, 178),         (215, 202, 236)),
    "new_york":    ((242, 235, 252),        (115,  88, 196),         (228, 218, 246)),
}

ROAD_BLACK = (15, 15, 18)


def osm_to_levl(img, key):
    """Recolor OSM standard tiles → Levl palette.

    Strategy: classify into FOUR explicit categories (water, park, land,
    building); everything else → BLACK. Catches all road types plus their
    anti-aliased outlines, dashes, and thin map lines that previously fell
    through and stayed light/washed out.

    OSM palette landmarks (approx):
      water       ~(170,211,223) — B>R, blueish
      park/forest ~(199,235,161) / (173,209,158) — G>R and G>B
      land bg     ~(242,239,233) / (255,244,195) beach — high+warm
      building    ~(217,208,201) gray-tan
      ALL ROADS   white / yellow / orange / pink → BLACK
      labels      dark text → BLACK (caught by ELSE branch)
    """
    bg, water, building = CITY_PALETTE.get(key, CITY_PALETTE["los_angeles"])
    src = img.convert("RGB")
    out = Image.new("RGB", src.size, bg)
    px_in = src.load()
    px_out = out.load()
    W_, H_ = src.size
    for y in range(H_):
        for x in range(W_):
            r, g, b = px_in[x, y]
            # water — distinctly blue
            if b > r + 8 and b > 175 and b > g - 5:
                px_out[x, y] = water
            # parks / green spaces — distinctly green
            elif g > r + 8 and g > b + 8 and g > 180:
                px_out[x, y] = bg
            # land background — high luminance, warm cream/beach (R ≥ G ≥ B
            # with all channels >170 covers cream land + pale beach yellow)
            elif r > 230 and g > 215 and b > 170 and r >= g and (r - b) < 90 and (g - b) < 70:
                px_out[x, y] = bg
            # buildings — gray-beige cluster
            elif 200 < r < 230 and 195 < g < 220 and 190 < b < 215 and abs(r - g) < 25 and abs(g - b) < 25:
                px_out[x, y] = building
            # everything else (any road, any text, any line) → BLACK
            else:
                px_out[x, y] = ROAD_BLACK
    return out


def fetch_tile(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        data = r.read()
    return Image.open(__import__("io").BytesIO(data))

def fetch_city(lat, lon, name, key, zoom=ZOOM):
    """The print mesh's visible UV is u=0.002-0.811 v=0.193-0.998 — only the
    LEFT 81% × TOP 80% of the texture is shown. So we paste the tile-stitched
    map so its CENTER falls at PIL (414, 405) instead of texture center (512,
    512), which puts the city's center at the visible UV center."""
    cx_tile, cy_tile = lonlat_to_tile(lon, lat, zoom)

    # Visible UV center in texture pixels
    UV_CX = int(((0.002 + 0.811) / 2) * 1024)   # ≈416
    UV_CY = int((1 - (0.193 + 0.998) / 2) * 1024)  # ≈405

    # Render city map at 5x5 = 1280×1280 then offset-paste to 1024 canvas.
    SIZE = 5
    map_w = 256 * SIZE
    panel = Image.new("RGB", (map_w, map_w), (240, 240, 240))
    tx0 = int(cx_tile) - SIZE // 2
    ty0 = int(cy_tile) - SIZE // 2
    # Pixel offset of the lat/lon center within the panel
    panel_cx = int((cx_tile - tx0) * 256)
    panel_cy = int((cy_tile - ty0) * 256)
    for dy in range(SIZE):
        for dx in range(SIZE):
            try:
                tile = fetch_tile(zoom, tx0 + dx, ty0 + dy)
                panel.paste(tile, (dx * 256, dy * 256))
                time.sleep(0.15)
            except Exception as e:
                print(f"  [WARN] tile ({tx0+dx},{ty0+dy}) failed: {e}")

    # Crop a 1024×1024 window from the panel centered on (panel_cx,panel_cy)
    # then offset within the texture so city center lands at UV center.
    canvas = Image.new("RGB", (1024, 1024), (240, 240, 240))
    src_x0 = panel_cx - UV_CX
    src_y0 = panel_cy - UV_CY
    crop = panel.crop((src_x0, src_y0, src_x0 + 1024, src_y0 + 1024))
    canvas.paste(crop, (0, 0))

    # Duotone recolor — convert to lavender palette to match Levl style.
    canvas = osm_to_levl(canvas, key)

    # V-flip the map BEFORE label paste. The print mesh's UV is DirectX-style
    # (PIL bottom → display top), so without this, OSM north (drawn at PIL
    # top) ends up at the frame's bottom — i.e., upside-down map. The label
    # block below has its own V-flip and stays at PIL bottom, which already
    # corresponds to display top-right — leave it alone.
    canvas = canvas.transpose(Image.FLIP_TOP_BOTTOM)

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
