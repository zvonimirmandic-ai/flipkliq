"""
Generates:
  public/favicon.ico          — 16×16 + 32×32, BMP-format ICO (spec-compliant, Safari-safe)
  public/favicon-16x16.png    — 16×16 RGBA PNG
  public/favicon-32x32.png    — 32×32 RGBA PNG
  public/apple-touch-icon.png — 180×180 RGBA PNG

Design: #1A1A2E background, white filled square left, #E94560 outlined square right.
"""

import struct
import zlib
import os

# ── colours ───────────────────────────────────────────────────────────────────
BG    = (0x1A, 0x1A, 0x2E, 0xFF)
WHITE = (0xFF, 0xFF, 0xFF, 0xFF)
RED   = (0xE9, 0x45, 0x60, 0xFF)

# ── PNG helpers ───────────────────────────────────────────────────────────────
def _chunk(tag: bytes, data: bytes) -> bytes:
    c = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", c)

def make_png_rgba(pixels: list[list[tuple]], size: int) -> bytes:
    sig  = b"\x89PNG\r\n\x1a\n"
    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    rows = b""
    for row in pixels:
        rows += b"\x00" + bytes([v for px in row for v in px])
    idat = _chunk(b"IDAT", zlib.compress(rows, 9))
    iend = _chunk(b"IEND", b"")
    return sig + ihdr + idat + iend

# ── pixel renderer ────────────────────────────────────────────────────────────
def render(size: int) -> list[list[tuple]]:
    """Two squares, each ~34% of canvas width. Left: white filled. Right: red outlined."""
    sq     = max(4, round(size * 0.34))
    gap    = max(2, round(size * 0.09))
    total  = sq * 2 + gap
    ox     = (size - total) // 2
    oy     = (size - sq) // 2
    border = max(1, round(size * 0.06))

    lx0, lx1 = ox, ox + sq
    rx0, rx1  = ox + sq + gap, ox + total
    y0,  y1   = oy, oy + sq

    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            in_left  = lx0 <= x < lx1 and y0 <= y < y1
            in_right = rx0 <= x < rx1 and y0 <= y < y1
            if in_left:
                row.append(WHITE)
            elif in_right:
                on_edge = (x < rx0 + border or x >= rx1 - border or
                           y < y0 + border  or y >= y1 - border)
                row.append(RED if on_edge else BG)
            else:
                row.append(BG)
        pixels.append(row)
    return pixels

# ── BMP-format ICO builder ────────────────────────────────────────────────────
def _bmp_frame(pixels: list[list[tuple]], size: int) -> bytes:
    """
    Build a 32-bit BGRA DIB frame for embedding in an ICO.
    BMP rows are stored bottom-to-top; the AND mask follows (all zeros = use alpha).
    """
    pixel_data = b""
    for row in reversed(pixels):
        for r, g, b, a in row:
            pixel_data += bytes([b, g, r, a])

    # AND mask row stride must be a multiple of 4 bytes
    mask_stride = ((size + 31) // 32) * 4
    and_mask = b"\x00" * (mask_stride * size)

    bih = struct.pack(
        "<IiiHHIIiiII",
        40,               # biSize
        size,             # biWidth
        size * 2,         # biHeight — doubled (XOR mask height + AND mask height)
        1,                # biPlanes
        32,               # biBitCount
        0,                # biCompression (BI_RGB)
        size * size * 4,  # biSizeImage
        0,                # biXPelsPerMeter
        0,                # biYPelsPerMeter
        0,                # biClrUsed
        0,                # biClrImportant
    )
    return bih + pixel_data + and_mask

def make_ico(sizes: list[int]) -> bytes:
    frames = [_bmp_frame(render(s), s) for s in sizes]

    num        = len(sizes)
    ico_header = struct.pack("<HHH", 0, 1, num)  # reserved, type=ICO, count

    entries = b""
    offset  = 6 + num * 16  # ICO header (6) + ICONDIRENTRY × num (16 each)
    for s, frame in zip(sizes, frames):
        w = h = 0 if s == 256 else s
        entries += struct.pack(
            "<BBBBHHII",
            w, h,
            0,           # color count (0 = no palette)
            0,           # reserved
            1,           # planes
            32,          # bpp
            len(frame),
            offset,
        )
        offset += len(frame)

    return ico_header + entries + b"".join(frames)

# ── write files ───────────────────────────────────────────────────────────────
public = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(public, exist_ok=True)

for s, name in [
    (16,  "favicon-16x16.png"),
    (32,  "favicon-32x32.png"),
    (180, "apple-touch-icon.png"),
]:
    px   = render(s)
    data = make_png_rgba(px, s)
    with open(os.path.join(public, name), "wb") as f:
        f.write(data)
    print(f"  wrote {name} ({len(data)} bytes)")

ico = make_ico([16, 32])
with open(os.path.join(public, "favicon.ico"), "wb") as f:
    f.write(ico)
print(f"  wrote favicon.ico ({len(ico)} bytes)")
print("Done.")
