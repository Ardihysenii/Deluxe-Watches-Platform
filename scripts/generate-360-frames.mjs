/**
 * Builds a smooth 36-frame 360 spin from ONE transparent watch PNG.
 * Simulates turntable rotation (narrow at edges, full front/back views).
 *
 * Usage: node scripts/generate-360-frames.mjs gold "../src/main/resources/static/img/gold-watch-hero-nobg.png"
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_ROOT = path.resolve(__dirname, '../src/main/resources/static/img');
const FRAME_COUNT = 36;
const CANVAS = 900;

const [folderName, inputRelative] = process.argv.slice(2);

if (!folderName || !inputRelative) {
  console.error('Usage: node generate-360-frames.mjs <folder> <watch-png-path>');
  process.exit(1);
}

const inputPath = path.resolve(__dirname, inputRelative);
const outputDir = path.join(IMG_ROOT, '360', folderName);

if (!fs.existsSync(inputPath)) {
  console.error('Input not found:', inputPath);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const sourceMeta = await sharp(inputPath).metadata();
const sourceBuffer = await sharp(inputPath).ensureAlpha().toBuffer();

function shadowSvg(offsetX, width, opacity) {
  const cx = CANVAS / 2 + offsetX;
  const rx = Math.max(80, width * 0.38);
  return Buffer.from(`
    <svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${cx}" cy="${CANVAS * 0.82}" rx="${rx}" ry="18"
        fill="rgba(0,0,0,${opacity.toFixed(3)})"/>
    </svg>
  `);
}

for (let i = 0; i < FRAME_COUNT; i++) {
  const angleDeg = (360 / FRAME_COUNT) * i;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const scaleX = Math.max(0.06, Math.abs(cos));
  const scaleY = 0.9 + 0.1 * Math.abs(cos);
  const flip = cos < 0;

  const maxW = Math.round(CANVAS * 0.72);
  const maxH = Math.round(CANVAS * 0.72);
  let targetW = Math.max(24, Math.round(sourceMeta.width * scaleX * 0.92));
  let targetH = Math.max(24, Math.round(sourceMeta.height * scaleY * 0.92));
  if (targetW > maxW || targetH > maxH) {
    const ratio = Math.min(maxW / targetW, maxH / targetH);
    targetW = Math.round(targetW * ratio);
    targetH = Math.round(targetH * ratio);
  }

  let watch = sharp(sourceBuffer).resize(targetW, targetH, {
    fit: 'inside',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (flip) {
    watch = watch.flop();
  }

  const watchBuffer = await watch.png().toBuffer();
  const watchMeta = await sharp(watchBuffer).metadata();

  const offsetX = Math.round(sin * (CANVAS * 0.05));
  let left = Math.round((CANVAS - watchMeta.width) / 2 + offsetX);
  let top = Math.round((CANVAS - watchMeta.height) / 2 - CANVAS * 0.04);
  left = Math.max(0, Math.min(left, CANVAS - watchMeta.width));
  top = Math.max(0, Math.min(top, CANVAS - watchMeta.height));

  const shadowOpacity = 0.08 + 0.1 * Math.abs(cos);
  const shadowWidth = watchMeta.width;

  const frame = await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadowSvg(offsetX, shadowWidth, shadowOpacity), top: 0, left: 0 },
      { input: watchBuffer, top, left },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outName = `${String(i + 1).padStart(3, '0')}.png`;
  await sharp(frame).toFile(path.join(outputDir, outName));
  console.log(`Frame ${outName} (${angleDeg.toFixed(0)}°)`);
}

console.log(`\nDone: ${FRAME_COUNT} frames -> img/360/${folderName}/`);
