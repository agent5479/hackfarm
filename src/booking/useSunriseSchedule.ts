import { useEffect, useState } from 'react';
import { PLANNER_DAYS } from './location';
import { startOfWeekMonday } from './schedule';
import { fetchForecast, type DayWeather } from './weather';
import { fetchTides, type TideExtreme } from './tides';

export function useSunriseSchedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [forecast, setForecast] = useState<DayWeather[]>([]);
  const [tides, setTides] = useState<TideExtreme[]>([]);
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
        const [wx, tideRows] = await Promise.all([fetchForecast(), fetchTides(start, end)]);
        if (cancelled) return;
        setForecast(wx);
        setTides(tideRows);
        setTideNote(tideRows.length ? '' : 'Tide times are approximate until a NIWA key is added.');
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

  const shiftWeek = (delta: number) => {
    setWeekStart((current) => {
      const d = new Date(`${current}T12:00:00`);
      d.setDate(d.getDate() + delta * 7);
      return startOfWeekMonday(d);
    });
  };

  return {
    weekStart,
    setWeekStart,
    shiftWeek,
    forecast,
    tides,
    loading,
    error,
    tideNote,
  };
}
