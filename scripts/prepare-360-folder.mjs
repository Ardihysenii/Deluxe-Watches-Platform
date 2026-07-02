/**
 * Rename and copy a folder of watch photos into a 360 spin folder.
 *
 * Usage:
 *   node scripts/prepare-360-folder.mjs family1 "C:\path\to\my-watch-photos"
 *   node scripts/prepare-360-folder.mjs product-5 "C:\path\to\photos"
 *
 * Photos should be the same watch shot every ~10–15° on a turntable (24–36 images ideal).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_ROOT = path.resolve(__dirname, '../src/main/resources/static/img');
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const [folderName, sourceDir] = process.argv.slice(2);

if (!folderName || !sourceDir) {
  console.error('Usage: node prepare-360-folder.mjs <folder-name> <source-directory>');
  console.error('Example: node prepare-360-folder.mjs gold "C:\\Photos\\gold-watch-360"');
  process.exit(1);
}

const targetDir = path.join(IMG_ROOT, '360', folderName);
const absSource = path.resolve(sourceDir);

if (!fs.existsSync(absSource)) {
  console.error(`Source not found: ${absSource}`);
  process.exit(1);
}

const files = fs.readdirSync(absSource)
  .filter((name) => ALLOWED.has(path.extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

if (files.length < 2) {
  console.error('Need at least 2 photos in the source folder.');
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

files.forEach((file, index) => {
  const ext = path.extname(file).toLowerCase();
  const outName = `${String(index + 1).padStart(3, '0')}${ext === '.jpeg' ? '.jpg' : ext}`;
  fs.copyFileSync(path.join(absSource, file), path.join(targetDir, outName));
});

console.log(`Prepared ${files.length} frames in img/360/${folderName}/`);
console.log('Restart the app, then open the product page and drag in 360 view.');
