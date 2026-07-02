/**
 * Build 36-frame 360 from 3 real angle photos — each photo shown full-size,
 * no fake squish. Drag reveals front, side, and back views of the same watch.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_ROOT = path.resolve(__dirname, '../src/main/resources/static/img');
const FRAME_COUNT = 36;
const CANVAS = 900;
const FRAMES_PER_ANGLE = 12;

const [folderName, ...inputRelatives] = process.argv.slice(2);

if (!folderName || inputRelatives.length < 2) {
  console.error('Usage: node generate-360-multi.mjs <folder> <front.png> <side.png> <back.png>');
  process.exit(1);
}

const inputPaths = inputRelatives.map((rel) => path.resolve(__dirname, rel));
for (const p of inputPaths) {
  if (!fs.existsSync(p)) {
    console.error('Missing:', p);
    process.exit(1);
  }
}

const outputDir = path.join(IMG_ROOT, '360', folderName);
fs.mkdirSync(outputDir, { recursive: true });

async function fitWatch(buffer) {
  const fitted = await sharp(buffer)
    .ensureAlpha()
    .resize(Math.round(CANVAS * 0.68), Math.round(CANVAS * 0.68), {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const meta = await sharp(fitted).metadata();
  const left = Math.round((CANVAS - meta.width) / 2);
  const top = Math.round((CANVAS - meta.height) / 2 - CANVAS * 0.03);
  return { buffer: fitted, left, top, width: meta.width, height: meta.height };
}

async function withOpacity(pngBuffer, opacity) {
  if (opacity >= 0.995) return pngBuffer;
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * opacity);
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

function shadowSvg(width) {
  const rx = Math.max(72, width * 0.38);
  return Buffer.from(`
    <svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${CANVAS / 2}" cy="${CANVAS * 0.84}" rx="${rx}" ry="15" fill="rgba(0,0,0,0.11)"/>
    </svg>
  `);
}

const fitted = await Promise.all(
  inputPaths.map(async (p) => fitWatch(await sharp(p).ensureAlpha().toBuffer()))
);

const angleCount = fitted.length;

for (let i = 0; i < FRAME_COUNT; i++) {
  const segment = Math.floor(i / FRAMES_PER_ANGLE) % angleCount;
  const nextSegment = (segment + 1) % angleCount;
  const local = i % FRAMES_PER_ANGLE;

  let opacityA = 1;
  let opacityB = 0;
  let useB = false;

  if (local >= FRAMES_PER_ANGLE - 3) {
    const t = (local - (FRAMES_PER_ANGLE - 3) + 1) / 4;
    opacityA = 1 - t;
    opacityB = t;
    useB = t > 0;
  }

  const composites = [
    { input: shadowSvg(fitted[segment].width), top: 0, left: 0 },
    {
      input: await withOpacity(fitted[segment].buffer, opacityA),
      top: fitted[segment].top,
      left: fitted[segment].left,
    },
  ];

  if (useB) {
    composites.push({
      input: await withOpacity(fitted[nextSegment].buffer, opacityB),
      top: fitted[nextSegment].top,
      left: fitted[nextSegment].left,
    });
  }

  const outName = `${String(i + 1).padStart(3, '0')}.png`;
  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, outName));

  const label = useB
    ? `blend angle ${segment + 1}→${nextSegment + 1}`
    : `angle ${segment + 1}`;
  console.log(`Frame ${outName} — ${label}`);
}

console.log(`\nDone: ${FRAME_COUNT} frames (${angleCount} real angles) -> img/360/${folderName}/`);
