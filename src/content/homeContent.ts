import generated from './generated/home.json';
import { HOME_CONTENT_DEFAULTS } from './defaults/home';
import { mergeHomeContent } from '../cms/merge';
import type { HomeContent } from '../cms/types';

/**
 * Home copy baked at build time (RTDB snapshot merged over static defaults).
 * Used for first paint + prerender; live RTDB fetch can still update after load.
 */
export function getBundledHomeContent(): HomeContent {
  return mergeHomeContent(generated);
}

export { HOME_CONTENT_DEFAULTS };
