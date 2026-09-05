from PIL import Image

source = "client/public/assets/official-good-conduct-template.png"
target = "client/public/assets/official-good-conduct-template-light.png"
image = Image.open(source).convert("RGBA")
pixels = image.load()
width, height = image.size

# The eagle/laurel watermark occupies the central body below the header.
# Blend that region 45% toward white; leave the official header untouched.
for y in range(390, min(height, 1510)):
    for x in range(120, min(width, 1080)):
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (
            round(255 - (255 - r) * 0.55),
            round(255 - (255 - g) * 0.55),
            round(255 - (255 - b) * 0.55),
            a,
        )

image.save(target, optimize=True)
print(target)
