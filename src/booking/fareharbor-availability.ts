import { useEffect, useState } from 'react';
import { withBase } from '../lib/constants';

export interface CachedFareHarborAvailability {
  itemId: string;
  date: string;
  pk: number;
  startAt: string;
  endAt: string;
  isBookable: boolean;
}

export type FareHarborDateStatus = 'bookable' | 'full' | 'none' | 'unknown';

export interface CachedFareHarborDateStatus {
  itemId: string;
  date: string;
  status: Exclude<FareHarborDateStatus, 'unknown'>;
  pk?: number;
}

export interface FareHarborAvailabilityCache {
  generatedAt: string;
  horizonDays?: number;
  origin?: string;
  availabilities: CachedFareHarborAvailability[];
  dateStatuses?: CachedFareHarborDateStatus[];
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

export function getDateBookingStatus(
  itemId: string,
  date: string,
  cache: FareHarborAvailabilityCache | null,
): FareHarborDateStatus {
  if (!cache?.dateStatuses?.length) return 'unknown';
  const match = cache.dateStatuses.find((entry) => entry.itemId === itemId && entry.date === date);
  return match?.status ?? 'unknown';
}

export function buildDateStatusMap(
  itemId: string,
  cache: FareHarborAvailabilityCache | null,
): Map<string, FareHarborDateStatus> {
  const map = new Map<string, FareHarborDateStatus>();
  if (!cache?.dateStatuses?.length) return map;
  for (const entry of cache.dateStatuses) {
    if (entry.itemId === itemId) map.set(entry.date, entry.status);
  }
  return map;
}

export function useFareHarborDateStatuses(itemId: string) {
  const [statuses, setStatuses] = useState<Map<string, FareHarborDateStatus>>(new Map());
  const [loading, setLoading] = useState(Boolean(itemId));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!itemId) {
      setStatuses(new Map());
      setReady(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    (async () => {
      const cache = await loadCache();
      if (cancelled) return;
      if (cache?.dateStatuses?.length) {
        setStatuses(buildDateStatusMap(itemId, cache));
        setReady(true);
      } else {
        setStatuses(new Map());
        setReady(false);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return { statuses, loading, ready };
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
