import {
  PATONS_ROCK,
  PLANNER_DAYS,
  SUNRISE_RIDE_WEEKDAYS,
  TIDE_AFTER_HIGH_HOURS,
  TIDE_BEFORE_HIGH_HOURS,
  TIDE_HORIZON_DAYS,
  WEATHER_HORIZON_DAYS,
} from './location';
import { type RideType, SUNRISE_RIDE } from './rides';
import { sunTimesForDate } from './sun';
import {
  estimateTideHeightAt,
  highTidesNear,
  lowTidesNear,
  tideFlowAt,
  tidesCoverDate,
  type TideExtreme,
  type TideFlow,
} from './tides';
import { weatherImpact, weatherLabel, type DayWeather } from './weather';
import {
  addCalendarDays,
  calendarDaysBetween,
  dateKeyInTz,
  nzNoon,
  todayKeyNz,
} from './nzTime';

export { todayKeyNz };

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
  }).format(nzNoon(dateKey));
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
  tideHeightAtRide?: number;
  tideFlow?: TideFlow;
  nearestHighHeight?: number;
  tideBlocked?: boolean;
  weatherBlocked?: boolean;
  weatherCaution?: boolean;
  weatherCode?: number;
  hasScheduleData?: boolean;
}

export interface MonthGridCell {
  date: string;
  inMonth: boolean;
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
  return addCalendarDays(dateKey, days);
}

export function daysFromToday(dateKey: string): number {
  return calendarDaysBetween(todayKeyNz(), dateKey);
}

export function weekdayInTz(dateKey: string): number {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: PATONS_ROCK.timezone,
    weekday: 'short',
  }).format(nzNoon(dateKey));
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
    }).format(nzNoon(key));
  const year = new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    year: 'numeric',
  }).format(nzNoon(weekStartKey));
  return `${fmt(weekStartKey)} – ${fmt(endKey)} ${year}`;
}

export function startOfMonth(date: Date): string {
  const key = dateKeyInTz(date);
  return `${key.slice(0, 7)}-01`;
}

export function monthKeyFromDate(date: Date): string {
  return dateKeyInTz(date).slice(0, 7);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthTitle(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, 1));
}

export function monthGridDates(monthKey: string): MonthGridCell[] {
  const [y, m] = monthKey.split('-').map(Number);
  const firstOfMonth = `${monthKey}-01`;
  const wd = weekdayInTz(firstOfMonth);
  const mondayOffset = wd === 0 ? -6 : 1 - wd;
  const gridStart = addDays(firstOfMonth, mondayOffset);

  const lastDay = new Date(y, m, 0).getDate();
  const lastOfMonth = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

  const cells: MonthGridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({
      date,
      inMonth: date >= firstOfMonth && date <= lastOfMonth,
    });
  }
  return cells;
}

export function dayOfMonth(dateKey: string): number {
  return Number(dateKey.slice(8, 10));
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function shiftDateKey(dateKey: string, days: number): string {
  return addDays(dateKey, days);
}

export function maxHorizonWindowStart(todayKey: string = todayKeyNz()): string {
  return addDays(todayKey, Math.max(0, TIDE_HORIZON_DAYS - PLANNER_DAYS));
}

export function rollingHorizonDates(startKey: string, count: number = PLANNER_DAYS): string[] {
  return Array.from({ length: count }, (_, i) => addDays(startKey, i));
}

export function weekdayHeadersFrom(startKey: string): string[] {
  const startWd = weekdayInTz(startKey);
  return Array.from({ length: 7 }, (_, i) => WEEKDAY_SHORT[(startWd + i) % 7]);
}

export function formatHorizonRange(startKey: string, count: number = PLANNER_DAYS): string {
  const endKey = addDays(startKey, count - 1);
  const fmt = (key: string) =>
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: PATONS_ROCK.timezone,
      day: 'numeric',
      month: 'short',
    }).format(nzNoon(key));
  const year = new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    year: 'numeric',
  }).format(nzNoon(endKey));
  return `${fmt(startKey)} – ${fmt(endKey)} ${year}`;
}

export function shortMonth(dateKey: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    month: 'short',
  }).format(nzNoon(dateKey));
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
): { status: ScheduleStatus; weatherBlocked: boolean; weatherCaution: boolean } {
  if (!affectsStatus) {
    reasons.push(`Forecast: ${weatherLabel(day.weatherCode)} (may change)`);
    return { status, weatherBlocked: false, weatherCaution: false };
  }

  const impact = weatherImpact(day, ride, status);
  if (day.windMaxKmh > ride.maxWindKmh) {
    reasons.push(`Wind ${Math.round(day.windMaxKmh)} km/h`);
  } else if (day.windMaxKmh > ride.maxWindKmh * 0.75) {
    reasons.push(`Breezy ${Math.round(day.windMaxKmh)} km/h`);
  }
  if (day.rainMm > ride.maxRainMm) {
    reasons.push(`${day.rainMm.toFixed(0)} mm rain`);
  } else if (day.rainMm > ride.maxRainMm * 0.5) {
    reasons.push(`Showers ${day.rainMm.toFixed(1)} mm`);
  }
  if (ride.minTempC != null && day.maxTempC < ride.minTempC) {
    reasons.push(`Cool ${Math.round(day.maxTempC)}°C`);
  }

  return {
    status: impact.status,
    weatherBlocked: impact.blocked,
    weatherCaution: impact.caution,
  };
}

export function buildSunriseDaySchedule(
  dateKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
  allTides: TideExtreme[] = tides,
): SunriseDaySchedule {
  const weekday = weekdayInTz(dateKey);
  const isRideDay = ride.scheduleWeekdays
    ? ride.scheduleWeekdays.includes(weekday)
    : true;

  const sun = sunTimesForDate(dateKey);
  const rideStart = addMinutes(sun.sunrise, ride.startOffsetMin);
  const rideEnd = addMinutes(rideStart, ride.durationHours * 60);

  const reasons: string[] = [];
  let status: ScheduleStatus = 'rideable';
  let nearestHigh: Date | undefined;
  let nearestLow: Date | undefined;
  let nearestHighHeight: number | undefined;
  let tidePhase: TidePhase = 'unknown';
  let tideBlocked = false;
  let weatherBlocked = false;
  let weatherCaution = false;
  let tideHeightAtRide: number | undefined;
  let tideFlow: TideFlow | undefined;

  const fromToday = daysFromToday(dateKey);
  const hasScheduleData =
    fromToday >= 0 && fromToday < TIDE_HORIZON_DAYS && tidesCoverDate(dateKey, allTides);

  reasons.push(`Arrive by ${formatClock(rideStart)}`);
  reasons.push(`Sunrise ${formatClock(sun.sunrise)}`);

  if (!isRideDay) {
    status = 'unavailable';
    reasons.unshift('Sunrise rides: Wed, Fri & Sun only');
  }

  const dayWx = forecast.find((d) => d.date === dateKey);
  const weatherAffectsStatus = dayWx != null && daysFromToday(dateKey) <= WEATHER_HORIZON_DAYS;
  const wxLabel = dayWx ? weatherLabel(dayWx.weatherCode) : undefined;
  const weatherCode = dayWx?.weatherCode;

  if (ride.usesTides && hasScheduleData && allTides.length) {
    tideHeightAtRide = estimateTideHeightAt(rideStart, allTides);
    tideFlow = tideFlowAt(rideStart, allTides);
    if (tideFlow) {
      reasons.push(tideFlow === 'incoming' ? 'Tide incoming' : 'Tide outgoing');
    }
  }

  if (ride.usesTides && hasScheduleData) {
    const highs = highTidesNear(tides, rideStart, rideEnd);
    const lows = lowTidesNear(tides, rideStart, rideEnd);
    const nearHigh = nearestHighTo(highs, rideStart);
    nearestHigh = nearHigh?.time;
    nearestHighHeight = nearHigh?.height;
    nearestLow = nearestTideTo(lows, rideStart)?.time;
    tidePhase = tidePhaseAt(rideStart, highs);

    if (!highs.length) {
      if (status !== 'unavailable') status = 'caution';
      reasons.push('Tide times unavailable');
    } else {
      const conflict = rideOverlapsForbiddenHighZone(rideStart, rideEnd, highs);
      if (conflict) {
        status = 'unavailable';
        tideBlocked = true;
        reasons.push(tideReason(conflict, rideStart));
        tidePhase = 'forbidden';
      } else if (nearestHigh) {
        reasons.push(tideReason({ time: nearestHigh, height: 0, type: 'high' }, rideStart));
      }
      if (nearestLow) {
        reasons.push(`Low tide ${formatClock(nearestLow)}`);
      }
    }
  } else if (ride.usesTides && isRideDay && !hasScheduleData) {
    if (status !== 'unavailable') status = 'caution';
    reasons.push('Tide times available within three months');
  }

  if (dayWx) {
    const wx = applyWeather(dayWx, ride, reasons, status, weatherAffectsStatus);
    status = wx.status;
    weatherBlocked = wx.weatherBlocked;
    weatherCaution = wx.weatherCaution;
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
    tideHeightAtRide,
    tideFlow,
    nearestHighHeight,
    tideBlocked,
    weatherBlocked,
    weatherCaution,
    weatherCode,
    hasScheduleData,
  };
}

export function buildSunriseWeekSchedule(
  weekStartKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
  allTides: TideExtreme[] = tides,
): SunriseDaySchedule[] {
  return weekDateKeys(weekStartKey).map((dateKey) =>
    buildSunriseDaySchedule(dateKey, forecast, tides, ride, allTides),
  );
}

export function buildSunriseMonthSchedule(
  monthKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
  allTides: TideExtreme[] = tides,
): Map<string, SunriseDaySchedule> {
  const map = new Map<string, SunriseDaySchedule>();
  for (const cell of monthGridDates(monthKey)) {
    map.set(cell.date, buildSunriseDaySchedule(cell.date, forecast, tides, ride, allTides));
  }
  return map;
}

export function buildSunriseHorizonSchedule(
  startKey: string,
  forecast: DayWeather[],
  tides: TideExtreme[],
  ride: RideType = SUNRISE_RIDE,
  allTides: TideExtreme[] = tides,
  days: number = PLANNER_DAYS,
): Map<string, SunriseDaySchedule> {
  const map = new Map<string, SunriseDaySchedule>();
  for (const date of rollingHorizonDates(startKey, days)) {
    map.set(date, buildSunriseDaySchedule(date, forecast, tides, ride, allTides));
  }
  return map;
}

export function horizonSummary(days: SunriseDaySchedule[]): string {
  const rideDays = days.filter((d) => d.isRideDay && d.hasScheduleData);
  const rideable = rideDays.filter((d) => d.status === 'rideable').length;
  const caution = rideDays.filter((d) => d.status === 'caution').length;
  const blocked = rideDays.filter((d) => d.status === 'unavailable').length;
  const parts = [`${rideable} rideable`];
  if (caution) parts.push(`${caution} check conditions`);
  if (blocked) parts.push(`${blocked} unavailable`);
  return `These 4 weeks: ${parts.join(' · ')}`;
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
  }).format(nzNoon(day.date));

  const bits = [
    dateLabel,
    `Arrive by ${formatClock(day.rideStart)}`,
    `Sunrise ${formatClock(day.sunrise)}`,
  ];

  if (day.nearestHigh) {
    bits.push(`High tide ${formatClock(day.nearestHigh)}`);
  }
  if (day.tideFlow) {
    bits.push(day.tideFlow === 'incoming' ? 'Tide incoming' : 'Tide outgoing');
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
