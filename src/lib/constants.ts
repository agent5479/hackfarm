export const BOOKING = {
  ride: 'https://fareharbor.com/embeds/book/hackfarm/?full-items=yes&flow=543158',
  stay: 'https://fareharbor.com/embeds/book/hackfarm/?full-items=yes&flow=543323',
  gift: 'https://fareharbor.com/embeds/book/hackfarm/items/294930/?full-items=yes&flow=542642',
  cart: 'https://fareharbor.com/embeds/cart/?u=ff5d693b-0d79-4cd7-83ce-d3c61d45cc32&from-ssl=yes&g4=no&cp=no&csp=no',
  rideFlow: '543158',
};

export function fareHarborRideUrl(itemId?: string, date?: string): string {
  const base = itemId
    ? `https://fareharbor.com/embeds/book/hackfarm/items/${itemId}/`
    : 'https://fareharbor.com/embeds/book/hackfarm/';
  const params = new URLSearchParams({ 'full-items': 'yes', flow: BOOKING.rideFlow });
  if (date) params.set('date', date);
  return `${base}?${params.toString()}`;
}

export const CONTACT = {
  phone: '+64 27 525 9434',
  phoneHref: 'tel:+64275259434',
  email: 'Stay@hackfarm.co.nz',
  address: '22 Grant Road, Puramahoi, Takaka 7182, Golden Bay, South Island, New Zealand',
};

export const SOCIAL = {
  facebook: 'https://www.facebook.com/hacknstay',
  instagram: 'https://www.instagram.com/hacknstay/',
  tripadvisor: 'https://www.tripadvisor.co.nz/Attraction_Review-g675007-d6936779-Reviews-Hack_n_Stay_Golden_Bay-Takaka_Golden_Bay_Nelson_Tasman_Region_South_Island.html',
  messenger: 'http://m.me/hackfarmnz',
};

export const MAPS = {
  trailMap: 'https://www.google.com/maps/d/embed?mid=1ofkOTzT8c0nEoLjMa_xYoT75cbb-KEDv&ehbc=2E312F',
  trailView: 'https://www.google.com/maps/d/viewer?mid=1ofkOTzT8c0nEoLjMa_xYoT75cbb-KEDv&ll=-40.778761120161995%2C172.74905889999997&z=13',
};

export const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';

export function withBase(path: string): string {
  if (!path || /^(https?:|mailto:|tel:|data:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export const HORSE_SLUGS = [
  'donnie', 'buddy', 'safran', 'manuka', 'rusty', 'mcduff', 'redwing',
  'brunner', 'ice', 'leonard', 'chloe', 'arnie', 'jasper', 'brown-acre',
] as const;

export type HorseSlug = typeof HORSE_SLUGS[number];
