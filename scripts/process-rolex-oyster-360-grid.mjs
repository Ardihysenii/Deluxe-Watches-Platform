/**
 * Split a 5x5 Rolex Oyster Perpetual grid into a smooth 360 spin sequence.
 *
 * Uses full-watch rotation panels only (excludes macro/detail tiles):
 *   Row 1: panels 1-5
 *   Row 2: left profile + panels 6-9
 *   Row 3: 240, 270, 300, 330 (skips macro panel 12)
 *
 * Usage:
 *   node scripts/process-rolex-oyster-360-grid.mjs "<path-to-grid.png>"
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { normalizeWatchImage } from './lib/watch-image-pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_ROOT = path.resolve(__dirname, '../src/main/resources/static/img');
const OUT_360_DIR = path.join(IMG_ROOT, '360', 'rolex-oyster-perpetual');
const OUT_HERO = path.join(IMG_ROOT, 'deluxe', 'deluxe-rolex-oyster-perpetual-nobg.png');

const GRID_COLS = 5;
const GRID_ROWS = 5;

/** Grid cells [row, col] in spin order with panel labels for logging. */
const SPIN_CELLS = [
  { row: 0, col: 0, label: '01-front' },
  { row: 0, col: 1, label: '02-front-right' },
  { row: 0, col: 2, label: '03-45-right' },
  { row: 0, col: 3, label: '04-side-right' },
  { row: 0, col: 4, label: '05-back-quarter-right' },
  { row: 1, col: 0, label: '06-side-left' },
  { row: 1, col: 1, label: '07-back-left' },
  { row: 1, col: 2, label: '08-back' },
  { row: 1, col: 3, label: '09-back-right' },
  { row: 1, col: 4, label: '10-back-quarter' },
  { row: 2, col: 0, label: '11-240' },
  { row: 2, col: 1, label: '12-270' },
  { row: 2, col: 2, label: '13-300' },
  { row: 2, col: 3, label: '14-330' },
];

const inputPath = path.resolve(process.argv[2] || '');

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Usage: node scripts/process-rolex-oyster-360-grid.mjs <grid-image.png>');
  process.exit(1);
}

fs.mkdirSync(OUT_360_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUT_HERO), { recursive: true });

const meta = await sharp(inputPath).metadata();
const cellW = Math.floor(meta.width / GRID_COLS);
const cellH = Math.floor(meta.height / GRID_ROWS);

console.log(`Grid source: ${meta.width}x${meta.height}, cell ${cellW}x${cellH}`);
console.log(`Output 360 dir: ${OUT_360_DIR}`);

const written = [];

for (let i = 0; i < SPIN_CELLS.length; i += 1) {
  const { row, col, label } = SPIN_CELLS[i];
  const left = col * cellW;
  const top = row * cellH;

  const rawCell = await sharp(inputPath)
    .extract({ left, top, width: cellW, height: cellH })
    .png()
    .toBuffer();

  const normalized = await normalizeWatchImage(rawCell);
  const outName = `${String(i + 1).padStart(3, '0')}.png`;
  const outPath = path.join(OUT_360_DIR, outName);
  await sharp(normalized).toFile(outPath);
  written.push({ frame: i + 1, label, file: outPath });
  console.log(`Frame ${outName} <- grid R${row + 1}C${col + 1} (${label})`);
}

await fs.promises.copyFile(
  path.join(OUT_360_DIR, '001.png'),
  OUT_HERO,
);

console.log(`\nHero image: ${OUT_HERO}`);
console.log(`Total spin frames: ${written.length}`);
console.log('\nFrame map:');
for (const entry of written) {
  console.log(`  ${String(entry.frame).padStart(2, '0')} - ${entry.label}`);
}
