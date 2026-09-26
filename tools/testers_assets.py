"""Imágenes de la página de testers: tarjeta para compartir y capturas ligeras.

Genera en assets/testers/:
  og-testers.png   1200x630, la portada del juego con el sello «Se buscan testers»
  shot-*.webp      capturas de Play reducidas a 360x640 para la página
"""
import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'testers')
FS = os.path.join(ROOT, 'node_modules', '@fontsource')


def ttf(woff):
    f = TTFont(woff)
    f.flavor = None
    path = os.path.join(tempfile.gettempdir(), os.path.basename(woff).replace('.woff', '.ttf'))
    f.save(path)
    return path


def main():
    os.makedirs(OUT, exist_ok=True)
    bungee = ttf(os.path.join(FS, 'bungee', 'files', 'bungee-latin-400-normal.woff'))
    baloo = ttf(os.path.join(FS, 'baloo-2', 'files', 'baloo-2-latin-800-normal.woff'))

    # Tarjeta para compartir
    base = Image.open(os.path.join(ROOT, 'assets', 'og.png')).convert('RGBA').resize((1200, 630))
    W, H = base.size
    sticker = Image.new('RGBA', (560, 190), (0, 0, 0, 0))
    d = ImageDraw.Draw(sticker)
    d.rounded_rectangle((6, 10, 554, 184), 26, fill=(10, 16, 34, 110))
    d.rounded_rectangle((0, 0, 548, 172), 26, fill=(255, 178, 31, 255), outline=(22, 35, 65, 255), width=6)
    f1 = ImageFont.truetype(bungee, 50)
    f2 = ImageFont.truetype(baloo, 34)
    d.text((274, 58), 'SE BUSCAN', font=f1, fill=(22, 35, 65), anchor='mm')
    d.text((274, 108), 'TESTERS', font=f1, fill=(22, 35, 65), anchor='mm')
    d.text((274, 148), 'Android · gratis · 14 días', font=f2, fill=(22, 35, 65), anchor='mm')
    sticker = sticker.rotate(-5, resample=Image.BICUBIC, expand=True)
    sticker = sticker.resize((int(sticker.size[0] * 0.84), int(sticker.size[1] * 0.84)), Image.LANCZOS)
    shadow = Image.new('RGBA', sticker.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 120), mask=sticker.split()[3])
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    x, y = W - sticker.size[0] - 36, H - sticker.size[1] - 34  # abajo a la derecha, sin tapar al bombero
    base.alpha_composite(shadow, (x + 8, y + 12))
    base.alpha_composite(sticker, (x, y))
    base.convert('RGB').save(os.path.join(OUT, 'og-testers.png'), optimize=True)

    # Capturas ligeras
    for name in ['1-granja', '3-sanjuan', '5-gasolinera']:
        im = Image.open(os.path.join(ROOT, 'assets', 'play', f'{name}.png')).convert('RGB')
        im = im.resize((360, 640), Image.LANCZOS)
        im.save(os.path.join(OUT, f'shot-{name.split("-", 1)[1]}.webp'), quality=82, method=6)

    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')


if __name__ == '__main__':
    main()
