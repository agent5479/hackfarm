import { useEffect, useState } from 'react';
import { PLANNER_DAYS } from './location';
import { maxHorizonWindowStart, shiftDateKey, todayKeyNz } from './schedule';
import { fetchAllTides, type TideExtreme } from './tides';
import { fetchForecast, type DayWeather } from './weather';

export function useSunriseSchedule() {
  const todayKey = todayKeyNz();
  const [startKey, setStartKey] = useState(todayKey);
  const [forecast, setForecast] = useState<DayWeather[]>([]);
  const [tides, setTides] = useState<TideExtreme[]>([]);
  const [allTides, setAllTides] = useState<TideExtreme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tideNote, setTideNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const [wx, fullTides] = await Promise.all([fetchForecast(), fetchAllTides()]);
        if (cancelled) return;
        setForecast(wx);
        setTides(fullTides);
        setAllTides(fullTides);
        setTideNote(fullTides.length ? '' : 'Tide times are approximate until a NIWA key is added.');
      } catch {
        if (!cancelled) setError('Could not load weather just now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const minStart = todayKey;
  const maxStart = maxHorizonWindowStart(todayKey);

  const shiftWindow = (deltaWeeks: number) => {
    setStartKey((current: string) => {
      const next = shiftDateKey(current, deltaWeeks * 7);
      if (next < minStart) return minStart;
      if (next > maxStart) return maxStart;
      return next;
    });
  };

  return {
    startKey,
    todayKey,
    canPrev: startKey > minStart,
    canNext: startKey < maxStart,
    shiftWindow,
    forecast,
    tides,
    allTides,
    loading,
    error,
    tideNote,
    windowDays: PLANNER_DAYS,
  };
}
