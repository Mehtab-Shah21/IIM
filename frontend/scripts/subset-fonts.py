"""
Builds the self-hosted web fonts in frontend/fonts/ (ADR-005).

Google's "latin" subset ships the full weight axis (100-900) and about 300 glyphs. The site uses
Inter 400-700 for body text and Plus Jakarta Sans 700-800 for headings, and English text only,
so trimming both cuts about half the font bytes, which Lighthouse counts against mobile LCP.

Source files: the variable "latin" woff2 files that next/font/google downloads at build time
(Inter and Plus Jakarta Sans, both SIL Open Font License 1.1; licences in frontend/fonts/).

    python -m venv .venv && .venv/bin/pip install fonttools==4.60.1 brotli==1.1.0
    .venv/bin/python scripts/subset-fonts.py <inter-latin.woff2> <jakarta-latin.woff2>

Re-run only when the weights or character set below change.
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# Basic Latin, Latin-1 Supplement (accented names, ©, ×, ·, §), and the typography editors
# paste in: dashes, smart quotes, bullet, ellipsis, euro, trademark, arrows, minus, approx.
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A]
    + [0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x2248]
)
UNICODE_RANGE = "U+0020-007E, U+00A0-00FF, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2039-203A, U+20AC, U+2122, U+2190-2193, U+2212, U+2248"

FONTS = [
    # (output name, weight range)
    ("inter-latin-400-700.woff2", (400, 700)),
    ("jakarta-latin-700-800.woff2", (700, 800)),
]


def build(source: str, out: Path, weights: tuple[int, int]) -> None:
    font = TTFont(source)
    family = font["name"].getDebugName(1)
    axes = {a.axisTag: (a.minValue, a.maxValue) for a in font["fvar"].axes}
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "case"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)
    # Narrow the weight axis after subsetting (instancing first trips the subsetter's lazy tables).
    font = instancer.instantiateVariableFont(font, {"wght": weights}, updateFontNames=False)
    font.flavor = "woff2"
    font.save(out)
    print(f"{family} {axes} -> {out.name} wght {weights}: {Path(source).stat().st_size} -> {out.stat().st_size} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    out_dir = Path(__file__).resolve().parent.parent / "fonts"
    out_dir.mkdir(exist_ok=True)
    for source, (name, weights) in zip(sys.argv[1:], FONTS):
        build(source, out_dir / name, weights)
    print("unicode-range:", UNICODE_RANGE)
