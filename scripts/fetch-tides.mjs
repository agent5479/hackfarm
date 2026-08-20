/**
 * Refresh NIWA high/low extremes for Paton's Rock → public/data/tides.json
 *
 * Primary call: GET /tides/data without `interval` (per tide-api.yaml).
 * Verified response shape (2026-08-20):
 *   { metadata: { latitude, longitude, datum, days, ... }, values: [
 *     { time: "2026-08-20T02:53:00Z", value: 3.2, type: "high" },
 *     { time: "2026-08-20T08:59:00Z", value: 1.39, type: "low" },
 *     ... ~4 events/day (2 highs + 2 lows) over numberOfDays
 *   ]}
 * Source logged as `niwa-extremes` when rows are labelled high/low.
 * Fallback: interval=10 dense series → extract peaks via tide-extremes.mjs.
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseNiwaExtremes } from './tide-extremes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LAT = -40.79;
const LON = 172.76;
const DAYS = 14;

const key = process.env.NIWA_API_KEY || process.env.VITE_NIWA_API_KEY;
if (!key) {
  console.error('Set NIWA_API_KEY (or VITE_NIWA_API_KEY) to refresh public/data/tides.json');
  process.exit(1);
}

const startDate = new Date().toISOString().slice(0, 10);

async function niwaFetch(includeInterval) {
  const params = new URLSearchParams({
    lat: String(LAT),
    long: String(LON),
    startDate,
    numberOfDays: String(DAYS),
    datum: 'LAT',
  });
  if (includeInterval) params.set('interval', '10');

  const res = await fetch(`https://api.niwa.co.nz/tides/data?${params}`, {
    headers: { 'x-apikey': key },
  });
  if (!res.ok) {
    throw new Error(`NIWA ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

let data;
let source = 'niwa-extremes';

try {
  data = await niwaFetch(false);
} catch (err) {
  console.warn('NIWA without interval failed, retrying with interval=10:', err.message);
  data = await niwaFetch(true);
  source = 'niwa-series-fallback';
}

let { extremes, source: parseSource } = parseNiwaExtremes(data, DAYS);
if (parseSource === 'niwa-series-derived') source = parseSource;

if (!extremes.length && source !== 'niwa-series-fallback') {
  console.warn('No extremes from primary call; retrying with interval=10');
  data = await niwaFetch(true);
  ({ extremes, source: parseSource } = parseNiwaExtremes(data, DAYS));
  source = parseSource === 'niwa-series-derived' ? 'niwa-series-fallback' : parseSource;
}

const highs = extremes.filter((e) => e.type === 'high').length;
const lows = extremes.filter((e) => e.type === 'low').length;

const meta = data.metadata ?? {};
const outDir = join(ROOT, 'public', 'data');
await mkdir(outDir, { recursive: true });
await writeFile(
  join(outDir, 'tides.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      metadata: {
        latitude: meta.latitude ?? LAT,
        longitude: meta.longitude ?? LON,
        datum: meta.datum ?? 'LAT',
        source,
        days: DAYS,
      },
      extremes: extremes.map((e) => ({
        time: e.time,
        height: e.height,
        type: e.type,
      })),
    },
    null,
    2,
  ),
);

console.log(`Wrote ${extremes.length} tide extremes (${highs} highs, ${lows} lows) to public/data/tides.json`);
