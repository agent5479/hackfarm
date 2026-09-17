import generated from './generated/rides.json';
import { mergeRidesContent } from '../cms/merge';
import type { RidesContent } from '../cms/types';
import { RIDES_CONTENT_DEFAULTS } from './defaults/rides';

export function getBundledRidesContent(): RidesContent {
  return mergeRidesContent(generated);
}

export { RIDES_CONTENT_DEFAULTS };
