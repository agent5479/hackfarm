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
