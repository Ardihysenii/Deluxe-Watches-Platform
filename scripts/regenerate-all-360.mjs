import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const img = '../src/main/resources/static/img';

const families = [
  ['family1', 'unnamed (1)-nobg.png', 'unamed (1.2)-nobg.png', 'unnamed (1.3)-nobg.png'],
  ['gold', 'gold-watch-hero-nobg.png', 'unamed (3.2)-nobg.png', 'unnamed (3.3)-nobg.png'],
  ['family3', 'unnamed (3)-nobg.png', 'unamed (3.2)-nobg.png', 'unnamed (3.3)-nobg.png'],
  ['family4', 'unnamed (4)-nobg.png', 'unamed (4.2)-nobg.png', 'unnamed (4.3)-nobg.png'],
  ['family5', 'unnamed (5)-nobg.png', 'unnamed (5.2)-nobg.png', 'unnamed (5.3)-nobg.png'],
  ['family6', 'unnamed (6)-nobg.png', 'unnamed (6.2)-nobg.png', 'unnamed (6.3)-nobg.png'],
];

for (const [folder, ...files] of families) {
  const args = files.map((f) => path.join(img, f)).join(' ');
  console.log('\n=== ' + folder + ' ===');
  execSync(`node generate-360-multi.mjs ${folder} ${args}`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

console.log('\nAll families regenerated with 3-angle 360 spins.');
