import { PATONS_ROCK } from './location';

/** IANA zone — NZST (UTC+12) or NZDT (UTC+13) is chosen automatically. */
export const NZ_TZ = PATONS_ROCK.timezone;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function dateKeyInTz(date: Date, timeZone: string = NZ_TZ): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function todayKeyNz(now: Date = new Date()): string {
  return dateKeyInTz(now);
}

function nzParts(instant: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NZ_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  return Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
}

/**
 * Instant when it is `hours:minutes` on `dateKey` in New Zealand,
 * using the offset in force that day (NZST or NZDT).
 */
export function zonedCivilTime(dateKey: string, hours: number, minutes = 0): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  for (const offsetHours of [13, 12] as const) {
    const utcMillis = Date.UTC(year, month - 1, day, hours - offsetHours, minutes, 0);
    const instant = new Date(utcMillis);
    const p = nzParts(instant);
    const key = `${p.year}-${p.month}-${p.day}`;
    if (key === dateKey && Number(p.hour) === hours && Number(p.minute) === minutes) {
      return instant;
    }
  }
  return new Date(`${dateKey}T${pad(hours)}:${pad(minutes)}:00+12:00`);
}

/** Midday in New Zealand — always exists; DST skip/repeat is at 2–3am. */
export function nzNoon(dateKey: string): Date {
  return zonedCivilTime(dateKey, 12, 0);
}

/** Add calendar days to a YYYY-MM-DD key (DST-safe; not 24-hour arithmetic). */
export function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function calendarDaysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86_400_000);
}
