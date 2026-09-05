#!/usr/bin/env node
/**
 * Square brand icons (SERP / favicon / Apple / Android) and 1200x630 OG JPEGs.
 */
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const uploads = join(publicDir, 'images', 'uploads');
const ogDir = join(publicDir, 'images', 'og');

const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const ICON_SRC = join(uploads, '2021/02/Sillouette-Vaulting.png');
const ICON_SRC_SQUARE = join(uploads, '2021/02/cropped-Sillouette-Vaulting-180x180.png');
const OG_SRC = join(uploads, '2021/02/IMG_6067-scaled.jpg');

function pngToIco(images) {
  const count = images.length;
  const header = 6 + 16 * count;
  let offset = header;
  const entries = images.map((img) => {
    const entry = { size: img.size, bytes: img.buffer.length, offset };
    offset += img.buffer.length;
    return entry;
  });
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let cursor = 6;
  for (const entry of entries) {
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, cursor);
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, cursor + 1);
    out.writeUInt8(0, cursor + 2);
    out.writeUInt8(0, cursor + 3);
    out.writeUInt16LE(1, cursor + 4);
    out.writeUInt16LE(32, cursor + 6);
    out.writeUInt32LE(entry.bytes, cursor + 8);
    out.writeUInt32LE(entry.offset, cursor + 12);
    cursor += 16;
  }
  cursor = header;
  for (const img of images) {
    img.buffer.copy(out, cursor);
    cursor += img.buffer.length;
  }
  return out;
}

async function pngSquare(src, size, background) {
  return sharp(src)
    .rotate()
    .resize(size, size, { fit: 'contain', background, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function ogBasename(uploadPath) {
  const file = String(uploadPath).split('/').pop() || '';
  return file
    .replace(/-\d+w\.(jpe?g|png|webp)$/i, '')
    .replace(/\.(jpe?g|png|webp)$/i, '');
}

async function writeOgCrop(srcPath, destPath) {
  const meta = await sharp(srcPath).rotate().metadata();
  if (!meta.width || !meta.height || Math.min(meta.width, meta.height) < 400) {
    return false;
  }
  await mkdir(dirname(destPath), { recursive: true });
  await sharp(srcPath)
    .rotate()
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(destPath);
  return true;
}

function collectSources() {
  const found = new Set();
  return {
    add(path) {
      if (!path || /logo|sillouette/i.test(path)) return;
      if (path.includes('/images/optimized/')) return;
      found.add(path);
    },
    paths: () => [...found],
  };
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await mkdir(ogDir, { recursive: true });

  const pngs = {};
  for (const size of [16, 32, 48]) {
    pngs[size] = await pngSquare(ICON_SRC_SQUARE, size, BLACK);
  }
  for (const size of [180, 192, 512]) {
    pngs[size] = await pngSquare(ICON_SRC, size, BLACK);
  }

  await writeFile(join(publicDir, 'favicon-32x32.png'), pngs[32]);
  await writeFile(join(publicDir, 'favicon-48x48.png'), pngs[48]);
  await writeFile(join(publicDir, 'apple-touch-icon.png'), pngs[180]);
  await writeFile(join(publicDir, 'android-chrome-192x192.png'), pngs[192]);
  await writeFile(join(publicDir, 'android-chrome-512x512.png'), pngs[512]);
  await writeFile(
    join(publicDir, 'favicon.ico'),
    pngToIco([
      { size: 16, buffer: pngs[16] },
      { size: 32, buffer: pngs[32] },
      { size: 48, buffer: pngs[48] },
    ]),
  );

  const manifest = {
    name: 'Hack n Stay Golden Bay',
    short_name: 'Hack n Stay',
    description: 'Beach horse rides, campground and farmstay in Golden Bay, New Zealand.',
    start_url: '/',
    display: 'browser',
    background_color: '#F6F1E7',
    theme_color: '#8CC395',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  await writeFile(join(publicDir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

  const defaultOg = join(ogDir, 'default.jpg');
  await writeOgCrop(OG_SRC, defaultOg);

  const sources = collectSources();
  const routes = JSON.parse(await readFile(join(root, 'src/seo/routes.json'), 'utf8'));
  for (const route of routes) sources.add(route.image);
  const horseImages = await readFile(join(root, 'src/lib/horse-images.ts'), 'utf8');
  for (const match of horseImages.matchAll(/'\/images\/uploads\/[^']+'/g)) {
    sources.add(match[0].slice(1, -1));
  }

  let ogCount = 1;
  for (const path of sources.paths()) {
    const rel = path.replace(/^\/?images\/uploads\//, '');
    const srcPath = join(uploads, rel);
    const destPath = join(ogDir, `${ogBasename(path)}.jpg`);
    try {
      if (await writeOgCrop(srcPath, destPath)) ogCount += 1;
    } catch (err) {
      await writeFile(destPath, await readFile(defaultOg));
      console.warn(`  fallback OG ${path}: ${err.message}`);
      ogCount += 1;
    }
  }

  console.log(`generate-icons: wrote favicon.ico + PNG set, ${ogCount} OG crops`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
