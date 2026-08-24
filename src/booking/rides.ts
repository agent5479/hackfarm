import {
  NO_FRIDAY_WEEKDAYS,
  RANGI_AFTER_LOW_HOURS,
  RANGI_BEFORE_LOW_HOURS,
  TIDE_AFTER_HIGH_ALLOWED_HOURS,
  TIDE_AFTER_LOW_HOURS,
  TIDE_BEFORE_HIGH_ALLOWED_HOURS,
  TIDE_BEFORE_LOW_HOURS,
} from './location';

export type DaylightRule = 'before-sunrise' | 'around-sunset' | 'daylight' | 'flex-tide';

export type TideMode = 'avoid-high' | 'require-low' | 'require-high';

export interface RideType {
  id: string;
  name: string;
  durationHours: number;
  daylight: DaylightRule;
  usesTides: boolean;
  tideMode?: TideMode;
  tideBeforeHours?: number;
  tideAfterHours?: number;
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
    tideMode: 'avoid-high',
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
    tideMode: 'avoid-high',
    maxWindKmh: 40,
    maxRainMm: 8,
    startOffsetMin: -60,
    scheduleWeekdays: [0, 3, 5],
    // TODO: confirm whether sunrise and twilight should become separate FareHarbor items
    fareharborItemId: '294945',
    hint: 'Wed, Fri & Sun · starts an hour before sunset · tide must clear high water.',
  },
  {
    id: 'patons-rock',
    name: "Paton's Rock Beach Ride",
    durationHours: 2.5,
    daylight: 'flex-tide',
    usesTides: true,
    tideMode: 'require-low',
    tideBeforeHours: TIDE_BEFORE_LOW_HOURS,
    tideAfterHours: TIDE_AFTER_LOW_HOURS,
    maxWindKmh: 40,
    maxRainMm: 8,
    startOffsetMin: 0,
    scheduleWeekdays: NO_FRIDAY_WEEKDAYS,
    fareharborItemId: '294928',
    hint: 'Not Fridays · entire ride inside low tide ±2h · daylight only · clear of sunrise/twilight slots.',
  },
  {
    id: 'rangi',
    name: 'Rangi Ride',
    durationHours: 4.5,
    daylight: 'flex-tide',
    usesTides: true,
    tideMode: 'require-low',
    tideBeforeHours: RANGI_BEFORE_LOW_HOURS,
    tideAfterHours: RANGI_AFTER_LOW_HOURS,
    maxWindKmh: 40,
    maxRainMm: 8,
    startOffsetMin: 0,
    scheduleWeekdays: NO_FRIDAY_WEEKDAYS,
    fareharborItemId: '294929',
    hint: 'Not Fridays · entire ride inside low tide ±2.25h · daylight only · clear of sunrise/twilight slots.',
  },
  {
    id: 'swimming',
    name: 'Swimming / Playing with Horses in the Water',
    durationHours: 3,
    daylight: 'flex-tide',
    usesTides: true,
    tideMode: 'require-high',
    tideBeforeHours: TIDE_BEFORE_HIGH_ALLOWED_HOURS,
    tideAfterHours: TIDE_AFTER_HIGH_ALLOWED_HOURS,
    maxWindKmh: 28,
    maxRainMm: 4,
    minTempC: 12,
    startOffsetMin: 0,
    scheduleWeekdays: NO_FRIDAY_WEEKDAYS,
    fareharborItemId: '295292',
    hint: 'Not Fridays · entire ride inside high tide ±2h · daylight only · clear of sunrise/twilight slots.',
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
export const PATONS_ROCK_RIDE = RIDE_TYPES[2];
export const RANGI_RIDE = RIDE_TYPES[3];
export const SWIMMING_RIDE = RIDE_TYPES[4];

/** @deprecated Use TWILIGHT_RIDE — kept for callers that still look up `sunset`. */
export const SUNSET_RIDE = TWILIGHT_RIDE;

/** @deprecated Use SWIMMING_RIDE — kept for callers that still look up `swim`. */
export const SWIM_RIDE = SWIMMING_RIDE;

export function getRideType(id: string): RideType {
  if (id === 'sunset') return TWILIGHT_RIDE;
  if (id === 'swim') return SWIMMING_RIDE;
  return RIDE_TYPES.find((r) => r.id === id) ?? RIDE_TYPES[0];
}
