"""
Generates public/favicon.ico, public/favicon-32x32.png, public/favicon-16x16.png
Design: #1A1A2E background, white filled square left, #E94560 outlined square right,
3px gap between squares — matching the app/icon.tsx design.
"""

import struct
import zlib
import os

# ── colours ──────────────────────────────────────────────────────────────────
BG   = (0x1A, 0x1A, 0x2E, 0xFF)   # #1A1A2E
WHITE = (0xFF, 0xFF, 0xFF, 0xFF)
RED   = (0xE9, 0x45, 0x60, 0xFF)  # #E94560
TRANS = (0x00, 0x00, 0x00, 0x00)

# ── PNG helpers ───────────────────────────────────────────────────────────────
def _chunk(tag: bytes, data: bytes) -> bytes:
    c = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", c)

def make_png(pixels: list[list[tuple]], size: int) -> bytes:
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    # RGB only — simpler and ICO tools handle transparency via mask
    rows = b""
    for row in pixels:
        rows += b"\x00" + bytes([v for px in row for v in px[:3]])
    idat = _chunk(b"IDAT", zlib.compress(rows, 9))
    iend = _chunk(b"IEND", b"")
    return sig + ihdr + idat + iend

def make_png_rgba(pixels: list[list[tuple]], size: int) -> bytes:
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    rows = b""
    for row in pixels:
        rows += b"\x00" + bytes([v for px in row for v in px])
    idat = _chunk(b"IDAT", zlib.compress(rows, 9))
    iend = _chunk(b"IEND", b"")
    return sig + ihdr + idat + iend

# ── pixel renderer ────────────────────────────────────────────────────────────
def render(size: int) -> list[list[tuple]]:
    """
    Render the logo mark at any square size.
    Two squares, each ~34% of canvas width, 3px-scaled gap between them.
    Left: white filled. Right: red outlined (2px-scaled border).
    """
    sq = max(4, round(size * 0.34))   # square side length
    gap = max(2, round(size * 0.09))  # gap between squares
    total = sq * 2 + gap
    ox = (size - total) // 2          # x offset to centre
    oy = (size - sq) // 2             # y offset to centre
    border = max(1, round(size * 0.06))  # outline thickness

    lx0, lx1 = ox, ox + sq                  # left square x range
    rx0, rx1 = ox + sq + gap, ox + total    # right square x range
    y0, y1 = oy, oy + sq

    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            in_left  = lx0 <= x < lx1 and y0 <= y < y1
            in_right = rx0 <= x < rx1 and y0 <= y < y1

            if in_left:
                row.append(WHITE)
            elif in_right:
                # outline only
                on_edge = (
                    x < rx0 + border or x >= rx1 - border or
                    y < y0 + border  or y >= y1 - border
                )
                row.append(RED if on_edge else BG)
            else:
                row.append(BG)
        pixels.append(row)
    return pixels

# ── ICO builder ───────────────────────────────────────────────────────────────
def make_ico(sizes: list[int]) -> bytes:
    """Build a multi-resolution ICO from PNG images embedded as PNG frames."""
    pngs = []
    for s in sizes:
        px = render(s)
        pngs.append(make_png_rgba(px, s))

    header = struct.pack("<HHH", 0, 1, len(sizes))  # reserved, type=1 (ICO), count
    offset = 6 + len(sizes) * 16
    entries = b""
    for i, (s, png) in enumerate(zip(sizes, pngs)):
        w = h = 0 if s == 256 else s  # 0 means 256 in ICO spec
        entries += struct.pack("<BBBBHHII",
            w, h,
            0,          # color count (0 = no palette)
            0,          # reserved
            1,          # planes
            32,         # bpp
            len(png),
            offset,
        )
        offset += len(png)

    return header + entries + b"".join(pngs)

# ── write files ───────────────────────────────────────────────────────────────
public = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(public, exist_ok=True)

for s, name in [(32, "favicon-32x32.png"), (16, "favicon-16x16.png")]:
    px = render(s)
    data = make_png_rgba(px, s)
    path = os.path.join(public, name)
    with open(path, "wb") as f:
        f.write(data)
    print(f"  wrote {name} ({len(data)} bytes)")

ico = make_ico([16, 32])
path = os.path.join(public, "favicon.ico")
with open(path, "wb") as f:
    f.write(ico)
print(f"  wrote favicon.ico ({len(ico)} bytes)")
print("Done.")
