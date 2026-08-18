import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(join(root, 'dist', 'index.html'), join(root, 'dist', '404.html'));
console.log('Copied index.html -> 404.html for GitHub Pages SPA fallback');
