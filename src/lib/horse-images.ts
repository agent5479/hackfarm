export const HORSE_IMAGES: Record<string, string> = {
  donnie: '/images/uploads/2021/02/IMG_6067-scaled.jpg',
  buddy: '/images/uploads/2021/02/IMG_1921.jpg',
  safran: '/images/uploads/2022/04/Manuka.jpg',
  manuka: '/images/uploads/2022/04/Manuka.jpg',
  rusty: '/images/uploads/2021/02/IMG_7730.jpg',
  mcduff: '/images/uploads/2021/02/IMG_6067-scaled.jpg',
  redwing: '/images/uploads/2021/02/IMG_20200709_113754.jpg',
  brunner: '/images/uploads/2021/02/IMG_4295-scaled.jpg',
  ice: '/images/uploads/2021/02/IMG_20190120_122312-scaled.jpg',
  leonard: '/images/uploads/2021/02/IMG_20190120_122837-scaled.jpg',
  chloe: '/images/uploads/2021/02/IMG_20190120_121744_1-scaled.jpg',
  arnie: '/images/uploads/2021/02/IMG_20190402_161433.jpg',
  jasper: '/images/uploads/2021/02/IMG_20190328_082617.jpg',
  'brown-acre': '/images/uploads/2021/02/20190818_124033-scaled.jpg',
};

export const HORSE_FALLBACK = '/images/uploads/2021/02/Sillouette-Vaulting.png';

export function horseImage(slug: string): string {
  return HORSE_IMAGES[slug] || HORSE_FALLBACK;
}
