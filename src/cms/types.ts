export type TileCopy = {
  title: string;
  body: string;
  cta: string;
};

export type FeatureCopy = {
  title: string;
  subtitle: string;
  body: string[];
  cta: string;
};

export type TestimonialCopy = {
  text: string;
  author: string;
};

export type HomeContent = {
  hero: {
    h1: string;
  };
  intro: {
    lead: string;
    location: string;
  };
  tiles: {
    ride: TileCopy;
    stay: TileCopy;
    learn: TileCopy;
  };
  features: {
    beachRides: FeatureCopy;
    vaulting: FeatureCopy;
    stay: FeatureCopy;
    kidsCamps: FeatureCopy;
    byoHorse: FeatureCopy;
  };
  testimonials: TestimonialCopy[];
};

export type FeatureKey = keyof HomeContent['features'];
export type TileKey = keyof HomeContent['tiles'];

export type RideItemCopy = {
  title: string;
  description: string;
  bookingHref: string;
  bookingLabel: string;
};

export type RideCategoryCopy = {
  id: string;
  title: string;
  rides: RideItemCopy[];
};

export type RidesContent = {
  intro: string[];
  planner: {
    title: string;
    body: string[];
  };
  chooseTitle: string;
  categoriesLead: string;
  categories: RideCategoryCopy[];
  request: {
    eyebrow: string;
    title: string;
    body: string;
  };
};

export type CmsDoc = 'home' | 'rides';
