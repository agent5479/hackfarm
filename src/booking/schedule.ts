import {
  PATONS_ROCK,
  SUNRISE_RIDE_WEEKDAYS,
  TIDE_AFTER_HIGH_HOURS,
  TIDE_BEFORE_HIGH_HOURS,
  WEATHER_HORIZON_DAYS,
} from './location';
import { type RideType, SUNRISE_RIDE } from './rides';
import { sunTimesForDate } from './sun';
import { dateKeyInTz, highTidesNear, lowTidesNear, type TideExtreme } from './tides';
import { weatherLabel, type DayWeather } from './weather';

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDayLabel(dateKey: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00`));
}

const MS_HOUR = 3_600_000;
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export type ScheduleStatus = 'rideable' | 'caution' | 'unavailable';
export type TidePhase = 'safe_before_high' | 'safe_after_high' | 'forbidden' | 'unknown';

export interface SunriseDaySchedule {
  date: string;
  weekday: number;
  isRideDay: boolean;
  sunrise: Date;
  rideStart: Date;
  rideEnd: Date;
  status: ScheduleStatus;
  statusReasons: string[];
  nearestHigh?: Date;
  nearestLow?: Date;
  tidePhase: TidePhase;
  weatherLabel?: string;
  weatherAffectsStatus: boolean;
}

export interface ForbiddenZone {
  high: Date;
  start: Date;
  end: Date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateKeyInTz(d);
}

export function daysFromToday(dateKey: string): number {
  const today = dateKeyInTz(new Date());
  const a = new Date(`${today}T12:00:00`);
  const b = new Date(`${dateKey}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function weekdayInTz(dateKey: string): number {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: PATONS_ROCK.timezone,
    weekday: 'short',
  }).format(new Date(`${dateKey}T12:00:00`));
  return WD[label] ?? 0;
}

export function startOfWeekMonday(date: Date): string {
  const key = dateKeyInTz(date);
  const wd = weekdayInTz(key);
  const mondayOffset = wd === 0 ? -6 : 1 - wd;
  return addDays(key, mondayOffset);
}

export function weekDateKeys(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartKey, i));
}

export function formatWeekRange(weekStartKey: string): string {
  const endKey = addDays(weekStartKey, 6);
  const fmt = (key: string) =>
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: PATONS_ROCK.timezone,
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${key}T12:00:00`));
  const year = new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    year: 'numeric',
  }).format(new Date(`${weekStartKey}T12:00:00`));
  return `${fmt(weekStartKey)} – ${fmt(endKey)} ${year}`;
}

export function forbiddenZoneForHigh(high: Date): ForbiddenZone {
  return {
    high,
    start: new Date(high.getTime() - TIDE_BEFORE_HIGH_HOURS * MS_HOUR),
    end: new Date(high.getTime() + TIDE_AFTER_HIGH_HOURS * MS_HOUR),
  };
}

export function forbiddenZones(highs: TideExtreme[]): ForbiddenZone[] {
  return highs.filter((t) => t.type === 'high').map((t) => forbiddenZoneForHigh(t.time));
}

export function rideOverlapsForbiddenHighZone(
  start: Date,
  end: Date,
  highs: TideExtreme[],
): TideExtreme | undefined {
  for (const high of highs) {
    if (high.type !== 'high') continue;
    const { start: fStart, end: fEnd } = forbiddenZoneForHigh(high.time);
    if (start.getTime() < fEnd.getTime() && end.getTime() > fStart.getTime()) return high;
  }
  return undefined;
}

function nearestTideTo(tides: TideExtreme[], instant: Date): TideExtreme | undefined {
  let best: TideExtreme | undefined;
  let bestDist = Infinity;
  for (const t of tides) {
    const dist = Math.abs(t.time.getTime() - instant.getTime());
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }
  return best;
}

function nearestHighTo(highs: TideExtreme[], instant: Date): TideExtreme | undefined {
  return nearestTideTo(highs.filter((t) => t.type === 'high'), instant);
}

function tidePhaseAt(instant: Date, highs: TideExtreme[]): TidePhase {
  for (const high of highs) {
    const { start: fStart, end: fEnd } = forbiddenZoneForHigh(high.time);
    if (instant.getTime() > fStart.getTime() && instant.getTime() < fEnd.getTime()) {
      return 'forbidden';
    }
  }
  const near = nearestHighTo(highs, instant);
  if (!near) return 'unknown';
  if (instant.getTime() <= near.time.getTime() - TIDE_BEFORE_HIGH_HOURS * MS_HOUR) {
    return 'safe_before_high';
  }
  if (instant.getTime() >= near.time.getTime() + TIDE_AFTER_HIGH_HOURS * MS_HOUR) {
    return 'safe_after_high';
  }
  return 'forbidden';
}

function tideReason(high: TideExtreme, rideStart: Date): string {
  const hoursBefore = (high.time.getTime() - rideStart.getTime()) / MS_HOUR;
  if (hoursBefore >= TIDE_BEFORE_HIGH_HOURS) {
    return `Clear of high tide (${formatClock(high.time)} — ${Math.floor(hoursBefore)}h+ before)`;
  }
  const hoursAfter = (rideStart.getTime() - high.time.getTime()) / MS_HOUR;
  if (hoursAfter >= TIDE_AFTER_HIGH_HOURS) {
    return `Clear of high tide (${formatClock(high.time)} — ${Math.floor(hoursAfter)}h+ after)`;
  }
  return `Too close to high tide (${formatClock(high.time)})`;
}

function applyWeather(
  day: DayWeather,
  ride: RideType,
  reasons: string[],
  status: ScheduleStatus,
  affectsStatus: boolean,
): ScheduleStatus {
  if (!affectsStatus) {
    reasons.push(`Forecast: ${weatherLabel(day.weatherCode)} (may change)`);
    return status;
  }

  let next = status;
  if (day.windMaxKmh > ride.maxWindKmh) {
    next = 'unavailable';
    reasons.push(`Wind ${Math.round(day.windMaxKmh)} km/h`);
  } else if (day.windMaxKmh > ride.maxWindKmh * 0.75) {
    if (next !== 'unavailable') next = 'caution';
    reasons.push(`Breezy ${Math.round(day.windMaxKmh)} km/h`);
  }

  if (day.rainMm > ride.maxRainMm) {
    next = 'unavailable';
    reasons.push(`${day.rainMm.toFixed(0)} mm rain`);
  } else if (day.rainMm > ride.maxRainMm * 0.5) {
    if (next !== 'unavailable') next = 'caution';
    reasons.push(`Showers ${day.rainMm.toFixed(1)} mm`);
  }

  if (ride.minTempC != null && day.maxTempC < ride.minTempC) {
    next = 'unavailable';
    reasons.push(`Cool ${Math.round(day.maxTempC)}°C`);
  }

  return next;
}

export function buildSunriseDaySchedule(
  dateKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
): SunriseDaySchedule {
  const weekday = weekdayInTz(dateKey);
  const isRideDay = ride.scheduleWeekdays
    ? ride.scheduleWeekdays.includes(weekday)
    : true;

  const noon = new Date(`${dateKey}T12:00:00`);
  const sun = sunTimesForDate(noon);
  const rideStart = addMinutes(sun.sunrise, ride.startOffsetMin);
  const rideEnd = addMinutes(rideStart, ride.durationHours * 60);

  const reasons: string[] = [];
  let status: ScheduleStatus = 'rideable';
  let nearestHigh: Date | undefined;
  let nearestLow: Date | undefined;
  let tidePhase: TidePhase = 'unknown';

  reasons.push(`Sunrise ${formatClock(sun.sunrise)}`);
  reasons.push(`Ride starts ${formatClock(rideStart)}`);

  if (!isRideDay) {
    status = 'unavailable';
    reasons.unshift('Sunrise rides: Wed, Fri & Sun only');
  }

  const dayWx = forecast.find((d) => d.date === dateKey);
  const weatherAffectsStatus = dayWx != null && daysFromToday(dateKey) <= WEATHER_HORIZON_DAYS;
  const wxLabel = dayWx ? weatherLabel(dayWx.weatherCode) : undefined;

  if (ride.usesTides) {
    const highs = highTidesNear(tides, rideStart, rideEnd);
    const lows = lowTidesNear(tides, rideStart, rideEnd);
    nearestHigh = nearestHighTo(highs, rideStart)?.time;
    nearestLow = nearestTideTo(lows, rideStart)?.time;
    tidePhase = tidePhaseAt(rideStart, highs);

    if (!highs.length) {
      if (status !== 'unavailable') status = 'caution';
      reasons.push('Tide times unavailable');
    } else {
      const conflict = rideOverlapsForbiddenHighZone(rideStart, rideEnd, highs);
      if (conflict) {
        status = 'unavailable';
        reasons.push(tideReason(conflict, rideStart));
        tidePhase = 'forbidden';
      } else if (nearestHigh) {
        reasons.push(tideReason({ time: nearestHigh, height: 0, type: 'high' }, rideStart));
      }
      if (nearestLow) {
        reasons.push(`Low tide ${formatClock(nearestLow)}`);
      }
    }
  }

  if (dayWx) {
    status = applyWeather(dayWx, ride, reasons, status, weatherAffectsStatus);
  } else if (daysFromToday(dateKey) > WEATHER_HORIZON_DAYS) {
    reasons.push('Weather checked closer to the date');
  }

  return {
    date: dateKey,
    weekday,
    isRideDay,
    sunrise: sun.sunrise,
    rideStart,
    rideEnd,
    status,
    statusReasons: reasons,
    nearestHigh,
    nearestLow,
    tidePhase,
    weatherLabel: wxLabel,
    weatherAffectsStatus,
  };
}

export function buildSunriseWeekSchedule(
  weekStartKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
): SunriseDaySchedule[] {
  return weekDateKeys(weekStartKey).map((dateKey) =>
    buildSunriseDaySchedule(dateKey, forecast, tides, ride),
  );
}

export function weekSummary(days: SunriseDaySchedule[]): string {
  const rideDays = days.filter((d) => d.isRideDay);
  const rideable = rideDays.filter((d) => d.status === 'rideable').length;
  const caution = rideDays.filter((d) => d.status === 'caution').length;
  const blocked = rideDays.filter((d) => d.status === 'unavailable').length;
  const parts = [`${rideable} rideable`];
  if (caution) parts.push(`${caution} check conditions`);
  if (blocked) parts.push(`${blocked} unavailable`);
  return `This week: ${parts.join(' · ')}`;
}

export function detailSummary(day: SunriseDaySchedule): string {
  const dateLabel = new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${day.date}T12:00:00`));

  const bits = [
    dateLabel,
    `Ride starts ${formatClock(day.rideStart)}`,
    `Sunrise ${formatClock(day.sunrise)}`,
  ];

  if (day.nearestHigh) {
    bits.push(`High tide ${formatClock(day.nearestHigh)}`);
  }
  if (day.nearestLow) {
    bits.push(`Low tide ${formatClock(day.nearestLow)}`);
  }

  if (day.weatherLabel && day.weatherAffectsStatus) {
    bits.push(`Forecast: ${day.weatherLabel}`);
  } else if (!day.weatherAffectsStatus) {
    bits.push('Weather checked closer to the date');
  }

  return bits.join(' · ');
}

export function isSunriseRideWeekday(weekday: number): boolean {
  return (SUNRISE_RIDE_WEEKDAYS as readonly number[]).includes(weekday);
}
