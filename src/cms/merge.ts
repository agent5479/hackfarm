import type { HomeContent, RidesContent } from './types';
import { HOME_CONTENT_DEFAULTS } from '../content/defaults/home';
import { RIDES_CONTENT_DEFAULTS } from '../content/defaults/rides';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merge remote data over defaults (arrays replace, objects merge). */
export function mergeDeep(base: unknown, overlay: unknown): unknown {
  if (overlay === undefined || overlay === null) return base;

  if (Array.isArray(base)) {
    return Array.isArray(overlay) ? overlay : base;
  }

  if (isPlainObject(base) && isPlainObject(overlay)) {
    const out: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
      out[key] = key in base ? mergeDeep(base[key], value) : value;
    }
    return out;
  }

  return overlay;
}

/** Deep-merge remote data over defaults (arrays replace, objects merge). */
export function mergeHomeContent(remote: unknown): HomeContent {
  return mergeDeep(HOME_CONTENT_DEFAULTS, remote) as HomeContent;
}

export function mergeRidesContent(remote: unknown): RidesContent {
  return mergeDeep(RIDES_CONTENT_DEFAULTS, remote) as RidesContent;
}

/** Set a dotted path on a content clone (e.g. `tiles.ride.body` or `categories.0.rides.1.description`). */
export function setContentPath<T>(content: T, path: string, value: string): T {
  const parts = path.split('.');
  const root = structuredClone(content) as Record<string, unknown>;
  let cursor: Record<string, unknown> | unknown[] = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const nextKey = parts[i + 1]!;
    const asIndex = Number(key);

    if (Array.isArray(cursor)) {
      const idx = Number.isInteger(asIndex) ? asIndex : -1;
      const next = cursor[idx];
      if (next === undefined || (typeof next !== 'object' && next !== null)) {
        const createArray = Number.isInteger(Number(nextKey));
        cursor[idx] = createArray ? [] : {};
      }
      cursor = cursor[idx] as Record<string, unknown> | unknown[];
      continue;
    }

    const next = cursor[key];
    if (next === undefined || (typeof next !== 'object' && next !== null)) {
      const createArray = Number.isInteger(Number(nextKey));
      cursor[key] = createArray ? [] : {};
    }
    cursor = cursor[key] as Record<string, unknown> | unknown[];
  }

  const last = parts[parts.length - 1]!;
  if (Array.isArray(cursor)) {
    cursor[Number(last)] = value;
  } else {
    cursor[last] = value;
  }

  return root as unknown as T;
}

export function getContentPath(content: unknown, path: string): string {
  const parts = path.split('.');
  let cursor: unknown = content;
  for (const part of parts) {
    if (cursor == null) return '';
    if (Array.isArray(cursor)) {
      cursor = cursor[Number(part)];
    } else if (typeof cursor === 'object') {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return '';
    }
  }
  return typeof cursor === 'string' ? cursor : cursor == null ? '' : String(cursor);
}

export function setHomeContentPath(content: HomeContent, path: string, value: string): HomeContent {
  return setContentPath(content, path, value);
}

export function getHomeContentPath(content: HomeContent, path: string): string {
  return getContentPath(content, path);
}
