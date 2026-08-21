export type DaylightRule = 'before-sunrise' | 'around-sunset' | 'daylight' | 'flex-tide';

export interface RideType {
  id: string;
  name: string;
  durationHours: number;
  daylight: DaylightRule;
  usesTides: boolean;
  maxWindKmh: number;
  maxRainMm: number;
  minTempC?: number;
  startOffsetMin: number;
  scheduleWeekdays?: readonly number[];
  fareharborItemId?: string;
  hint: string;
}

export const RIDE_TYPES: RideType[] = [
  {
    id: 'sunrise',
    name: "Sunrise Beach Ride — Paton's Rock",
    durationHours: 2,
    daylight: 'before-sunrise',
    usesTides: true,
    maxWindKmh: 40,
    maxRainMm: 8,
    startOffsetMin: -60,
    scheduleWeekdays: [0, 3, 5],
    // TODO: confirm whether sunrise and twilight should become separate FareHarbor items
    fareharborItemId: '294945',
    hint: 'Wed, Fri & Sun · starts an hour before sunrise · tide must clear high water.',
  },
  {
    id: 'twilight',
    name: "Twilight Beach Ride — Paton's Rock",
    durationHours: 2,
    daylight: 'around-sunset',
    usesTides: true,
    maxWindKmh: 40,
    maxRainMm: 8,
    startOffsetMin: -60,
    scheduleWeekdays: [0, 3, 5],
    // TODO: confirm whether sunrise and twilight should become separate FareHarbor items
    fareharborItemId: '294945',
    hint: 'Wed, Fri & Sun · starts an hour before sunset · tide must clear high water.',
  },
  {
    id: 'swim',
    name: 'Swimming with Horses',
    durationHours: 1.5,
    daylight: 'flex-tide',
    usesTides: true,
    maxWindKmh: 28,
    maxRainMm: 4,
    minTempC: 12,
    startOffsetMin: 45,
    hint: 'Needs calmer weather, warmer air, and a rideable tide.',
  },
  {
    id: 'arena',
    name: 'Arena / on-farm',
    durationHours: 1,
    daylight: 'daylight',
    usesTides: false,
    maxWindKmh: 55,
    maxRainMm: 15,
    startOffsetMin: 15,
    hint: 'Weather only — tides do not apply.',
  },
];

export const SUNRISE_RIDE = RIDE_TYPES[0];
export const TWILIGHT_RIDE = RIDE_TYPES[1];

/** @deprecated Use TWILIGHT_RIDE — kept for callers that still look up `sunset`. */
export const SUNSET_RIDE = TWILIGHT_RIDE;

export function getRideType(id: string): RideType {
  if (id === 'sunset') return TWILIGHT_RIDE;
  return RIDE_TYPES.find((r) => r.id === id) ?? RIDE_TYPES[0];
}
