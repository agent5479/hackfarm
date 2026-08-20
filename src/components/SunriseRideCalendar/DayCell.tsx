import { formatClock, type SunriseDaySchedule } from '../../booking/schedule';
import { weatherIcon } from '../../booking/weather';

const TIDE_MAX_M = 4.2;

function tideFillPct(height: number | undefined, blocked: boolean): number {
  if (blocked) return 0.92;
  if (height == null) return 0.38;
  return Math.min(0.86, Math.max(0.18, height / TIDE_MAX_M));
}

interface DayCellProps {
  day: SunriseDaySchedule;
}

export default function DayCell({ day }: DayCellProps) {
  const showWeather =
    day.weatherAffectsStatus &&
    day.weatherCode != null &&
    (day.weatherBlocked || day.weatherCaution);

  if (!day.isRideDay) {
    return null;
  }

  if (!day.hasScheduleData) {
    return (
      <div className="day-cell day-cell--pending">
        <p className="day-cell__pending">Tide times updating</p>
      </div>
    );
  }

  const fillPct = tideFillPct(day.tideHeightAtRide, Boolean(day.tideBlocked));
  const clipId = `tide-wave-${day.date}`;
  const flow = day.tideFlow;
  const flowLabel = flow === 'incoming' ? 'Incoming' : flow === 'outgoing' ? 'Outgoing' : undefined;

  return (
    <div
      className={[
        'day-cell',
        day.tideBlocked ? 'day-cell--blocked' : '',
        flow === 'incoming' ? 'day-cell--incoming' : '',
        flow === 'outgoing' ? 'day-cell--outgoing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--tide-fill' as string]: `${fillPct * 100}%` }}
    >
      {showWeather && (
        <span
          className={`day-cell__weather${day.weatherBlocked ? ' day-cell__weather--block' : ''}`}
          title={day.weatherLabel}
        >
          {weatherIcon(day.weatherCode!)}
        </span>
      )}

      <div className="day-cell__gauge" aria-hidden="true">
        <div className="day-cell__water">
          <svg className="day-cell__surface" viewBox="0 0 120 14" preserveAspectRatio="none">
            <defs>
              <linearGradient id={clipId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ec8ea" />
                <stop offset="100%" stopColor="#2b7cb5" />
              </linearGradient>
            </defs>
            <path
              d="M0 8 C 10 2, 20 2, 30 8 S 50 14, 60 8 S 90 2, 90 8 S 110 14, 120 8 V 14 H 0 Z"
              fill={`url(#${clipId})`}
            />
          </svg>
          {flow && (
            <div className="day-cell__chevrons">
              <span className="day-cell__chevron" />
              <span className="day-cell__chevron" />
              <span className="day-cell__chevron" />
            </div>
          )}
        </div>
        {day.tideBlocked && (
          <div className="day-cell__tide-overlay">
            <span>High tide</span>
          </div>
        )}
      </div>

      <div className="day-cell__times">
        <p className="day-cell__arrive">
          <span className="day-cell__label">Arrive by</span>
          <strong>{formatClock(day.rideStart)}</strong>
        </p>
        <p className="day-cell__sunrise">
          <span className="day-cell__label">Sunrise</span>
          <span>{formatClock(day.sunrise)}</span>
        </p>
        {flowLabel && (
          <p className="day-cell__flow">
            <span className="day-cell__label">Tide</span>
            <strong>{flowLabel}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
