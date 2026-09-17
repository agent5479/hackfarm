import type { HomeContent } from '../../cms/types';
import defaults from './home.json';

/** Bundled home copy — used when Realtime Database is empty, offline, or not configured. */
export const HOME_CONTENT_DEFAULTS: HomeContent = defaults as HomeContent;
