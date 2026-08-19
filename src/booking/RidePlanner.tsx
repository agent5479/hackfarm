import { useEffect, useState } from 'react';
import {
  RIDE_TYPES,
  buildWindows,
  fetchForecast,
  fetchTides,
  formatDay,
  getRideType,
  type DayWeather,
  type RideWindow,
  type TideExtreme,
} from '../booking';
import { PLANNER_DAYS } from '../booking/location';
import './RidePlanner.css';

interface RidePlannerProps {
  onContinue: (opts: { itemId?: string; date?: string }) => void;
}

export default function RidePlanner({ onContinue }: RidePlannerProps) {
  const [rideId, setRideId] = useState(RIDE_TYPES[0].id);
  const [forecast, setForecast] = useState<DayWeather[]>([]);
  const [tides, setTides] = useState<TideExtreme[]>([]);
  const [windows, setWindows] = useState<RideWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tideNote, setTideNote] = useState('');

  const ride = getRideType(rideId);

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
        if (!cancelled) setError('Could not load weather just now. You can still continue to booking.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!forecast.length) {
      setWindows([]);
      return;
    }
    setWindows(buildWindows(ride, forecast, tides));
  }, [ride, forecast, tides]);

  return (
    <div className="ride-planner">
      <p className="ride-planner__lead">
        First, see which days look rideable at Paton’s Rock from sunrise, tide, and weather. Then pick a window and continue to live booking.
      </p>

      <label className="ride-planner__field">
        Ride type
        <select value={rideId} onChange={(e) => setRideId(e.target.value)}>
          {RIDE_TYPES.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <p className="ride-planner__hint">{ride.hint}</p>

      {loading && <p className="ride-planner__status">Checking the next {PLANNER_DAYS} days…</p>}
      {error && <p className="ride-planner__status ride-planner__status--warn">{error}</p>}
      {tideNote && !loading && <p className="ride-planner__status ride-planner__status--warn">{tideNote}</p>}

      <ul className="ride-planner__days">
        {windows.map((w) => (
          <li key={w.date}>
            <button
              type="button"
              className={`ride-planner__day ride-planner__day--${w.status}`}
              onClick={() => onContinue({ itemId: ride.fareharborItemId, date: w.date })}
            >
              <span className="ride-planner__when">{formatDay(w.start)}</span>
              <span className="ride-planner__summary">{w.summary}</span>
              <span className="ride-planner__why">{w.reasons.slice(0, 3).join(' · ')}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="ride-planner__skip" onClick={() => onContinue({ itemId: ride.fareharborItemId })}>
        Skip — see all dates
      </button>
    </div>
  );
}
