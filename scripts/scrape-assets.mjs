#!/usr/bin/env node
/**
 * Full asset harvest from hackfarm.co.nz
 * Writes to public/ and generates assets-manifest.json
 */
import { mkdir, writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');

const BASES = ['https://www.hackfarm.co.nz', 'https://hackfarm.co.nz'];

const PUBLIC_PAGES = [
  '/',
  '/accommodation/',
  '/holistic-horse-rides/',
  '/hack-farm-trails/',
  '/our-horses/',
  '/learning-experiences/',
  '/vaulting/',
  '/special-events/',
  '/horse-riding-holiday-gift-vouchers/',
  '/contact/',
  '/partners/',
  '/privacy-policy-2/',
];

const HORSE_SLUGS = [
  'donnie', 'buddy', 'safran', 'manuka', 'rusty', 'mcduff', 'redwing',
  'brunner', 'ice', 'leonard', 'chloe', 'arnie', 'jasper', 'brown-acre',
];

const BRAND_ASSETS = [
  '/wp-content/uploads/2021/02/cropped-Sillouette-Vaulting-32x32.png',
  '/wp-content/uploads/2021/02/cropped-Sillouette-Vaulting-180x180.png',
  '/wp-content/uploads/2021/02/cropped-Sillouette-Vaulting-192x192.png',
  '/wp-content/uploads/2021/02/Sillouette-Vaulting.png',
  '/wp-content/uploads/2021/02/HackFarm-Logo-Light.png',
  '/wp-content/uploads/2021/03/Hack-Farm-Logo-White.png',
  '/wp-content/uploads/2021/03/Wooden-Header-small.jpg',
  '/wp-content/uploads/2021/02/Jumping-girl-v2.png',
  '/wp-content/uploads/2021/02/Trails-Sillouette.png',
  '/wp-content/uploads/2021/03/Horsemanship-Sillouette.png',
  '/wp-content/uploads/2021/03/BYO-horse.png',
  '/wp-content/uploads/2021/02/Camping-Border-bottom-hackfarm.png',
  '/wp-content/uploads/2021/02/Homestead-Background.png',
  '/wp-content/uploads/2021/06/TC_2021_L_TRANSPARENT_BG_RGB-01.png',
  '/wp-content/uploads/2021/02/REVIEW-LOGO-facebook-e1527025669495.png',
  '/wp-content/uploads/2021/02/unnamed.png',
  '/wp-content/uploads/2021/02/unnamed-1.png',
  '/wp-content/uploads/2021/02/tripadvisor-logo-01.png',
  '/wp-content/uploads/2021/07/Bijmin_Affiliate_Booking-2.png',
  '/wp-content/uploads/2021/07/qrcode_2572792_-1.png',
  '/wp-content/uploads/2021/03/AmaticSC-Regular.woff',
  '/wp-content/uploads/2021/03/AmaticSC-Bold.woff',
];

const FRESHWDL_FILES = [
  '/FreshWDL/FreshWDL.html',
  '/FreshWDL/config.js',
  '/FreshWDL/clientraw.txt',
  '/FreshWDL/clientrawextra.txt',
  '/FreshWDL/clientrawhour.txt',
  '/FreshWDL/clientrawdaily.txt',
];

const SKIP_PATTERNS = [
  /\/wp-content\/plugins\//,
  /\/wp-content\/themes\//,
  /\/wp-content\/uploads\/elementor\/screenshots\//,
  /\/wp-includes\//,
  /s\.w\.org\/images\/core\/emoji/,
  /fareharbor\.com/,
  /google\.com\/maps/,
  /cdninstagram\.com/,
  /facebook\.com/,
  /instagram\.com\/p\//,
  /google\.com\/search/,
  /tripadvisor/,
  /m\.me\//,
  /getclicky\.com/,
  /fh-kit\.com/,
  /bootstrapcdn\.com/,
  /jsdelivr\.net/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /static\.getclicky/,
];

const urlSet = new Set();
const manifest = {};
const failed = [];
const skipped = [];

function normalizeUrl(url) {
  if (!url || url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('#')) return null;
  try {
    let u = url.replace(/&amp;/g, '&').trim();
    if (u.startsWith('//')) u = 'https:' + u;
    if (u.startsWith('/')) u = 'https://www.hackfarm.co.nz' + u;
    const parsed = new URL(u);
    if (!parsed.hostname.includes('hackfarm.co.nz')) return null;
    return parsed.origin + parsed.pathname + (parsed.search || '');
  } catch {
    return null;
  }
}

function shouldSkip(url) {
  return SKIP_PATTERNS.some((p) => p.test(url));
}

function localPath(url) {
  const parsed = new URL(url);
  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname.startsWith('/FreshWDL/')) return join('FreshWDL', pathname.replace('/FreshWDL/', ''));
  if (pathname.includes('/wp-content/uploads/')) {
    const rel = pathname.split('/wp-content/uploads/')[1];
    return join('images', 'uploads', rel);
  }
  if (pathname.includes('/elementor/google-fonts/fonts/')) {
    const rel = pathname.split('/fonts/')[1];
    return join('fonts', 'google', rel);
  }
  return join('images', pathname.replace(/^\//, ''));
}

function extractUrlsFromHtml(html, baseUrl) {
  const found = new Set();
  const add = (u) => {
    const n = normalizeUrl(u);
    if (n && !shouldSkip(n)) found.add(n.split('?')[0]);
  };

  for (const m of html.matchAll(/(?:src|href|poster|data-src|data-lazy-src|data-background|content)=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) add(m[1]);
  for (const m of html.matchAll(/"url"\s*:\s*"([^"]+)"/gi)) add(m[1]);
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    m[1].split(',').forEach((part) => add(part.trim().split(/\s+/)[0]));
  }
  for (const m of html.matchAll(/data-settings=["']([^"']+)["']/gi)) {
    try {
      const decoded = m[1].replace(/&quot;/g, '"').replace(/\\"/g, '"');
      for (const u of decoded.matchAll(/https?:\\\/\\\/[^"\\]+/g)) add(u[0].replace(/\\\//g, '/'));
      for (const u of decoded.matchAll(/https:\/\/[^"\\]+/g)) add(u[0]);
    } catch { /* ignore */ }
  }
  return found;
}

async function fetchWithRetry(url, opts = {}) {
  const urlsToTry = [url];
  if (url.includes('www.hackfarm.co.nz')) urlsToTry.push(url.replace('www.hackfarm.co.nz', 'hackfarm.co.nz'));
  else if (url.includes('hackfarm.co.nz') && !url.includes('www.')) urlsToTry.push(url.replace('hackfarm.co.nz', 'www.hackfarm.co.nz'));

  for (const tryUrl of urlsToTry) {
    try {
      const res = await fetch(tryUrl, { ...opts, signal: AbortSignal.timeout(60000) });
      if (res.ok) return { res, url: tryUrl };
    } catch { /* try next */ }
  }
  return null;
}

async function downloadAsset(url) {
  const clean = url.split('?')[0];
  if (manifest[clean]) return manifest[clean];

  const result = await fetchWithRetry(clean);
  if (!result) {
    failed.push(clean);
    return null;
  }

  const buf = Buffer.from(await result.res.arrayBuffer());
  const rel = localPath(result.url);
  const full = join(PUBLIC, rel);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buf);
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 16);
  manifest[clean] = { local: '/' + rel.replace(/\\/g, '/'), sha256: hash, bytes: buf.length };
  console.log(`  ✓ ${rel} (${buf.length} bytes)`);
  return manifest[clean];
}

async function fetchWpMedia() {
  console.log('\n=== WordPress Media REST ===');
  let page = 1;
  while (true) {
    const res = await fetch(`${BASES[0]}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=source_url`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) break;
    const items = await res.json();
    if (!items.length) break;
    for (const item of items) {
      if (item.source_url) urlSet.add(item.source_url.split('?')[0]);
    }
    console.log(`  Page ${page}: ${items.length} items`);
    page++;
  }
}

async function fetchPages() {
  console.log('\n=== HTML Pages ===');
  const pages = [...PUBLIC_PAGES, ...HORSE_SLUGS.map((s) => `/horse/${s}/`)];
  for (const path of pages) {
    const url = `${BASES[0]}${path}`;
    console.log(`  Fetching ${path}`);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) { failed.push(url); continue; }
      const html = await res.text();
      const found = extractUrlsFromHtml(html, url);
      found.forEach((u) => urlSet.add(u));
      console.log(`    Found ${found.size} asset URLs`);
    } catch (e) {
      failed.push(url);
      console.log(`    FAILED: ${e.message}`);
    }
  }
}

async function fetchFontCss() {
  console.log('\n=== Font CSS ===');
  const cssFiles = [
    '/wp-content/uploads/elementor/google-fonts/css/amaticsc.css',
    '/wp-content/uploads/elementor/google-fonts/css/ptsans.css',
    '/wp-content/uploads/elementor/google-fonts/css/ptsansnarrow.css',
    '/wp-content/uploads/elementor/google-fonts/css/roboto.css',
    '/wp-content/uploads/elementor/google-fonts/css/robotocondensed.css',
    '/wp-content/uploads/elementor/css/post-6.css',
  ];
  for (const css of cssFiles) {
    const res = await fetchWithRetry(`${BASES[0]}${css}`);
    if (!res) continue;
    const text = await res.res.text();
    for (const m of text.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
      const n = normalizeUrl(m[1]);
      if (n) urlSet.add(n.split('?')[0]);
    }
  }
}

async function scrapeContent() {
  console.log('\n=== Scraping page content ===');
  const content = { pages: {}, horses: [] };

  const pagePaths = {
    home: '/',
    accommodation: '/accommodation/',
    rides: '/holistic-horse-rides/',
    trails: '/hack-farm-trails/',
    horses: '/our-horses/',
    learning: '/learning-experiences/',
    vaulting: '/vaulting/',
    events: '/special-events/',
    gifts: '/horse-riding-holiday-gift-vouchers/',
    contact: '/contact/',
    partners: '/partners/',
    privacy: '/privacy-policy-2/',
  };

  for (const [key, path] of Object.entries(pagePaths)) {
    try {
      const res = await fetch(`${BASES[0]}${path}`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) continue;
      const html = await res.text();
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || key;
      const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] || '';
      const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 20 && !p.includes('Book a Ride'));
      content.pages[key] = { title, path, ogDesc, h1s, h2s, paragraphs: paragraphs.slice(0, 80) };
    } catch (e) {
      console.log(`  Content failed for ${path}: ${e.message}`);
    }
  }

  for (const slug of HORSE_SLUGS) {
    try {
      const res = await fetch(`${BASES[0]}/horse/${slug}/`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) continue;
      const html = await res.text();
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*\|.*/, '').trim() || slug;
      const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 10);
      content.horses.push({ slug, title, h2s, paragraphs: paragraphs.slice(0, 30) });
    } catch { /* skip */ }
  }

  await mkdir(join(ROOT, 'src', 'content'), { recursive: true });
  await writeFile(join(ROOT, 'src', 'content', 'scraped-content.json'), JSON.stringify(content, null, 2));
  console.log(`  Saved content for ${Object.keys(content.pages).length} pages and ${content.horses.length} horses`);
}

async function main() {
  console.log('Hack Farm Asset Scraper');
  console.log('=======================');

  await mkdir(PUBLIC, { recursive: true });

  BRAND_ASSETS.forEach((p) => urlSet.add(`${BASES[0]}${p}`));
  FRESHWDL_FILES.forEach((p) => urlSet.add(`${BASES[1]}${p}`));

  await fetchWpMedia();
  await fetchPages();
  await fetchFontCss();
  await scrapeContent();

  const toDownload = [...urlSet].filter((u) => !shouldSkip(u));
  console.log(`\n=== Downloading ${toDownload.length} assets ===`);

  for (const url of toDownload) {
    await downloadAsset(url);
  }

  await writeFile(join(PUBLIC, 'assets-manifest.json'), JSON.stringify({
    scrapedAt: new Date().toISOString(),
    total: Object.keys(manifest).length,
    failed: failed.length,
    manifest,
    failedUrls: failed,
    skippedPatterns: SKIP_PATTERNS.map(String),
  }, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`Downloaded: ${Object.keys(manifest).length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) console.log('Failed URLs:', failed.slice(0, 20).join('\n  '));
}

main().catch(console.error);
