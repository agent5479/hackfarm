import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function normalizeBase(raw) {
  let base = (raw || '/hackfarm/').trim() || '/hackfarm/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

const origin = (process.env.VITE_SITE_ORIGIN || 'https://agent5479.github.io').replace(/\/$/, '');
const base = normalizeBase(process.env.BASE_URL);

const routes = JSON.parse(readFileSync(join(root, 'src/seo/routes.json'), 'utf8'));
const horseSlugs = [
  'donnie', 'buddy', 'safran', 'manuka', 'rusty', 'mcduff', 'redwing',
  'brunner', 'ice', 'leonard', 'chloe', 'arnie', 'jasper', 'brown-acre',
];

function absoluteUrl(path) {
  const normalized = String(path || '').replace(/^\//, '');
  if (!normalized || normalized === '') return `${origin}${base}`;
  return `${origin}${base}${normalized}`;
}

const paths = [
  ...routes.map((r) => r.path),
  ...horseSlugs.map((slug) => `/horse/${slug}/`),
  '/FreshWDL/FreshWDL.html',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absoluteUrl(p)}</loc></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('sitemap.xml')}
`;

writeFileSync(join(root, 'public/sitemap.xml'), sitemap);
writeFileSync(join(root, 'public/robots.txt'), robots);
console.log(`Wrote public/sitemap.xml (${paths.length} urls) and public/robots.txt for ${origin}${base}`);
