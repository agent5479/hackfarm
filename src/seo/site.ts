import { HORSE_SLUGS } from '../lib/constants';

/** Canonical site origin without trailing slash (e.g. https://hackfarm.co.nz). */
export function getSiteOrigin(): string {
  const raw =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_ORIGIN) ||
    'https://hackfarm.co.nz';
  return String(raw).replace(/\/$/, '');
}

/** Vite base path with leading and trailing slash (e.g. / or /hackfarm/). */
export function getBasePath(): string {
  const raw =
    (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  let base = String(raw).trim() || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

/** Absolute URL for a site path like `/about/` or `about/`. */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const base = getBasePath();
  const normalized = path.replace(/^\//, '');
  if (!normalized) return `${origin}${base}`;
  return `${origin}${base}${normalized}`;
}

/** Absolute URL for an asset path under the site base. */
export function absoluteAssetUrl(assetPath: string): string {
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return absoluteUrl(assetPath.replace(/^\//, ''));
}

export const SITE_NAME = 'Hack n Stay Golden Bay';
export const SITE_ALT_NAME = 'Hack Farm';
export const DEFAULT_DESCRIPTION =
  'Hack n Stay Golden Bay - Beach Horse Rides, Campground and Farmstay accommodation in Golden Bay, New Zealand.';
/** 1200x630 JPEG for link previews (Facebook, iMessage, Slack, LinkedIn). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE = '/images/og/default.jpg';
export const DEFAULT_OG_ALT = 'Beach horse ride at Hack n Stay Golden Bay, Paton\'s Rock';

/** Map an upload/optimized path to the generated 1200x630 social crop. */
export function toOgImage(path?: string): string {
  if (!path) return DEFAULT_OG_IMAGE;
  if (path.startsWith('/images/og/')) return path;
  if (/logo|sillouette/i.test(path)) return DEFAULT_OG_IMAGE;
  const file = path.split('/').pop() || '';
  const base = file
    .replace(/-\d+w\.(jpe?g|png|webp)$/i, '')
    .replace(/\.(jpe?g|png|webp)$/i, '');
  if (!base) return DEFAULT_OG_IMAGE;
  return `/images/og/${base}.jpg`;
}

export function horsePath(slug: string): string {
  return `/horse/${slug}/`;
}

export function allHorsePaths(): string[] {
  return HORSE_SLUGS.map((slug) => horsePath(slug));
}
