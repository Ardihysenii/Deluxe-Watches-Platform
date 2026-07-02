/**
 * Import Deluxe Watches Instagram photos into Alfa Accessories catalog.
 *
 * 1) Download images from @deluxewatchess into:
 *    scripts/import-deluxe/source/
 * 2) Optional metadata overrides in scripts/import-deluxe/catalog.json
 * 3) Run: node scripts/import-deluxe-instagram.mjs
 *
 * Outputs:
 * - src/main/resources/static/img/deluxe/*.png
 * - scripts/import-deluxe/import-deluxe-products.sql
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeWatchImage } from './lib/watch-image-pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, 'import-deluxe/source');
const META_FILE = path.join(__dirname, 'import-deluxe/catalog.json');
const OUT_IMG_DIR = path.resolve(__dirname, '../src/main/resources/static/img/deluxe');
const OUT_SQL = path.join(__dirname, 'import-deluxe/import-deluxe-products.sql');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const DEFAULT_CATEGORIES = ['Classic', 'Luxury', 'Sportive'];
const DEFAULT_COLORS = ['Silver', 'Gold', 'Black', 'Brown'];
const DEFAULT_MATERIALS = ['Stainless Steel', 'Leather', 'Gold'];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'deluxe-watch';
}

function guessFromFilename(fileName) {
  const base = path.basename(fileName, path.extname(fileName))
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = base.split(' ');
  const name = tokens
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 80);

  const lower = base.toLowerCase();
  let category = 'Luxury';
  if (/sport|diver|chrono|gmt|submariner|seamaster|ocean/i.test(lower)) category = 'Sportive';
  if (/classic|dress|datejust|daytona|president|cellini/i.test(lower)) category = 'Classic';

  let color = 'Silver';
  if (/gold|yellow|rose/i.test(lower)) color = 'Gold';
  if (/black|midnight|dark/i.test(lower)) color = 'Black';
  if (/brown|chocolate/i.test(lower)) color = 'Brown';

  let material = 'Stainless Steel';
  if (/leather|strap/i.test(lower)) material = 'Leather';
  if (/gold/i.test(lower)) material = 'Gold';

  return {
    name: name || 'Deluxe Timepiece',
    description: 'Curated luxury timepiece from the Deluxe Watches collection.',
    price: 2499.99,
    color,
    material,
    category,
    searchTags: `${name} ${category} ${color} deluxe watches luxury`.toLowerCase(),
  };
}

function loadCatalogMeta() {
  if (!fs.existsSync(META_FILE)) {
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  const map = {};
  for (const entry of raw.items || []) {
    if (entry?.source) map[entry.source] = entry;
  }
  return map;
}

function sqlEscape(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function buildInsert(product) {
  return `(
    '${sqlEscape(product.name)}',
    '${sqlEscape(product.description)}',
    ${Number(product.price).toFixed(2)},
    '${sqlEscape(product.color)}',
    '${sqlEscape(product.material)}',
    '${sqlEscape(product.category)}',
    '${sqlEscape(product.searchTags)}',
    '${sqlEscape(product.imageUrl)}',
    NULL,
    NULL
  )`;
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    console.error(`Created ${SOURCE_DIR}`);
    console.error('Add Instagram watch images there, then run this script again.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_IMG_DIR, { recursive: true });
  const metaMap = loadCatalogMeta();

  const files = fs.readdirSync(SOURCE_DIR)
    .filter((file) => IMAGE_EXT.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.error(`No images found in ${SOURCE_DIR}`);
    process.exit(1);
  }

  const products = [];
  let index = 1;

  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const idPart = String(index).padStart(3, '0');
    const slug = slugify(path.basename(file, path.extname(file)));
    const outName = `deluxe-${idPart}-${slug}-nobg.png`;
    const outPath = path.join(OUT_IMG_DIR, outName);

    const input = fs.readFileSync(sourcePath);
    const output = await normalizeWatchImage(input);
    fs.writeFileSync(outPath, output);

    const guessed = guessFromFilename(file);
    const override = metaMap[file] || {};
    const product = {
      ...guessed,
      ...override,
      imageUrl: `/img/deluxe/${outName}`,
    };

    products.push(product);
    console.log(`OK ${file} -> ${outName}`);
    index += 1;
  }

  const values = products.map(buildInsert).join(',\n');
  const sql = `-- Auto-generated from import-deluxe-instagram.mjs
-- Run in Neon SQL editor after placing images in static/img/deluxe/

INSERT INTO product (name, description, price, color, material, category, search_tags, image_url, "imageUrl2", "imageUrl3") VALUES
${values};
`;

  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log(`\nImported ${products.length} watches.`);
  console.log(`SQL: ${OUT_SQL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
