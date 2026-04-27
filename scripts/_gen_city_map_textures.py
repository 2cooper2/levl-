"""Generate stylized city-map prints for Kansas City, Los Angeles, New York.
Style mimics Jazzberry Blue's framed-map series: warm cream background,
intersecting orange + dark-grey road network, city label top-right.
Output: scripts/models/city_<key>.png
"""
import os, math, random
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(OUT, exist_ok=True)

W = H = 1024
BG     = (231, 222, 198)        # warm cream
ORANGE = (211, 88, 50)
GREY   = (62, 62, 64)
DARK   = (36, 36, 40)
LIGHT  = (245, 240, 220)


def draw_city(name, key, seed=0, motif="grid"):
    random.seed(seed)
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    if motif == "grid":
        # Manhattan / grid streets
        spacing = 38
        for x in range(0, W, spacing):
            d.line([(x, 0), (x, H)], fill=DARK if (x // spacing) % 4 == 0 else GREY,
                   width=2 if (x // spacing) % 4 == 0 else 1)
        for y in range(0, H, spacing):
            d.line([(0, y), (W, y)], fill=DARK if (y // spacing) % 4 == 0 else GREY,
                   width=2 if (y // spacing) % 4 == 0 else 1)
        # Diagonal Broadway-ish
        d.line([(0, 60), (W, H - 100)], fill=ORANGE, width=4)
        # River-ish on the right
        for i in range(220):
            t = i / 220
            x = int(W - 80 + 30 * math.sin(t * 8))
            y = int(t * H)
            d.ellipse([x - 22, y - 4, x + 22, y + 4], fill=BG)

    elif motif == "freeway":
        # LA — sweeping freeway curves on a radial-ish layout
        # Background blocks
        for _ in range(60):
            x = random.randint(0, W); y = random.randint(0, H)
            sz = random.randint(40, 110)
            d.rectangle([x - sz, y - sz, x + sz, y + sz],
                        fill=ORANGE if random.random() < 0.25 else (245, 230, 200))
        # Freeway curves
        cx, cy = W // 2, H // 2 + 80
        for ang in range(0, 360, 20):
            r1, r2 = 90, 460
            ang_r = math.radians(ang)
            x1, y1 = cx + r1 * math.cos(ang_r), cy + r1 * math.sin(ang_r)
            x2, y2 = cx + r2 * math.cos(ang_r), cy + r2 * math.sin(ang_r)
            d.line([(x1, y1), (x2, y2)], fill=DARK, width=3)
        for r in (160, 260, 360):
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GREY, width=1)
        # Big freeway curve
        d.arc([60, 60, W - 60, H - 60], 200, 340, fill=ORANGE, width=6)

    elif motif == "river":
        # Kansas City — two rivers (Missouri + Kansas) meeting
        # Block grid base
        for x in range(0, W, 48):
            d.line([(x, 0), (x, H)], fill=GREY, width=1)
        for y in range(0, H, 48):
            d.line([(0, y), (W, y)], fill=GREY, width=1)
        # Missouri river — sweeping curve top-right
        pts = [(int(W * t), int(H * 0.35 + 80 * math.sin(t * 6) - t * 30))
               for t in (i / 60 for i in range(61))]
        for i in range(len(pts) - 1):
            d.line([pts[i], pts[i + 1]], fill=ORANGE, width=10)
        # Kansas river — joining from left
        pts2 = [(int(W * 0.10 + W * 0.4 * t), int(H * 0.55 - 60 * t))
                for t in (i / 30 for i in range(31))]
        for i in range(len(pts2) - 1):
            d.line([pts2[i], pts2[i + 1]], fill=ORANGE, width=8)
        # Highway crossings
        d.line([(60, H // 2 + 120), (W - 60, H // 2 - 80)], fill=DARK, width=4)

    # City label top-right
    try:
        fnt_lg = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf", 78)
    except Exception:
        fnt_lg = ImageFont.load_default()
    label = name.upper()
    bbox = d.textbbox((0, 0), label, font=fnt_lg)
    tw = bbox[2] - bbox[0]
    d.text((W - tw - 56, 50), label, fill=DARK, font=fnt_lg)

    # Pre-flip horizontally so text reads correctly through the print mesh's
    # mirrored UV (the existing Amsterdam print texture is flipped too).
    img = img.transpose(Image.FLIP_LEFT_RIGHT)
    out_path = os.path.join(OUT, f"city_{key}.png")
    img.save(out_path)
    print(f"saved {out_path}")


draw_city("Kansas City", "kansas_city", seed=12, motif="river")
draw_city("Los Angeles", "los_angeles", seed=37, motif="freeway")
draw_city("New York",    "new_york",    seed=99, motif="grid")
