import { withBase } from '../lib/constants';

export interface CachedFareHarborAvailability {
  itemId: string;
  date: string;
  pk: number;
  startAt: string;
  endAt: string;
  isBookable: boolean;
}

interface FareHarborAvailabilityCache {
  generatedAt: string;
  availabilities: CachedFareHarborAvailability[];
}

let cachePromise: Promise<FareHarborAvailabilityCache | null> | null = null;

async function loadCache(): Promise<FareHarborAvailabilityCache | null> {
  if (!cachePromise) {
    cachePromise = (async () => {
      try {
        const res = await fetch(withBase('/data/fareharbor-availabilities.json'));
        if (!res.ok) return null;
        return (await res.json()) as FareHarborAvailabilityCache;
      } catch {
        return null;
      }
    })();
  }
  return cachePromise;
}

function parseRideStartMinutes(rideStart: string): number | undefined {
  const match = rideStart.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const isPm = match[3].toLowerCase() === 'pm';
  if (isPm && hours !== 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function startAtMinutes(startAt: string): number {
  const time = startAt.slice(11, 16);
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function pickAvailability(
  matches: CachedFareHarborAvailability[],
  rideStart?: string,
): CachedFareHarborAvailability | undefined {
  if (!matches.length) return undefined;
  if (matches.length === 1) return matches[0];

  const target = rideStart ? parseRideStartMinutes(rideStart) : undefined;
  if (target == null) return matches[0];

  return matches.reduce((best, current) => {
    const bestDiff = Math.abs(startAtMinutes(best.startAt) - target);
    const currentDiff = Math.abs(startAtMinutes(current.startAt) - target);
    return currentDiff < bestDiff ? current : best;
  });
}

/** Resolve a FareHarbor availability PK from the cached CI snapshot. */
export async function resolveAvailabilityId(
  itemId: string,
  date: string,
  rideStart?: string,
): Promise<number | undefined> {
  const cache = await loadCache();
  if (!cache) return undefined;

  const matches = cache.availabilities.filter(
    (a) => a.itemId === itemId && a.date === date && a.isBookable,
  );
  return pickAvailability(matches, rideStart)?.pk;
}
