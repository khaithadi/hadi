// One-off PWA icon generator. Rasterizes the brand SVG into the PNG sizes the
// manifest / Apple need. Run with: npm run gen:icons  (outputs into public/).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const icon = readFileSync(join(pub, 'icon.svg'));

// Maskable variant: full-bleed copper square (no rounded corners) with the
// checkmark kept inside the ~80% safe area so platform masks never clip it.
const maskable = Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#C1622D"/>
  <path d="M176 270 L242 336 L344 206" fill="none" stroke="#FFFFFF"
        stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

const jobs = [
  [icon, 192, 'pwa-192x192.png'],
  [icon, 512, 'pwa-512x512.png'],
  [icon, 180, 'apple-touch-icon.png'],
  [maskable, 512, 'pwa-maskable-512x512.png'],
];

for (const [src, size, name] of jobs) {
  await sharp(src).resize(size, size).png().toFile(join(pub, name));
  console.log('wrote', name, `(${size}×${size})`);
}
console.log('done');
