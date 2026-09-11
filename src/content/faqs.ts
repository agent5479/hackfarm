export type FaqItem = {
  question: string;
  answer: string;
  /** Optional on-page link shown after the answer (e.g. trail map). */
  link?: { to: string; label: string };
};

export const HOMESTEAD_FAQS: FaqItem[] = [
  {
    question: 'Are dogs allowed at the farmstay?',
    answer:
      'Yes. The property is dog-friendly. You are responsible for your dog throughout your stay, must clean up after them, and keep polite interactions with other guests and animals. Keep your dog in the car until they have been properly introduced to farm dog Moe, who is territorial and needs to be on a leash for safety.',
  },
  {
    question: 'Can I bring my own horse to stay?',
    answer:
      'Yes. You can bring your own horse to stay. Ride down to the beach, explore the trails, or book a lesson on your own horse.',
  },
  {
    question: 'Is food provided in the farmhouse kitchen?',
    answer:
      'The house kitchen is equipped with essentials such as coffee, tea, bread, cereal and milk. Guests need to bring their own food for main meals and snacks. The Historic Mussel Inn is nearby for meals.',
  },
  {
    question: 'Is Wi-Fi available for house guests?',
    answer: 'Yes. Wi-Fi is available for house guests and the connection is stable.',
  },
  {
    question: 'Can I stay long-term at the homestead?',
    answer:
      'Yes. Guests can stay up to 60 days, with special weekly rates available for stays over 30 days. Call to discuss options.',
  },
  {
    question: 'Is the farmhouse private or shared?',
    answer:
      'Your room is private, but the lounge, living room, dining area and kitchen are shared communal facilities used by all house guests.',
  },
  {
    question: 'Do I need to bring bedding?',
    answer: 'No. All bedding is provided for your stay.',
  },
  {
    question: 'Can guests use the pizza oven?',
    answer:
      'Yes. Chat with Baerbel on or before arriving so she can take you through the lighting procedures for the pizza oven.',
  },
];

export const CAMPING_FAQS: FaqItem[] = [
  {
    question: 'Are dogs allowed at the campground?',
    answer:
      'Yes. The campground is dog-friendly. Let Baerbel know at booking, keep your dog in the vehicle until introduced to farm dog Moe, clean up after them, and ensure polite interactions with other guests and animals.',
  },
  {
    question: 'Is powered camping available?',
    answer:
      'Yes. 16 amp power is available for a one-off set-up fee of $10. Winter rates may apply.',
  },
  {
    question: 'What cooking facilities does the camp kitchen have?',
    answer:
      'The camp kitchen has a portable electric stove, dishwashing area, some cups, plates and cutlery, picnic benches, and a fridge/freezer. Bring your own cooking equipment in peak season and clearly mark food in the fridge.',
  },
  {
    question: 'Is Wi-Fi available for campers?',
    answer:
      'No. Wi-Fi is reserved for house guests. The nearest free Wi-Fi is at the Mussel Inn.',
  },
  {
    question: 'How long can I camp at Hack Farm?',
    answer:
      'You can camp for a maximum of 60 days at any given time. Stays over a month have a special rate of $160/week per person that includes free laundry use.',
  },
  {
    question: 'Is drinking water available on site?',
    answer:
      'Yes. All taps on site have potable water and you can fill up wherever you find a tap.',
  },
  {
    question: 'Are showers included for campers?',
    answer: 'Yes. Showers are included as part of your stay for paying campers.',
  },
  {
    question: 'Do children camp for free?',
    answer:
      'Children under 2 stay free. Book a separate slot for each member of your party over age 2. There are no additional child discounts over age 2.',
  },
];

export const BYO_HORSE_FAQS: FaqItem[] = [
  {
    question: 'Is there space to park a horse float?',
    answer: 'Yes. There is plenty of space for floats to park on the property.',
  },
  {
    question: 'What horse facilities are available for guest horses?',
    answer:
      'The property has a 25m round yard, a covered 20x40m arena, a cowboy challenge obstacle course, wash-down bays, hitching rails, paddocks and dry lot areas. Facilities are available when not in use by the trekking team.',
  },
  {
    question: 'Should I bring hay and hard feed for my horse?',
    answer:
      'Yes. Grass paddocks are available, but guests are recommended to bring their own hay and hard feed.',
  },
  {
    question: 'Do barefoot horses need boots on the trails?',
    answer:
      'If your horse is barefoot, bring at least front boots. Beaches are soft but rocky areas can be tough on feet.',
  },
  {
    question: 'Where can I ride with my own horse from Hack Farm?',
    answer:
      'You can ride all along the beaches. Please check our interactive trail map for routes and tide-aware guidance — use it as a guide only, as tides and inlets are always shifting. Always check the tide times before a longer ride, and check in with Baerbel before you leave.',
    link: { to: '/hack-farm-trails/', label: 'Open the interactive trail map' },
  },
];

export const ALL_ACCOMMODATION_FAQS: FaqItem[] = [
  ...HOMESTEAD_FAQS,
  ...CAMPING_FAQS,
  ...BYO_HORSE_FAQS,
];

export const GIFT_FAQS: FaqItem[] = [
  {
    question: 'Do I need to book a specific date?',
    answer:
      'No — the gift voucher is credit toward a future ride. It is redeemed when you complete a booking.',
  },
  {
    question: 'What can I use the gift voucher for?',
    answer: 'Any riding, learning or accommodation option on the website.',
  },
  {
    question: 'Can I exchange my voucher for cash?',
    answer: 'Gift cards are non-refundable and cannot be exchanged for cash.',
  },
];
