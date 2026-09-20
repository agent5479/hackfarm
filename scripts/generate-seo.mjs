import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function normalizeBase(raw) {
  let base = (raw || '/').trim() || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

const origin = (process.env.VITE_SITE_ORIGIN || 'https://hackfarm.co.nz').replace(/\/$/, '');
const base = normalizeBase(process.env.BASE_URL);

const routes = JSON.parse(readFileSync(join(root, 'src/seo/routes.json'), 'utf8'));
const scraped = JSON.parse(readFileSync(join(root, 'src/content/scraped-content.json'), 'utf8'));
const horseSlugs = (scraped.horses || []).map((h) => h.slug).filter(Boolean);
if (!horseSlugs.length) {
  throw new Error('No horse slugs found in scraped-content.json');
}

function absoluteUrl(path) {
  const normalized = String(path || '').replace(/^\//, '');
  if (!normalized || normalized === '') return `${origin}${base}`;
  return `${origin}${base}${normalized}`;
}

const paths = [
  ...new Set([
    ...routes.map((r) => r.path),
    ...horseSlugs.map((slug) => `/horse/${slug}/`),
  ]),
];

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Google-Extended',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot-Extended',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absoluteUrl(p)}</loc></url>`).join('\n')}
</urlset>
`;

const robotsAiBlocks = AI_BOTS.map(
  (bot) => `User-agent: ${bot}
Allow: /`,
).join('\n\n');

const robots = `User-agent: *
Allow: /
Disallow: /oldsitearchive/
Disallow: /volunteer/

${robotsAiBlocks}

User-agent: Bytespider
Disallow: /

Sitemap: ${absoluteUrl('sitemap.xml')}
`;

const llms = `# Hack n Stay Golden Bay (Hack Farm)

> Horse riding and farmstay in Golden Bay on New Zealand's South Island — guided beach and trail rides, eco farmstay, camping, and bring-your-own-horse accommodation near Abel Tasman and Nelson.

Hack n Stay Golden Bay (also known as Hack Farm) is a horse riding operator and eco farmstay run by Baerbel Hack at 22 Grant Road, Puramahoi, Takaka 7182, Golden Bay, Nelson Tasman, top of the South Island, New Zealand. Phone: +64 27 525 9434. Email: Stay@hackfarm.co.nz.

Primary associations: horse riding Golden Bay · beach horseback rides · horse riding holidays New Zealand · Golden Bay farmstay and camping · horse accommodation / bring your own horse · riding lessons and horsemanship · horse vaulting (Hack Vaulties) · kids horse camps.

## Key pages

- [Home](${absoluteUrl('/')}): Horse riding and farmstay in Golden Bay, New Zealand — overview of rides, stay, and learning.
- [About](${absoluteUrl('/about/')}): Entity page — Hack n Stay, Hack Farm, Baerbel Hack, Golden Bay horse riding farmstay on the South Island.
- [Accommodation](${absoluteUrl('/accommodation/')}): Golden Bay farmstay, dog-friendly campground, and bring-your-own-horse stays — also a stop for Kahurangi 500 bike tourers.
- [Horse Riding](${absoluteUrl('/holistic-horse-rides/')}): Guided horse riding and horse trekking in Golden Bay — beach and trail rides, sunrise planner, multi-day horse riding holidays.
- [Horse Trails](${absoluteUrl('/hack-farm-trails/')}): Bring-your-own-horse trail map and tide guidance in Golden Bay.
- [Our Horses](${absoluteUrl('/our-horses/')}): Meet the Hack Farm herd used for rides, lessons, and vaulting in Golden Bay.
- [Learning Experiences](${absoluteUrl('/learning-experiences/')}): Horse riding lessons and horsemanship in Golden Bay.
- [Horse Vaulting](${absoluteUrl('/vaulting/')}): Horse vaulting New Zealand — Hack Vaulties in Golden Bay with Baerbel Hack.
- [Kids Horse Camps](${absoluteUrl('/special-events/')}): Kids horse riding camps and horse club days in Golden Bay, New Zealand.
- [Gift Vouchers](${absoluteUrl('/horse-riding-holiday-gift-vouchers/')}): Gift cards for horse riding, farmstay, and lessons in Golden Bay.
- [Contact](${absoluteUrl('/contact/')}): Phone, email, and address — Golden Bay, South Island, New Zealand.
- [On-site weather station](https://hackfarm.infinityfree.me/FreshWDL/FreshWDL.html): Live FreshWDL weather readings from the property.

## Social

- Facebook: https://www.facebook.com/hacknstay
- Instagram: https://www.instagram.com/hacknstay/
- TripAdvisor: https://www.tripadvisor.co.nz/Attraction_Review-g675007-d6936779-Reviews-Hack_n_Stay_Golden_Bay-Takaka_Golden_Bay_Nelson_Tasman_Region_South_Island.html

## Optional

- [Sitemap](${absoluteUrl('/sitemap/')}): Full list of public pages on this site.
`;

const privacyCanonical = absoluteUrl('/privacy-policy/');
const privacyRedirectHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Privacy Policy moved | Hack n Stay Golden Bay</title>
    <meta http-equiv="refresh" content="0;url=${privacyCanonical}" />
    <link rel="canonical" href="${privacyCanonical}" />
    <meta name="robots" content="noindex, follow" />
    <script>location.replace(${JSON.stringify(privacyCanonical)});</script>
  </head>
  <body>
    <p>This page has moved to <a href="${privacyCanonical}">${privacyCanonical}</a>.</p>
  </body>
</html>
`;

writeFileSync(join(root, 'public/sitemap.xml'), sitemap);
writeFileSync(join(root, 'public/robots.txt'), robots);
writeFileSync(join(root, 'public/llms.txt'), llms);

const privacyRedirectDir = join(root, 'public/privacy-policy-2');
mkdirSync(privacyRedirectDir, { recursive: true });
writeFileSync(join(privacyRedirectDir, 'index.html'), privacyRedirectHtml);

console.log(
  `Wrote public/sitemap.xml (${paths.length} urls), public/robots.txt, public/llms.txt, and public/privacy-policy-2/index.html for ${origin}${base}`,
);
