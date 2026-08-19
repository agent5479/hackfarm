export type DaylightRule = 'after-sunrise' | 'around-sunset' | 'daylight';

export interface RideType {
  id: string;
  name: string;
  durationHours: number;
  daylight: DaylightRule;
  usesTides: boolean;
  maxWindKmh: number;
  maxRainMm: number;
  minTempC?: number;
  sunriseBufferMin: number;
  fareharborItemId?: string;
  hint: string;
}

export const RIDE_TYPES: RideType[] = [
  {
    id: 'beach',
    name: "Paton's Rock Beach Ride",
    durationHours: 2,
    daylight: 'after-sunrise',
    usesTides: true,
    maxWindKmh: 40,
    maxRainMm: 8,
    sunriseBufferMin: 20,
    hint: 'Best around low to mid tide in daylight.',
  },
  {
    id: 'sunset',
    name: 'Sunset Ride',
    durationHours: 1.5,
    daylight: 'around-sunset',
    usesTides: true,
    maxWindKmh: 35,
    maxRainMm: 6,
    sunriseBufferMin: 0,
    hint: 'Timed to finish near sunset when the tide is usable.',
  },
  {
    id: 'swim',
    name: 'Swimming with Horses',
    durationHours: 1.5,
    daylight: 'after-sunrise',
    usesTides: true,
    maxWindKmh: 28,
    maxRainMm: 4,
    minTempC: 12,
    sunriseBufferMin: 45,
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
    sunriseBufferMin: 15,
    hint: 'Weather only — tides do not apply.',
  },
];

export function getRideType(id: string): RideType {
  return RIDE_TYPES.find((r) => r.id === id) ?? RIDE_TYPES[0];
}
