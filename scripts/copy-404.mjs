import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const public404 = join(root, 'public', '404.html');
const dist404 = join(root, 'dist', '404.html');

if (existsSync(public404)) {
  copyFileSync(public404, dist404);
  console.log('Ensured dist/404.html is the SPA redirect (not a copy of index.html)');
} else {
  console.warn('public/404.html missing; GitHub Pages deep links may not restore styles');
}
