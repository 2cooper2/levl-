"""Generate stylized city-map prints for Kansas City, Los Angeles, New York.
Style mimics Jazzberry Blue's framed-map series: warm cream background,
intersecting orange + dark-grey road network with block-fill density similar
to the Amsterdam reference. Output: scripts/models/city_<key>.png
"""
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(OUT, exist_ok=True)

W = H = 1024
BG     = (234, 224, 198)        # warm cream
BLOCK_LIGHT = (244, 236, 212)
BLOCK_MED   = (224, 213, 184)
BLOCK_PARK  = (188, 196, 154)   # park green-tan
ORANGE = (215, 96, 56)
ORANGE_DK = (170, 70, 38)
GREY   = (62, 62, 64)
DARK   = (28, 28, 32)


def add_grain(img, intensity=8):
    """Subtle paper grain on the cream background."""
    px = img.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, b = px[x, y]
            n = random.randint(-intensity, intensity)
            px[x, y] = (max(0, min(255, r + n)),
                        max(0, min(255, g + n)),
                        max(0, min(255, b + n)))


def fill_blocks(d, density=0.28):
    """Sprinkle small irregular blocks across the canvas in 2-3 cream tones."""
    n = int((W * H) * density / 1800)
    for _ in range(n):
        x = random.randint(0, W); y = random.randint(0, H)
        w = random.randint(18, 70); h = random.randint(18, 70)
        choice = random.random()
        if choice < 0.6:   col = BLOCK_LIGHT
        elif choice < 0.8: col = BLOCK_MED
        elif choice < 0.92:col = BLOCK_PARK
        else:              col = ORANGE
        d.rectangle([x - w//2, y - h//2, x + w//2, y + h//2], fill=col)


def grid_streets(d, spacing=24, jitter=4):
    """Dense fine-street grid in dark grey with subtle randomization."""
    for x in range(0, W, spacing):
        ox = random.randint(-jitter, jitter)
        d.line([(x + ox, 0), (x + ox, H)],
               fill=DARK if (x // spacing) % 6 == 0 else GREY,
               width=2 if (x // spacing) % 6 == 0 else 1)
    for y in range(0, H, spacing):
        oy = random.randint(-jitter, jitter)
        d.line([(0, y + oy), (W, y + oy)],
               fill=DARK if (y // spacing) % 6 == 0 else GREY,
               width=2 if (y // spacing) % 6 == 0 else 1)


def diagonal_avenues(d, count=4, color=ORANGE_DK):
    """Random diagonal avenues at varying widths."""
    for _ in range(count):
        x1, y1 = random.randint(0, W // 2), random.randint(0, H)
        x2, y2 = random.randint(W // 2, W), random.randint(0, H)
        d.line([(x1, y1), (x2, y2)], fill=color, width=random.choice([3, 4, 5]))


def radial_avenues(d, cx, cy, count=12, r_min=80, r_max=480, color=ORANGE):
    """Radial avenues out of a center point — used for Paris/LA-style layouts."""
    for i in range(count):
        ang = math.radians(i * 360 / count + random.uniform(-6, 6))
        x1, y1 = cx + r_min * math.cos(ang), cy + r_min * math.sin(ang)
        x2, y2 = cx + r_max * math.cos(ang), cy + r_max * math.sin(ang)
        d.line([(x1, y1), (x2, y2)], fill=color,
               width=random.choice([3, 4, 4]))


def ring_roads(d, cx, cy, radii, color=DARK, width=2):
    for r in radii:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=width)


def river_curve(d, points, color=BG, width=22):
    """Draw a flowing river using a polyline with thick stroke + lighter fill."""
    for i in range(len(points) - 1):
        d.line([points[i], points[i + 1]], fill=color, width=width)


def label(d, text, font_size=86, position=(W - 60, 50), color=DARK, anchor="ra"):
    """Top-right city label using a serif font (Times New Roman Bold)."""
    paths = [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    ]
    fnt = None
    for p in paths:
        if os.path.exists(p):
            try:
                fnt = ImageFont.truetype(p, font_size); break
            except Exception: pass
    if fnt is None: fnt = ImageFont.load_default()
    d.text(position, text, fill=color, font=fnt, anchor=anchor)


# ── per-city composers ───────────────────────────────────────────────────────

def draw_new_york(seed=42):
    random.seed(seed)
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    fill_blocks(d, density=0.32)
    grid_streets(d, spacing=22, jitter=3)
    # Manhattan diagonal: Broadway
    d.line([(W * 0.05, H * 0.15), (W * 0.65, H * 0.95)], fill=ORANGE, width=6)
    # FDR Drive (East River side)
    for y in range(0, H, 8):
        x = int(W - 80 + 28 * math.sin(y * 0.012))
        d.line([(x, y), (x, y + 10)], fill=ORANGE, width=3)
    # Hudson on the LEFT
    for y in range(0, H, 4):
        x = int(38 + 22 * math.sin(y * 0.009))
        d.ellipse([x - 38, y - 4, x + 30, y + 4], fill=BG)
    # Central Park: rectangular green strip
    cp_x1, cp_x2 = int(W * 0.32), int(W * 0.50)
    cp_y1, cp_y2 = int(H * 0.20), int(H * 0.55)
    d.rectangle([cp_x1, cp_y1, cp_x2, cp_y2], fill=BLOCK_PARK)
    grid_streets(ImageDraw.Draw(img.crop((cp_x1, cp_y1, cp_x2, cp_y2)).copy()),
                 spacing=999)  # no streets in park
    # Cross streets emphasized 14th, 23rd, 34th, 42nd, 57th, 72nd
    for y_pct in (0.18, 0.31, 0.46, 0.58, 0.73, 0.88):
        y = int(H * y_pct)
        d.line([(0, y), (W, y)], fill=ORANGE_DK, width=3)
    label(d, "NEW YORK", font_size=84, position=(W - 50, 50))
    add_grain(img)
    return img


def draw_los_angeles(seed=37):
    random.seed(seed)
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    fill_blocks(d, density=0.40)
    # LA's irregular grid + freeways
    grid_streets(d, spacing=30, jitter=6)
    # Major freeways (101, 110, 5, 405, 10) sweeping through
    cx, cy = W // 2, H // 2 + 60
    # 101 (Hollywood) east-west diagonal
    d.line([(0, H * 0.30), (W, H * 0.45)], fill=ORANGE, width=6)
    # 110 (Harbor) north-south through center
    d.line([(W * 0.55, 0), (W * 0.45, H)], fill=ORANGE, width=6)
    # 5 (Golden State) slant from upper-right to lower-left
    d.line([(W, H * 0.10), (W * 0.20, H)], fill=ORANGE, width=5)
    # 405 (San Diego) far west
    d.line([(W * 0.18, 0), (W * 0.10, H)], fill=ORANGE_DK, width=5)
    # 10 (Santa Monica) east-west lower
    d.line([(0, H * 0.78), (W, H * 0.70)], fill=ORANGE_DK, width=5)
    # Ring road + inner radial (like a downtown grid centered)
    radial_avenues(d, cx=int(W * 0.44), cy=int(H * 0.55), count=10, r_min=40, r_max=240, color=DARK)
    ring_roads(d, int(W * 0.44), int(H * 0.55), radii=[120, 200, 280], color=DARK, width=1)
    # Beach/Pacific on the bottom-left curve
    for x in range(0, int(W * 0.55), 6):
        y = int(H - 70 + 40 * math.sin(x * 0.01))
        d.ellipse([x - 4, y - 4, x + 60, y + 12], fill=BG)
    label(d, "LOS ANGELES", font_size=66, position=(W - 50, 50))
    add_grain(img)
    return img


def draw_kansas_city(seed=12):
    random.seed(seed)
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    fill_blocks(d, density=0.34)
    grid_streets(d, spacing=24, jitter=4)
    # Missouri River — curving across upper third
    pts = []
    for t in (i / 80 for i in range(81)):
        x = int(W * t)
        y = int(H * 0.30 + 80 * math.sin(t * 6) - t * 60)
        pts.append((x, y))
    river_curve(d, pts, color=ORANGE, width=14)
    # Kansas River — joining from west
    pts2 = []
    for t in (i / 40 for i in range(41)):
        x = int(W * 0.05 + W * 0.40 * t)
        y = int(H * 0.55 - 70 * t)
        pts2.append((x, y))
    river_curve(d, pts2, color=ORANGE, width=10)
    # Highways
    d.line([(0, H * 0.62), (W, H * 0.55)], fill=ORANGE_DK, width=5)  # I-70
    d.line([(W * 0.40, 0), (W * 0.55, H)], fill=ORANGE_DK, width=5)  # I-29/35
    d.line([(0, H * 0.84), (W, H * 0.84)], fill=ORANGE_DK, width=4)  # I-435 south
    # Plaza loop (downtown)
    cx, cy = int(W * 0.55), int(H * 0.70)
    ring_roads(d, cx, cy, radii=[60, 110], color=DARK, width=2)
    # Some park blocks
    for _ in range(8):
        x = random.randint(80, W - 200); y = random.randint(int(H * 0.45), H - 80)
        sz = random.randint(50, 110)
        d.rectangle([x, y, x + sz, y + int(sz * 0.7)], fill=BLOCK_PARK)
    label(d, "KANSAS CITY", font_size=68, position=(W - 50, 50))
    add_grain(img)
    return img


# ── render and save ──────────────────────────────────────────────────────────

for key, drawer in [("new_york", draw_new_york),
                    ("los_angeles", draw_los_angeles),
                    ("kansas_city", draw_kansas_city)]:
    im = drawer()
    # Pre-flip horizontally so the print mesh's mirrored UV reads correctly.
    im = im.transpose(Image.FLIP_LEFT_RIGHT)
    out = os.path.join(OUT, f"city_{key}.png")
    im.save(out)
    print(f"saved {out}")
