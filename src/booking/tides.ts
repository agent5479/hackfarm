import { withBase } from '../lib/constants';
import { PATONS_ROCK, PLANNER_DAYS } from './location';

export interface TideExtreme {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

interface CachedTides {
  generatedAt?: string;
  extremes: { time: string; height: number; type: string }[];
}

function parseExtremes(rows: { time: string; height: number; type: string }[]): TideExtreme[] {
  return rows.map((row) => ({
    time: new Date(row.time),
    height: row.height,
    type: row.type.toLowerCase().includes('high') ? 'high' : 'low',
  }));
}

async function fetchNiwa(start: Date): Promise<TideExtreme[] | null> {
  const key = import.meta.env.VITE_NIWA_API_KEY as string | undefined;
  if (!key) return null;
  const params = new URLSearchParams({
    lat: String(PATONS_ROCK.lat),
    long: String(PATONS_ROCK.lon),
    startDate: start.toISOString().slice(0, 10),
    numberOfDays: String(PLANNER_DAYS),
    datum: 'LAT',
    interval: '0',
  });
  const res = await fetch(`https://api.niwa.co.nz/tides/data?${params}`, {
    headers: { 'x-apikey': key },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const values = (data.values ?? data.extremes ?? []) as { time?: string; date?: string; value?: number; height?: number }[];
  if (!values.length) return null;
  return values.map((v, i) => {
    const time = new Date(v.time || v.date || 0);
    const height = Number(v.value ?? v.height ?? 0);
    const prev = Number(values[i - 1]?.value ?? values[i - 1]?.height ?? height);
    const next = Number(values[i + 1]?.value ?? values[i + 1]?.height ?? height);
    const type: 'high' | 'low' = height >= prev && height >= next ? 'high' : 'low';
    return { time, height, type };
  });
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
  const niwa = await fetchNiwa(start);
  if (niwa?.length) return niwa.filter((t) => t.time >= start && t.time <= end);
  const cached = await fetchCached();
  if (cached?.length) return cached.filter((t) => t.time >= start && t.time <= end);
  return [];
}

export function tidesOnDay(tides: TideExtreme[], dateKey: string): TideExtreme[] {
  return tides.filter((t) => {
    const nz = new Intl.DateTimeFormat('en-CA', {
      timeZone: PATONS_ROCK.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(t.time);
    return nz === dateKey;
  });
}
