import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
const params = new URLSearchParams({
  lat: String(LAT),
  long: String(LON),
  startDate,
  numberOfDays: String(DAYS),
  datum: 'LAT',
  interval: '0',
});

const res = await fetch(`https://api.niwa.co.nz/tides/data?${params}`, {
  headers: { 'x-apikey': key },
});
if (!res.ok) {
  console.error(`NIWA ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
const values = (data.values ?? data.extremes ?? []) as { time?: string; date?: string; value?: number; height?: number }[];
const extremes = values.map((v, i) => {
  const height = Number(v.value ?? v.height ?? 0);
  const prev = Number(values[i - 1]?.value ?? values[i - 1]?.height ?? height);
  const next = Number(values[i + 1]?.value ?? values[i + 1]?.height ?? height);
  return {
    time: v.time || v.date,
    height,
    type: height >= prev && height >= next ? 'high' : 'low',
  };
});

const outDir = join(ROOT, 'public', 'data');
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'tides.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  extremes,
}, null, 2));
console.log(`Wrote ${extremes.length} tide extremes to public/data/tides.json`);
