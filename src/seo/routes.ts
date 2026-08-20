import routesJson from './routes.json';
import { HORSE_SLUGS } from '../lib/constants';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, horsePath } from './site';

export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  image?: string;
}

export const PAGE_ROUTES: SeoRoute[] = routesJson as SeoRoute[];

const PAGE_BY_PATH = new Map(PAGE_ROUTES.map((r) => [r.path, r]));

export function getPageSeo(path: string): SeoRoute | undefined {
  const normalized = path.endsWith('/') || path === '/' ? path : `${path}/`;
  const key = path === '' ? '/' : normalized === '//' ? '/' : normalized;
  return PAGE_BY_PATH.get(key === '' ? '/' : key) ?? PAGE_BY_PATH.get(path);
}

export function horseSeo(slug: string, horseTitle?: string): SeoRoute {
  const name = horseTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    path: horsePath(slug),
    title: name,
    description: `${name} — one of the Hack Farm herd at Hack n Stay Golden Bay. Meet our horses for beach rides, lessons, and vaulting.`,
    image: DEFAULT_OG_IMAGE,
  };
}

/** All paths to include in sitemap and prerender (pages + horses + weather). */
export function allSeoPaths(): string[] {
  return [
    ...PAGE_ROUTES.map((r) => r.path),
    ...HORSE_SLUGS.map((slug) => horsePath(slug)),
    '/FreshWDL/FreshWDL.html',
  ];
}

export function formatDocumentTitle(title: string): string {
  if (title.includes('Hack n Stay')) return title;
  return `${title} | Hack n Stay Golden Bay`;
}

export { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };
