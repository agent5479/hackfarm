/**
 * Refresh NIWA high/low extremes for Paton's Rock → public/data/tides.json
 *
 * Primary call: GET /tides/data without `interval` (per tide-api.yaml).
 * numberOfDays max is 31, so we request sequential 31-day chunks to cover ~3 months.
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
const CHUNK_DAYS = 31;
const TOTAL_DAYS = 92;

const key = process.env.NIWA_API_KEY || process.env.VITE_NIWA_API_KEY;
if (!key) {
  console.error('Set NIWA_API_KEY (or VITE_NIWA_API_KEY) to refresh public/data/tides.json');
  process.exit(1);
}

function addDaysIso(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayKeyNz() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function niwaFetch(startDate, numberOfDays, includeInterval) {
  const params = new URLSearchParams({
    lat: String(LAT),
    long: String(LON),
    startDate,
    numberOfDays: String(numberOfDays),
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

async function fetchChunk(startDate, numberOfDays) {
  let data;
  let source = 'niwa-extremes';
  try {
    data = await niwaFetch(startDate, numberOfDays, false);
  } catch (err) {
    console.warn(`NIWA without interval failed for ${startDate}, retrying interval=10:`, err.message);
    data = await niwaFetch(startDate, numberOfDays, true);
    source = 'niwa-series-fallback';
  }

  let { extremes, source: parseSource } = parseNiwaExtremes(data, numberOfDays);
  if (parseSource === 'niwa-series-derived') source = parseSource;

  if (!extremes.length && source !== 'niwa-series-fallback') {
    console.warn(`No extremes for ${startDate}; retrying with interval=10`);
    data = await niwaFetch(startDate, numberOfDays, true);
    ({ extremes, source: parseSource } = parseNiwaExtremes(data, numberOfDays));
    source = parseSource === 'niwa-series-derived' ? 'niwa-series-fallback' : parseSource;
  }

  return { data, extremes, source };
}

const origin = todayKeyNz();
const chunks = [];
for (let offset = 0; offset < TOTAL_DAYS; offset += CHUNK_DAYS) {
  const days = Math.min(CHUNK_DAYS, TOTAL_DAYS - offset);
  const startDate = addDaysIso(origin, offset);
  console.log(`Fetching NIWA tides ${startDate} (${days} days)`);
  chunks.push(await fetchChunk(startDate, days));
}

const seen = new Set();
const extremes = [];
for (const chunk of chunks) {
  for (const e of chunk.extremes) {
    if (seen.has(e.time)) continue;
    seen.add(e.time);
    extremes.push(e);
  }
}
extremes.sort((a, b) => a.time.localeCompare(b.time));

const source = chunks.every((c) => c.source === 'niwa-extremes')
  ? 'niwa-extremes'
  : chunks.some((c) => c.source.includes('fallback') || c.source.includes('derived'))
    ? 'niwa-mixed'
    : chunks[0].source;

const highs = extremes.filter((e) => e.type === 'high').length;
const lows = extremes.filter((e) => e.type === 'low').length;
const meta = chunks[0]?.data?.metadata ?? {};
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
        days: TOTAL_DAYS,
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

console.log(`Wrote ${extremes.length} tide extremes (${highs} highs, ${lows} lows) covering ${TOTAL_DAYS} days`);
