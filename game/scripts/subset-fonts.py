"""Subset SungSans (Latin) and Noto Sans CJK SC (Chinese) to the glyphs the game uses.

Run after changing any text in src/: python3 scripts/subset-fonts.py
"""
import pathlib, re
from fontTools import subset
from fontTools.ttLib import TTCollection, TTFont

root = pathlib.Path(__file__).resolve().parent.parent
text = "".join(p.read_text(encoding="utf-8") for p in (root / "src").rglob("*.ts"))
text += (root / "index.html").read_text(encoding="utf-8")
cjk = "".join(sorted({c for c in text if ord(c) > 0x2E80}))
latin = "".join(chr(c) for c in range(0x20, 0x7F)) + "·–—’‘“”×→←↑↓…"

out = root / "src" / "fonts"
out.mkdir(exist_ok=True)

def write(font, chars, name):
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    s = subset.Subsetter(opts)
    s.populate(text=chars)
    s.subset(font)
    font.flavor = "woff2"
    font.save(out / name)
    print(name, (out / name).stat().st_size, "bytes")

home = pathlib.Path.home()
for weight in ("Regular", "Bold"):
    write(TTFont(home / f".fonts/SungSans-{weight}.ttf"), latin, f"sungsans-{weight.lower()}.woff2")

cjk_font = TTCollection("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc").fonts[2]  # SC Bold
write(cjk_font, cjk, "cjk-sc-bold.woff2")
print("cjk chars:", len(cjk), cjk)
