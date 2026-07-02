/**
 * Removes near-white backgrounds from watch product images.
 * Output: {original-base}-nobg.png next to each source file.
 *
 * Usage: node scripts/remove-watch-backgrounds.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, '../src/main/resources/static/img');

const SKIP = new Set([
  'Logo.png',
  'GifImage.gif',
  'ContractOriginal.png',
]);

const WATCH_FILES = [
  'unnamed (1).jpg',
  'unnamed (1.3).jpg',
  'unnamed (3).jpg',
  'unnamed (3.3).jpg',
  'unnamed (4).jpg',
  'unamed (4.2).jpg',
  'unnamed (4.3).jpg',
  'unnamed (5).jpg',
  'unnamed (5.2).jpg',
  'unnamed (5.3).jpg',
  'unnamed (6).jpg',
  'unnamed (6.2).jpg',
  'unnamed (6.3).jpg',
  'unamed (1.2).png',
  'unamed (3.2).png',
  'gold-watch-hero.png',
  'Audemars-Piguet-Royal-Oak-Photoroom.png',
];

const WHITE_THRESHOLD = 238;
const FEATHER_START = 210;

function alphaForPixel(r, g, b) {
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);

  // Neutral light pixels (typical white studio background)
  if (avg >= WHITE_THRESHOLD && spread <= 28) {
    return 0;
  }

  if (avg >= FEATHER_START && spread <= 40) {
    const t = (avg - FEATHER_START) / (WHITE_THRESHOLD - FEATHER_START);
    return Math.round(255 * (1 - Math.min(1, Math.max(0, t))));
  }

  return 255;
}

async function processImage(fileName) {
  const inputPath = path.join(IMG_DIR, fileName);
  if (!fs.existsSync(inputPath)) {
    console.warn(`SKIP missing: ${fileName}`);
    return null;
  }

  const base = fileName.replace(/\.(jpe?g|png)$/i, '');
  const outputName = `${base}-nobg.png`;
  const outputPath = path.join(IMG_DIR, outputName);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const alpha = alphaForPixel(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = alpha;
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  const inStat = fs.statSync(inputPath);
  const outStat = fs.statSync(outputPath);
  console.log(`OK ${fileName} -> ${outputName} (${Math.round(outStat.size / 1024)} KB)`);
  return outputName;
}

async function main() {
  if (!fs.existsSync(IMG_DIR)) {
    console.error(`Image directory not found: ${IMG_DIR}`);
    process.exit(1);
  }

  const results = [];
  for (const file of WATCH_FILES) {
    if (SKIP.has(file)) continue;
    const out = await processImage(file);
    if (out) results.push(out);
  }

  console.log(`\nProcessed ${results.length} watch images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
