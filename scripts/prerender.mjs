import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

function normalizeBase(raw) {
  let base = (raw || '/hackfarm/').trim() || '/hackfarm/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

const base = normalizeBase(process.env.BASE_URL);
const routes = JSON.parse(readFileSync(join(root, 'src/seo/routes.json'), 'utf8'));
const horseSlugs = [
  'donnie', 'buddy', 'safran', 'manuka', 'rusty', 'mcduff', 'redwing',
  'brunner', 'ice', 'leonard', 'chloe', 'arnie', 'jasper', 'brown-acre',
];

/** SPA routes to prerender (not static FreshWDL html). */
const paths = [
  ...routes.map((r) => r.path),
  ...horseSlugs.map((slug) => `/horse/${slug}/`),
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function resolveFile(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?')[0]);
  if (base !== '/' && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length - 1); // keep leading /
  }
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  const candidates = [
    join(dist, pathname.replace(/^\//, '')),
    join(dist, pathname.replace(/^\//, ''), 'index.html'),
  ];
  if (pathname.endsWith('/')) {
    candidates.unshift(join(dist, pathname.replace(/^\//, ''), 'index.html'));
  } else if (!extname(pathname)) {
    candidates.push(join(dist, `${pathname.replace(/^\//, '')}.html`));
  }

  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return join(dist, 'index.html');
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      try {
        const file = resolveFile(req.url || '/');
        const body = readFileSync(file);
        const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function outPathForRoute(routePath) {
  if (routePath === '/' || routePath === '') {
    return join(dist, 'index.html');
  }
  const rel = routePath.replace(/^\//, '').replace(/\/$/, '');
  const dir = join(dist, rel);
  mkdirSync(dir, { recursive: true });
  return join(dir, 'index.html');
}

async function main() {
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error('dist/index.html missing — run vite build first');
  }

  const { server, port } = await startServer();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let ok = 0;
  for (const routePath of paths) {
    const urlPath = routePath === '/' ? base : `${base}${routePath.replace(/^\//, '')}`;
    const url = `${origin}${urlPath}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForSelector('#root', { timeout: 30000 });
      // Wait until React has painted something inside #root
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.childElementCount > 0 && (root.textContent || '').trim().length > 20;
        },
        { timeout: 30000 },
      );
      // Give meta hook a tick
      await page.waitForTimeout(100);
      const html = await page.content();
      const out = outPathForRoute(routePath);
      writeFileSync(out, html);
      ok += 1;
      console.log(`Prerendered ${routePath} → ${out.replace(root + '\\', '').replace(root + '/', '')}`);
    } catch (err) {
      console.error(`Failed ${routePath}:`, err.message || err);
      throw err;
    }
  }

  await browser.close();
  server.close();
  console.log(`Prerendered ${ok}/${paths.length} routes (base ${base})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
