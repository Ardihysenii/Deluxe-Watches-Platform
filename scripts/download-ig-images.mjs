import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parsePath = path.join(__dirname, 'ig-parse.json');
const sourceDir = path.join(__dirname, 'import-deluxe/source');

const data = JSON.parse(fs.readFileSync(parsePath, 'utf8'));
const urls = data.displayUrls?.length ? data.displayUrls : data.cdnUrls;

fs.mkdirSync(sourceDir, { recursive: true });

const existing = new Set(fs.readdirSync(sourceDir));
let downloaded = 0;
let skipped = 0;

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const extMatch = url.match(/\.(jpg|jpeg|webp|png)/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
  const fileName = `deluxe-post-${String(i + 1).padStart(2, '0')}${ext}`;
  if (existing.has(fileName)) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
      },
    });
    if (!res.ok) {
      console.error(`FAIL ${fileName}: HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) {
      console.error(`SKIP ${fileName}: too small (${buf.length} bytes)`);
      continue;
    }
    fs.writeFileSync(path.join(sourceDir, fileName), buf);
    console.log(`OK ${fileName} (${buf.length} bytes)`);
    downloaded++;
  } catch (err) {
    console.error(`ERR ${fileName}: ${err.message}`);
  }
}

console.log(JSON.stringify({ downloaded, skipped, totalUrls: urls.length, sourceDir }));
