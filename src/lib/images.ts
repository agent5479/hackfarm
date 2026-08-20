import { withBase } from './constants';

export type ImageSize = 'thumb' | 'content' | 'hero';

const WIDTHS: Record<ImageSize, number> = {
  thumb: 640,
  content: 1280,
  hero: 1920,
};

const RASTER = /\.(jpe?g|png|webp)$/i;

/** Site-relative optimized path (no base URL). Falls back to original for non-raster / unmappable paths. */
export function optimizedPath(originalPath: string, size: ImageSize): string {
  if (!originalPath || !RASTER.test(originalPath)) return originalPath;
  const normalized = originalPath.replace(/^\//, '');
  const match = normalized.match(/^images\/uploads\/(.+)\/([^/]+)\.([^.]+)$/i);
  if (!match) return originalPath;
  const [, dir, base] = match;
  const width = WIDTHS[size];
  return `/images/optimized/${dir}/${base}-${width}w.webp`;
}

/** Absolute-for-app URL (includes Vite base) for a display-sized WebP variant. */
export function optimizedUrl(originalPath: string, size: ImageSize): string {
  return withBase(optimizedPath(originalPath, size));
}

/** OG / social JPEG derived from the default hero (~1200w). */
export const OG_IMAGE_PATH = '/images/optimized/2021/02/IMG_6067-scaled-1200w.jpg';
