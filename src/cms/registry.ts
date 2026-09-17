import type { CmsDocId } from './docs';
import { CMS_DOC_IDS } from './docs';
import { mergeDeep } from './merge';

import { HOME_CONTENT_DEFAULTS } from '../content/defaults/home';
import { RIDES_CONTENT_DEFAULTS } from '../content/defaults/rides';
import { ABOUT_CONTENT_DEFAULTS } from '../content/defaults/about';
import { ACCOMMODATION_CONTENT_DEFAULTS } from '../content/defaults/accommodation';
import { LEARNING_CONTENT_DEFAULTS } from '../content/defaults/learning';
import { VAULTING_CONTENT_DEFAULTS } from '../content/defaults/vaulting';
import { EVENTS_CONTENT_DEFAULTS } from '../content/defaults/events';
import { GIFTS_CONTENT_DEFAULTS } from '../content/defaults/gifts';
import { TRAILS_CONTENT_DEFAULTS } from '../content/defaults/trails';
import { CONTACT_CONTENT_DEFAULTS } from '../content/defaults/contact';
import { PARTNERS_CONTENT_DEFAULTS } from '../content/defaults/partners';
import { VOLUNTEER_CONTENT_DEFAULTS } from '../content/defaults/volunteer';
import { PRIVACY_CONTENT_DEFAULTS } from '../content/defaults/privacy';
import { HORSES_CONTENT_DEFAULTS } from '../content/defaults/horses';

import homeGen from '../content/generated/home.json';
import ridesGen from '../content/generated/rides.json';
import aboutGen from '../content/generated/about.json';
import accommodationGen from '../content/generated/accommodation.json';
import learningGen from '../content/generated/learning.json';
import vaultingGen from '../content/generated/vaulting.json';
import eventsGen from '../content/generated/events.json';
import giftsGen from '../content/generated/gifts.json';
import trailsGen from '../content/generated/trails.json';
import contactGen from '../content/generated/contact.json';
import partnersGen from '../content/generated/partners.json';
import volunteerGen from '../content/generated/volunteer.json';
import privacyGen from '../content/generated/privacy.json';
import horsesGen from '../content/generated/horses.json';

const DEFAULTS: Record<CmsDocId, unknown> = {
  home: HOME_CONTENT_DEFAULTS,
  rides: RIDES_CONTENT_DEFAULTS,
  about: ABOUT_CONTENT_DEFAULTS,
  accommodation: ACCOMMODATION_CONTENT_DEFAULTS,
  learning: LEARNING_CONTENT_DEFAULTS,
  vaulting: VAULTING_CONTENT_DEFAULTS,
  events: EVENTS_CONTENT_DEFAULTS,
  gifts: GIFTS_CONTENT_DEFAULTS,
  trails: TRAILS_CONTENT_DEFAULTS,
  contact: CONTACT_CONTENT_DEFAULTS,
  partners: PARTNERS_CONTENT_DEFAULTS,
  volunteer: VOLUNTEER_CONTENT_DEFAULTS,
  privacy: PRIVACY_CONTENT_DEFAULTS,
  horses: HORSES_CONTENT_DEFAULTS,
};

const GENERATED: Record<CmsDocId, unknown> = {
  home: homeGen,
  rides: ridesGen,
  about: aboutGen,
  accommodation: accommodationGen,
  learning: learningGen,
  vaulting: vaultingGen,
  events: eventsGen,
  gifts: giftsGen,
  trails: trailsGen,
  contact: contactGen,
  partners: partnersGen,
  volunteer: volunteerGen,
  privacy: privacyGen,
  horses: horsesGen,
};

export function rtdbPathForDoc(id: CmsDocId): string {
  return `content/${id}`;
}

export function getBundledDoc(id: CmsDocId): unknown {
  return mergeDeep(DEFAULTS[id], GENERATED[id]);
}

export function mergeDoc(id: CmsDocId, remote: unknown): unknown {
  return mergeDeep(DEFAULTS[id], remote);
}

export function getAllBundledDocs(): Record<CmsDocId, unknown> {
  const out = {} as Record<CmsDocId, unknown>;
  for (const id of CMS_DOC_IDS) {
    out[id] = getBundledDoc(id);
  }
  return out;
}

export { DEFAULTS as CMS_DOC_DEFAULTS };
