#!/usr/bin/env node
/**
 * Generate display-sized WebP variants for images referenced from src/.
 * Originals under public/images/uploads/ are left unchanged.
 *
 * Output: public/images/optimized/{rel}/{basename}-{width}w.webp
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SRC = join(ROOT, 'src');
const UPLOADS = join(PUBLIC, 'images', 'uploads');
const OPTIMIZED = join(PUBLIC, 'images', 'optimized');

const WIDTHS = [640, 1280, 1920];
const OG_WIDTH = 1200;
const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const PATH_RE = /\/images\/uploads\/[^\s"'`)]+/g;

async function walkFiles(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

/** Collect unique /images/uploads/... paths referenced in src. */
async function collectReferencedPaths() {
  const files = await walkFiles(SRC);
  const found = new Set();
  for (const file of files) {
    if (!/\.(tsx?|jsx?|css|json|md)$/i.test(file)) continue;
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(PATH_RE)) {
      let path = match[0].split(/[?#]/)[0];
      // Template literals like Hack-Vaulties${num}.jpg — expand 01–12
      if (path.includes('${')) {
        if (/Hack-Vaulties\$\{num\}/i.test(path)) {
          for (let i = 1; i <= 12; i++) {
            found.add(`/images/uploads/2022/06/Hack-Vaulties${String(i).padStart(2, '0')}.jpg`);
          }
        }
        continue;
      }
      found.add(path);
    }
  }
  return [...found].sort();
}

function optimizedRel(uploadPath, width, ext = 'webp') {
  // /images/uploads/2021/02/foo.jpg → images/optimized/2021/02/foo-1280w.webp
  const withoutPrefix = uploadPath.replace(/^\/?images\/uploads\//, '');
  const dir = dirname(withoutPrefix);
  const base = withoutPrefix.slice(dir === '.' ? 0 : dir.length + 1).replace(/\.[^.]+$/, '');
  const relDir = dir === '.' ? '' : `${dir}/`;
  return `images/optimized/${relDir}${base}-${width}w.${ext}`;
}

async function needsWrite(srcPath, destPath) {
  try {
    const [srcStat, destStat] = await Promise.all([stat(srcPath), stat(destPath)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
}

async function optimizeOne(uploadPath) {
  const rel = uploadPath.replace(/^\/?images\/uploads\//, '');
  const srcPath = join(UPLOADS, rel);
  const ext = extname(srcPath).toLowerCase();
  if (!RASTER_EXT.has(ext)) {
    return { skipped: true, reason: 'non-raster' };
  }

  try {
    await stat(srcPath);
  } catch {
    return { skipped: true, reason: 'missing' };
  }

  const results = [];
  for (const width of WIDTHS) {
    const outRel = optimizedRel(uploadPath, width, 'webp');
    const destPath = join(PUBLIC, outRel);
    if (!(await needsWrite(srcPath, destPath))) {
      results.push({ width, status: 'fresh' });
      continue;
    }
    await mkdir(dirname(destPath), { recursive: true });
    await sharp(srcPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, alphaQuality: 80 })
      .toFile(destPath);
    results.push({ width, status: 'wrote' });
  }

  // Dedicated OG JPEG for the default social image
  if (uploadPath.endsWith('/IMG_6067-scaled.jpg')) {
    const ogRel = optimizedRel(uploadPath, OG_WIDTH, 'jpg');
    const ogPath = join(PUBLIC, ogRel);
    if (await needsWrite(srcPath, ogPath)) {
      await mkdir(dirname(ogPath), { recursive: true });
      await sharp(srcPath)
        .rotate()
        .resize({ width: OG_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(ogPath);
      results.push({ width: OG_WIDTH, status: 'wrote-og' });
    }
  }

  return { skipped: false, results };
}

async function main() {
  const paths = await collectReferencedPaths();
  console.log(`optimize-images: ${paths.length} referenced upload paths`);

  let wrote = 0;
  let skipped = 0;
  let missing = 0;

  for (const path of paths) {
    const result = await optimizeOne(path);
    if (result.skipped) {
      skipped++;
      if (result.reason === 'missing') {
        missing++;
        console.warn(`  missing: ${path}`);
      }
      continue;
    }
    for (const r of result.results || []) {
      if (r.status.startsWith('wrote')) wrote++;
    }
  }

  // Manifest for debugging / CI
  await mkdir(OPTIMIZED, { recursive: true });
  await writeFile(
    join(OPTIMIZED, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), paths, widths: WIDTHS }, null, 2),
  );

  console.log(`optimize-images: wrote ${wrote} files, skipped ${skipped} (missing ${missing})`);
  console.log(`  output: ${toPosix(relative(ROOT, OPTIMIZED))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
