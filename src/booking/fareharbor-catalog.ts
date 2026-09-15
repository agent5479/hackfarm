/** FareHarbor item IDs from https://fareharbor.com/api/v1/companies/hackfarm/items/ */

export interface FareHarborRide {
  id: string;
  title: string;
  meta: string;
  priceFrom: string;
  image: string;
  fareharborItemId: string;
  description?: string;
  /** Opens the first-party tide calendar instead of jumping straight to FareHarbor */
  usesTideCalendar?: boolean;
}

/**
 * Bookable rides in FareHarbor flow 543158 display order / priority.
 * Desktop layout: first two are featured (half-width), remaining three share a row.
 * @see https://fareharbor.com/embeds/book/hackfarm/items/?flow=543158&full-items=yes
 */
export const BOOKABLE_FAREHARBOR_RIDES: FareHarborRide[] = [
  {
    id: 'hack-track',
    title: 'Hack Track / Fairy Trail Loop Ride',
    meta: 'incl. fees & taxes · 1 hour · Ages 3+ · Diverse landscape · Farmland, bush, wetland and forest',
    priceFrom: '$99',
    image: '/images/uploads/2021/07/Hack-Track-Trail-Ride.jpg',
    fareharborItemId: '294920',
  },
  {
    id: 'patons-rock',
    title: 'Patons Rock Beach Ride',
    meta: 'incl. fees & taxes · 2.5 hours · Ages 3+ · Ride-play-explore with the horses along Golden Bay beach',
    priceFrom: '$199',
    image: '/images/uploads/2021/07/Patons-Rock-Beach-Ride-Poster.jpg',
    fareharborItemId: '294928',
  },
  {
    id: 'rangi',
    title: 'Rangi Ride',
    meta: 'incl. fees & taxes · 4.5 hours · Intermediate – Experienced only',
    priceFrom: '$370',
    image: '/images/uploads/2021/02/Rangi.jpg',
    fareharborItemId: '294929',
  },
  {
    id: 'sunrise-rides',
    title: 'Sunrise Beach Ride',
    meta: 'incl. fees & taxes · Ages 3+ · 3 hours · Watch the sun rise out of the ocean · Tide-dependent · Wed / Fri / Sun',
    priceFrom: '$290',
    image: '/images/uploads/2021/07/Sunrise-Ride-Poster.jpg',
    fareharborItemId: '294945',
    usesTideCalendar: true,
  },
  {
    id: 'swimming',
    title: 'Swimming / Playing with Horses in the Water',
    meta: 'incl. fees & taxes · Ages 3+ · 3 hours · A magical experience!',
    priceFrom: '$290',
    image: '/images/uploads/2021/07/Swimming-with-Horses-Poster.jpg',
    fareharborItemId: '295292',
  },
];

export const SUNRISE_BEACH_RIDE =
  BOOKABLE_FAREHARBOR_RIDES.find((r) => r.usesTideCalendar)!;

/** @deprecated Use SUNRISE_BEACH_RIDE */
export const SUNRISE_TWILIGHT_RIDE = SUNRISE_BEACH_RIDE;

/** @deprecated Prefer BOOKABLE_FAREHARBOR_RIDES — kept for any callers excluding sunrise */
export const OTHER_FAREHARBOR_RIDES = BOOKABLE_FAREHARBOR_RIDES.filter(
  (r) => !r.usesTideCalendar,
);
