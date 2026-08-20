import { formatClock, type SunriseDaySchedule } from '../../booking/schedule';
import { weatherIcon } from '../../booking/weather';

const TIDE_MAX_M = 4.2;

function tideFillPct(height: number | undefined): number {
  if (height == null) return 0.35;
  return Math.min(0.95, Math.max(0.12, height / TIDE_MAX_M));
}

function wavePath(width: number, height: number, amplitude: number): string {
  const mid = height * 0.55;
  return `M 0 ${mid}
    Q ${width * 0.25} ${mid - amplitude} ${width * 0.5} ${mid}
    T ${width} ${mid}
    L ${width} ${height} L 0 ${height} Z`;
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
        <p className="day-cell__pending">Schedule closer to date</p>
      </div>
    );
  }

  const fillPct = tideFillPct(day.tideHeightAtRide);
  const w = 100;
  const h = 56;
  const amp = 6;
  const clipH = h * fillPct;

  return (
    <div className="day-cell">
      {showWeather && (
        <span
          className={`day-cell__weather${day.weatherBlocked ? ' day-cell__weather--block' : ''}`}
          title={day.weatherLabel}
        >
          {weatherIcon(day.weatherCode!)}
        </span>
      )}

      <div className="day-cell__wave-wrap">
        <svg
          className="day-cell__wave"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`wave-clip-${day.date}`}>
              <rect x="0" y={h - clipH} width={w} height={clipH} />
            </clipPath>
            <linearGradient id={`wave-grad-${day.date}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#1a6bb5" />
              <stop offset="100%" stopColor="#5eb8e8" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={w} height={h} fill="#eef4fa" rx="4" />
          <path
            d={wavePath(w, h, amp)}
            fill={`url(#wave-grad-${day.date})`}
            clipPath={`url(#wave-clip-${day.date})`}
          />
          <path
            d={`M 0 ${h * 0.55} Q ${w * 0.25} ${h * 0.55 - amp} ${w * 0.5} ${h * 0.55} T ${w} ${h * 0.55}`}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.5"
            clipPath={`url(#wave-clip-${day.date})`}
          />
        </svg>

        {day.tideBlocked && (
          <div className="day-cell__tide-overlay">
            <span>High tide</span>
          </div>
        )}
      </div>

      <div className="day-cell__times">
        <p className="day-cell__arrive">
          <span className="day-cell__label">Arrive by</span>{' '}
          <strong>{formatClock(day.rideStart)}</strong>
        </p>
        <p className="day-cell__sunrise">
          <span className="day-cell__label">Sunrise</span> {formatClock(day.sunrise)}
        </p>
      </div>
    </div>
  );
}
