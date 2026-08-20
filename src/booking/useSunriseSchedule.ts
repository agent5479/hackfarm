import { useEffect, useState } from 'react';
import { PLANNER_DAYS } from './location';
import { monthKeyFromDate, startOfMonth } from './schedule';
import { fetchAllTides, fetchTides, type TideExtreme } from './tides';
import { fetchForecast, type DayWeather } from './weather';

export function useSunriseSchedule() {
  const [monthKey, setMonthKey] = useState(() => monthKeyFromDate(new Date()));
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
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + PLANNER_DAYS);
        const [wx, tideRows, fullTides] = await Promise.all([
          fetchForecast(),
          fetchTides(start, end),
          fetchAllTides(),
        ]);
        if (cancelled) return;
        setForecast(wx);
        setTides(tideRows);
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

  const shiftMonth = (delta: number) => {
    setMonthKey((current) => {
      const [y, m] = current.split('-').map(Number);
      const d = new Date(y, m - 1 + delta, 1);
      return monthKeyFromDate(d);
    });
  };

  return {
    monthKey,
    setMonthKey,
    shiftMonth,
    forecast,
    tides,
    allTides,
    loading,
    error,
    tideNote,
    // legacy aliases for any remaining week consumers
    weekStart: startOfMonth(new Date(`${monthKey}-15T12:00:00`)),
    shiftWeek: (delta: number) => shiftMonth(delta > 0 ? 1 : -1),
  };
}
