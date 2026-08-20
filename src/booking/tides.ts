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

export async function fetchAllTides(): Promise<TideExtreme[]> {
  return (await fetchCached()) ?? [];
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

export function lowTidesNear(
  tides: TideExtreme[],
  windowStart: Date,
  windowEnd: Date,
): TideExtreme[] {
  const pad = 36 * 3_600_000;
  const from = windowStart.getTime() - pad;
  const to = windowEnd.getTime() + pad;
  return tides.filter(
    (t) => t.type === 'low' && t.time.getTime() >= from && t.time.getTime() <= to,
  );
}

/** Sinusoidal interpolation between bracketing extremes — visual tide level only. */
export function estimateTideHeightAt(instant: Date, extremes: TideExtreme[]): number {
  if (!extremes.length) return 0;
  const sorted = [...extremes].sort((a, b) => a.time.getTime() - b.time.getTime());
  const t = instant.getTime();

  if (t <= sorted[0].time.getTime()) return sorted[0].height;
  if (t >= sorted[sorted.length - 1].time.getTime()) return sorted[sorted.length - 1].height;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t >= a.time.getTime() && t <= b.time.getTime()) {
      const span = b.time.getTime() - a.time.getTime();
      if (span === 0) return a.height;
      const phase = ((t - a.time.getTime()) / span) * Math.PI;
      const mid = (a.height + b.height) / 2;
      const amp = Math.abs(b.height - a.height) / 2;
      const rising = (a.type === 'low' && b.type === 'high') || b.height > a.height;
      return rising ? mid - amp * Math.cos(phase) : mid + amp * Math.cos(phase);
    }
  }

  let nearest = sorted[0];
  let best = Math.abs(sorted[0].time.getTime() - t);
  for (const e of sorted) {
    const d = Math.abs(e.time.getTime() - t);
    if (d < best) {
      best = d;
      nearest = e;
    }
  }
  return nearest.height;
}
