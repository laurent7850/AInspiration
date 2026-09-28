"""Generate Laurent's LinkedIn profile banner (1584 x 396, LinkedIn's size).

The first version (16/09/2026) had no kept source and said "Enghien". This script
rebuilds it faithfully — colours, text sizes and positions measured on the original
PNG — and is the source of truth from now on.

Usage (from the repository root):
    python -m pip install pillow
    python scripts/linkedin/banniere_laurent.py

Writes marketing/linkedin/banniere-linkedin-laurent.png.

Layout rules (from the 16/09 brief): the profile photo covers the bottom-left corner
on desktop and LinkedIn crops the height on phones, so text starts past the left
third and keeps away from the edges.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
FONTS = ROOT / "scripts" / "guides" / "fonts"
OUT = ROOT / "marketing" / "linkedin" / "banniere-linkedin-laurent.png"

# Registered seat of Distr'Action SRL — the site says "Basé à Givry" everywhere.
LOCALITY = "Givry"

W, H = 1584, 396
TEAL = (94, 214, 190)
WHITE = (244, 247, 250)
SUBTITLE = (196, 208, 224)
MUTED = (150, 165, 186)
UNDERLINE = (52, 96, 92)

# Background: horizontal gradient, stops sampled every 100 px on the original.
STOPS = [
    (0, (13, 21, 36)), (108, (13, 21, 36)), (208, (13, 22, 37)), (308, (14, 23, 39)),
    (408, (14, 23, 40)), (508, (15, 24, 42)), (608, (15, 25, 44)), (708, (16, 26, 45)),
    (808, (16, 28, 47)), (908, (17, 29, 49)), (1008, (18, 30, 51)), (1108, (18, 31, 53)),
    (1208, (19, 32, 55)), (1308, (20, 34, 57)), (1408, (20, 35, 60)), (1508, (21, 36, 62)),
    (1583, (21, 37, 63)),
]

# Dot grid on the right: small crosses every 26 px, brightening to the right.
DOT_X0, DOT_Y0, DOT_STEP = 979, 40, 26
DOT_FROM, DOT_TO = (38, 50, 60), (72, 84, 94)

TEXT_X = 300


def font(weight: str, size: float) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / f"Poppins-{weight}.ttf"), size)


def lerp(a: tuple, b: tuple, t: float) -> tuple:
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def background_at(x: int) -> tuple:
    for (x0, c0), (x1, c1) in zip(STOPS, STOPS[1:]):
        if x <= x1:
            return lerp(c0, c1, (x - x0) / (x1 - x0))
    return STOPS[-1][1]


def build() -> Path:
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)

    for x in range(W):
        d.line([(x, 0), (x, H - 1)], fill=background_at(x))

    d.rectangle([0, 0, 7, H - 1], fill=TEAL)

    span = (W - 1) - DOT_X0
    for x in range(DOT_X0, W, DOT_STEP):
        colour = lerp(DOT_FROM, DOT_TO, (x - DOT_X0) / span)
        for y in range(DOT_Y0, H, DOT_STEP):
            d.point([(x, y), (x - 1, y + 1), (x, y + 1), (x + 1, y + 1), (x, y + 2)], fill=colour)

    d.text((TEXT_X, 104), "L’IA qui sert vraiment", font=font("Bold", 57.5), fill=WHITE)
    d.text((TEXT_X, 172), "aux PME", font=font("Bold", 57.5), fill=TEAL)
    d.text(
        (TEXT_X, 258),
        "Diagnostic  ·  Automatisation  ·  Conformité AI Act",
        font=font("Medium", 24.8),
        fill=SUBTITLE,
    )
    d.text(
        (TEXT_X, 303),
        f"Distr’Action SRL — {LOCALITY}, Belgique",
        font=font("Light", 20.8),
        fill=MUTED,
    )

    url_font = font("Medium", 25.7)
    url = "ainspiration.eu"
    left = 1309 - url_font.getbbox(url)[0]
    d.text((left, 304), url, font=url_font, fill=TEAL)
    right = left + url_font.getbbox(url)[2]
    d.rectangle([1309, 340, right, 341], fill=UNDERLINE)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, optimize=True)
    return OUT


if __name__ == "__main__":
    print(build())
