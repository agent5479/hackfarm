import { forbiddenZones, formatClock, type SunriseDaySchedule } from '../../booking/schedule';
import type { TideExtreme } from '../../booking/tides';

const TIMELINE_START_H = 4;
const TIMELINE_END_H = 10;
const TIMELINE_MS = (TIMELINE_END_H - TIMELINE_START_H) * 3_600_000;

function pctInTimeline(instant: Date, day: SunriseDaySchedule): number {
  const dayStart = new Date(`${day.date}T${String(TIMELINE_START_H).padStart(2, '0')}:00:00`);
  const t = instant.getTime() - dayStart.getTime();
  return Math.min(100, Math.max(0, (t / TIMELINE_MS) * 100));
}

interface DayTimelineProps {
  day: SunriseDaySchedule;
  tides: TideExtreme[];
}

export default function DayTimeline({ day, tides }: DayTimelineProps) {
  if (!day.isRideDay) {
    return (
      <div className="day-timeline day-timeline--off" aria-hidden="true">
        <span className="day-timeline__off-label">No sunrise ride</span>
      </div>
    );
  }

  const sunrisePct = pctInTimeline(day.sunrise, day);
  const rideStartPct = pctInTimeline(day.rideStart, day);
  const rideEndPct = pctInTimeline(day.rideEnd, day);
  const rideWidth = Math.max(4, rideEndPct - rideStartPct);

  const highs = tides.filter((t) => t.type === 'high');
  const zones = forbiddenZones(highs);

  return (
    <div
      className="day-timeline"
      role="img"
      aria-label={`Sunrise ${formatClock(day.sunrise)}, ride starts ${formatClock(day.rideStart)}`}
    >
      <div className="day-timeline__track">
        <div className="day-timeline__sky" style={{ width: `${sunrisePct + 8}%` }} />
        {zones.map((zone) => {
          const left = pctInTimeline(zone.start, day);
          const right = pctInTimeline(zone.end, day);
          if (right <= 0 || left >= 100) return null;
          return (
            <div
              key={zone.high.toISOString()}
              className="day-timeline__forbidden"
              style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
            />
          );
        })}
        <div
          className="day-timeline__ride"
          style={{ left: `${rideStartPct}%`, width: `${rideWidth}%` }}
          title={`Ride ${formatClock(day.rideStart)}–${formatClock(day.rideEnd)}`}
        />
        <span className="day-timeline__sun" style={{ left: `${sunrisePct}%` }} title={`Sunrise ${formatClock(day.sunrise)}`}>
          ☀
        </span>
        {day.nearestHigh && (
          <span
            className="day-timeline__high"
            style={{ left: `${pctInTimeline(day.nearestHigh, day)}%` }}
            title={`High tide ${formatClock(day.nearestHigh)}`}
          >
            ▲
          </span>
        )}
      </div>
      <div className="day-timeline__labels">
        <span>{formatClock(day.rideStart)}</span>
        <span>☀ {formatClock(day.sunrise)}</span>
      </div>
    </div>
  );
}
