/** FareHarbor item IDs from https://fareharbor.com/api/v1/companies/hackfarm/items/ */

export interface FareHarborRide {
  id: string;
  title: string;
  meta: string;
  priceFrom: string;
  image: string;
  fareharborItemId: string;
  description?: string;
}

export const SUNRISE_TWILIGHT_RIDE: FareHarborRide = {
  id: 'sunrise-twilight',
  title: 'Sunrise/Sunset Twilight Ride',
  meta: 'incl. fees & taxes · Ages 3+ · 3 hours · Watch the sun rise out of the ocean',
  priceFrom: '',
  image: '/images/uploads/2021/07/Sunrise-Ride-Poster.jpg',
  fareharborItemId: '294945',
  description:
    'Our signature east-coast experience at Paton\'s Rock — use the schedule checker below before booking.',
};

export const OTHER_FAREHARBOR_RIDES: FareHarborRide[] = [
  {
    id: 'hack-track',
    title: 'Hack Track/ Fairy Trail Loop Ride',
    meta: 'incl. fees & taxes · 1 hour · Ages 3+ · Farmland, bush, wetland and forest',
    priceFrom: '$99',
    image: '/images/uploads/2021/07/Hack-Track-Trail-Ride.jpg',
    fareharborItemId: '294920',
  },
  {
    id: 'patons-rock',
    title: 'Patons Rock Beach Ride',
    meta: 'incl. fees & taxes · 2.5 hours · Ages 3+ · Ride-play-explore on Golden Bay beach',
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
    id: 'swimming',
    title: 'Swimming / Playing With Horses in the Water',
    meta: 'incl. fees & taxes · Ages 3+ · 3 hours · A magical experience!',
    priceFrom: '$290',
    image: '/images/uploads/2021/07/Swimming-with-Horses-Poster.jpg',
    fareharborItemId: '295292',
  },
];
