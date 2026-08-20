import { withBase } from '../lib/constants';
import { PATONS_ROCK } from './location';

export interface TideExtreme {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

interface CachedTides {
  generatedAt?: string;
  metadata?: {
    latitude?: number;
    longitude?: number;
    datum?: string;
    source?: string;
  };
  extremes: { time: string; height: number; type: string }[];
}

function parseExtremes(rows: { time: string; height: number; type: string }[]): TideExtreme[] {
  return rows.map((row) => ({
    time: new Date(row.time),
    height: row.height,
    type: row.type.toLowerCase().includes('high') ? 'high' : 'low',
  }));
}

async function fetchCached(): Promise<TideExtreme[] | null> {
  try {
    const res = await fetch(withBase('/data/tides.json'));
    if (!res.ok) return null;
    const data = (await res.json()) as CachedTides;
    if (!data.extremes?.length) return null;
    return parseExtremes(data.extremes);
  } catch {
    return null;
  }
}

export async function fetchTides(start: Date, end: Date): Promise<TideExtreme[]> {
  const cached = await fetchCached();
  if (!cached?.length) return [];
  return cached.filter((t) => t.time >= start && t.time <= end);
}

export function dateKeyInTz(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PATONS_ROCK.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function tidesOnDay(tides: TideExtreme[], dateKey: string): TideExtreme[] {
  return tides.filter((t) => dateKeyInTz(t.time) === dateKey);
}

export function highTidesNear(
  tides: TideExtreme[],
  windowStart: Date,
  windowEnd: Date,
): TideExtreme[] {
  const pad = 36 * 3_600_000;
  const from = windowStart.getTime() - pad;
  const to = windowEnd.getTime() + pad;
  return tides.filter(
    (t) => t.type === 'high' && t.time.getTime() >= from && t.time.getTime() <= to,
  );
}
