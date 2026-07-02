import fs from 'fs';
import os from 'os';
import path from 'path';

const htmlPath = path.join(os.tmpdir(), 'ig-deluxe.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const displayUrls = [...html.matchAll(/"display_url":"([^"]+)"/g)].map((m) =>
  m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/')
);

const cdnUrls = [
  ...new Set(
    [...html.matchAll(/https:\/\/[^"\\]+cdninstagram\.com\/[^"\\]+/g)].map((m) =>
      m[0].replace(/\\\//g, '/')
    )
  ),
].filter((u) => /\.(jpg|jpeg|webp|png)/i.test(u));

const og = html.match(/property="og:image" content="([^"]+)"/);
const login = /Log in|login_required|loginPage/i.test(html);

const out = {
  len: html.length,
  login,
  profile: html.includes('deluxewatchess'),
  ogImage: og?.[1] ?? null,
  displayCount: displayUrls.length,
  displayUrls,
  cdnCount: cdnUrls.length,
  cdnUrls,
};

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, 'ig-parse.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ displayCount: out.displayCount, cdnCount: out.cdnCount, login: out.login, profile: out.profile }));
