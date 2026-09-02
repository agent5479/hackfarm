/**
 * Cache bookable FareHarbor availability IDs for tide-calendar rides.
 * Uses the public v1 API (no auth required):
 *   GET /api/v1/companies/hackfarm/items/{itemId}/availabilities/date/{YYYY-MM-DD}/
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHORTNAME = 'hackfarm';
const HORIZON_DAYS = 92;
const CONCURRENCY = 6;

/** Tide-calendar FareHarbor item IDs */
const ITEM_IDS = ['294945', '294928', '294929', '295292'];

function todayKeyNz() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function addDays(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().slice(0, 10);
}

function dateRange(startKey, count) {
  const dates = [];
  for (let i = 0; i < count; i++) dates.push(addDays(startKey, i));
  return dates;
}

async function fetchAvailabilitiesForDate(itemId, date) {
  const url = `https://fareharbor.com/api/v1/companies/${SHORTNAME}/items/${itemId}/availabilities/date/${date}/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FareHarbor ${itemId} ${date}: ${res.status}`);
  }
  const data = await res.json();
  return (data.availabilities ?? []).map((a) => ({
    itemId,
    date,
    pk: a.pk,
    startAt: a.start_at,
    endAt: a.end_at,
    isBookable: Boolean(a.is_bookable),
  }));
}

async function mapPool(items, mapper, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  const origin = todayKeyNz();
  const dates = dateRange(origin, HORIZON_DAYS);
  const jobs = ITEM_IDS.flatMap((itemId) => dates.map((date) => ({ itemId, date })));

  console.log(`fetch-fareharbor-availabilities: ${jobs.length} item/date pairs from ${origin}`);

  const chunks = await mapPool(
    jobs,
    async ({ itemId, date }) => {
      try {
        const rows = await fetchAvailabilitiesForDate(itemId, date);
        const bookable = rows.filter((a) => a.isBookable);
        let status = 'none';
        if (bookable.length) status = 'bookable';
        else if (rows.length) status = 'full';

        const dateStatus = { itemId, date, status };
        if (bookable.length === 1) dateStatus.pk = bookable[0].pk;
        else if (bookable.length > 1) dateStatus.pk = bookable[0].pk;

        return { rows, dateStatus };
      } catch (err) {
        console.warn(`  skip ${itemId} ${date}: ${err.message}`);
        return { rows: [], dateStatus: null };
      }
    },
    CONCURRENCY,
  );

  const allRows = chunks.flatMap((chunk) => chunk.rows);
  const availabilities = allRows.filter((a) => a.isBookable);
  const dateStatuses = chunks.map((chunk) => chunk.dateStatus).filter(Boolean);
  const outDir = join(ROOT, 'public', 'data');
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, 'fareharbor-availabilities.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        horizonDays: HORIZON_DAYS,
        origin,
        itemIds: ITEM_IDS,
        availabilities,
        dateStatuses,
      },
      null,
      2,
    ),
  );

  const statusCounts = dateStatuses.reduce(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] ?? 0) + 1;
      return acc;
    },
    {},
  );
  console.log(
    `Wrote ${availabilities.length} bookable availabilities and ${dateStatuses.length} date statuses`,
    statusCounts,
    'to public/data/fareharbor-availabilities.json',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
