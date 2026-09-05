import { readFileSync, writeFileSync } from 'fs';
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
    '/FreshWDL/FreshWDL.html',
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

${robotsAiBlocks}

User-agent: Bytespider
Disallow: /

Sitemap: ${absoluteUrl('sitemap.xml')}
`;

const llms = `# Hack n Stay Golden Bay (Hack Farm)

> Eco farmstay, animal-friendly campground, and holistic beach horse rides near Paton's Rock, Golden Bay, New Zealand.

Hack n Stay Golden Bay (also known as Hack Farm) is a first-party farmstay and guided horse experience business run by Baerbel Hack at 22 Grant Road, Puramahoi, Takaka 7182, Golden Bay, South Island, New Zealand. Phone: +64 27 525 9434. Email: Stay@hackfarm.co.nz.

## Key pages

- [Home](${absoluteUrl('/')}): Overview of farmstay, camping, and beach horse rides near Paton's Rock.
- [About](${absoluteUrl('/about/')}): Brand and founder story — Hack Farm, Hack n Stay, Baerbel Hack, and the Hack Vaulties club.
- [Accommodation](${absoluteUrl('/accommodation/')}): Farmstay rooms, dog-friendly campground, and bring-your-own-horse stays.
- [Holistic Horse Rides](${absoluteUrl('/holistic-horse-rides/')}): Guided beach and trail rides with a tide-aware sunrise planner for Paton's Rock.
- [Hack Farm Trails](${absoluteUrl('/hack-farm-trails/')}): Interactive trail map and tide guidance for BYO horse riders.
- [Our Horses](${absoluteUrl('/our-horses/')}): Meet the Hack Farm herd used for rides, lessons, and vaulting.
- [Learning Experiences](${absoluteUrl('/learning-experiences/')}): Riding lessons, horsemanship, and vaulting for all ages.
- [Vaulting](${absoluteUrl('/vaulting/')}): Hack Vaulties vaulting sessions with Baerbel Hack.
- [Special Events](${absoluteUrl('/special-events/')}): Kids camps, horse club days, and special riding events.
- [Gift Vouchers](${absoluteUrl('/horse-riding-holiday-gift-vouchers/')}): Gift cards for rides, stays, and learning experiences.
- [Contact](${absoluteUrl('/contact/')}): Phone, email, and address for bookings and enquiries.
- [On-site weather station](${absoluteUrl('/FreshWDL/FreshWDL.html')}): Live FreshWDL weather readings from the property.

## Social

- Facebook: https://www.facebook.com/hacknstay
- Instagram: https://www.instagram.com/hacknstay/
- TripAdvisor: https://www.tripadvisor.co.nz/Attraction_Review-g675007-d6936779-Reviews-Hack_n_Stay_Golden_Bay-Takaka_Golden_Bay_Nelson_Tasman_Region_South_Island.html

## Optional

- [Sitemap](${absoluteUrl('/sitemap/')}): Full list of public pages on this site.
`;

writeFileSync(join(root, 'public/sitemap.xml'), sitemap);
writeFileSync(join(root, 'public/robots.txt'), robots);
writeFileSync(join(root, 'public/llms.txt'), llms);
console.log(
  `Wrote public/sitemap.xml (${paths.length} urls), public/robots.txt, and public/llms.txt for ${origin}${base}`,
);
