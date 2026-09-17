export const CMS_DOC_IDS = [
  'home',
  'rides',
  'about',
  'accommodation',
  'learning',
  'vaulting',
  'events',
  'gifts',
  'trails',
  'contact',
  'partners',
  'volunteer',
  'privacy',
  'horses',
] as const;

export type CmsDocId = typeof CMS_DOC_IDS[number];

export const CMS_EDIT_LINKS: { id: CmsDocId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'rides', label: 'Rides', path: '/holistic-horse-rides/' },
  { id: 'about', label: 'About', path: '/about/' },
  { id: 'accommodation', label: 'Accommodation', path: '/accommodation/' },
  { id: 'learning', label: 'Learning Experiences', path: '/learning-experiences/' },
  { id: 'vaulting', label: 'Vaulting', path: '/vaulting/' },
  { id: 'events', label: 'Special Events', path: '/special-events/' },
  { id: 'gifts', label: 'Gift Vouchers', path: '/horse-riding-holiday-gift-vouchers/' },
  { id: 'trails', label: 'Hack Farm Trails', path: '/hack-farm-trails/' },
  { id: 'contact', label: 'Contact', path: '/contact/' },
  { id: 'partners', label: 'Partners', path: '/partners/' },
  { id: 'volunteer', label: 'Volunteer', path: '/volunteer/' },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy/' },
  { id: 'horses', label: 'Our Horses', path: '/our-horses/' },
];
