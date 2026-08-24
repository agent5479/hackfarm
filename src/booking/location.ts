export const PATONS_ROCK = {
  lat: -40.79,
  lon: 172.76,
  /** IANA zone: NZST (UTC+12) in winter, NZDT (UTC+13) in summer. */
  timezone: 'Pacific/Auckland',
  label: "Paton's Rock, Golden Bay",
} as const;

export const PLANNER_DAYS = 28;
export const TIDE_HORIZON_DAYS = 92;
export const WEATHER_HORIZON_DAYS = 7;
export const SUNRISE_RIDE_WEEKDAYS = [0, 3, 5] as const; // Sun, Wed, Fri

export const TIDE_BEFORE_HIGH_HOURS = 3;
export const TIDE_AFTER_HIGH_HOURS = 2;
export const SUNRISE_RIDE_START_OFFSET_MIN = -60;

/** Allowed low-tide window for Paton's Rock (and default require-low rides). */
export const TIDE_BEFORE_LOW_HOURS = 2;
export const TIDE_AFTER_LOW_HOURS = 2;
/** Rangi needs ±2.25h so a 4.5h ride fills the window. */
export const RANGI_BEFORE_LOW_HOURS = 2.25;
export const RANGI_AFTER_LOW_HOURS = 2.25;
/** Allowed high-tide window for swimming (distinct from sunrise forbidden zone). */
export const TIDE_BEFORE_HIGH_ALLOWED_HOURS = 2;
export const TIDE_AFTER_HIGH_ALLOWED_HOURS = 2;

/** All weekdays except Friday. */
export const NO_FRIDAY_WEEKDAYS = [0, 1, 2, 3, 4, 6] as const;
