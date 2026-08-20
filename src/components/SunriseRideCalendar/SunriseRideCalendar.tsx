import { useMemo, useState } from 'react';
import {
  buildSunriseWeekSchedule,
  detailSummary,
  formatClock,
  formatDayLabel,
  formatWeekRange,
  type SunriseDaySchedule,
} from '../../booking/schedule';
import { SUNRISE_RIDE } from '../../booking/rides';
import { useSunriseSchedule } from '../../booking/useSunriseSchedule';
import DayTimeline from './DayTimeline';
import WeekSummary from './WeekSummary';
import './SunriseRideCalendar.css';

type CalendarMode = 'browse' | 'book';

interface SunriseRideCalendarProps {
  mode?: CalendarMode;
  onSelectDay?: (day: SunriseDaySchedule) => void;
  onContinue?: (day: SunriseDaySchedule) => void;
}

const STATUS_LABEL: Record<SunriseDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SunriseRideCalendar({
  mode = 'browse',
  onSelectDay,
  onContinue,
}: SunriseRideCalendarProps) {
  const { weekStart, shiftWeek, forecast, tides, loading, error, tideNote } = useSunriseSchedule();
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(
    () => buildSunriseWeekSchedule(weekStart, forecast, tides, SUNRISE_RIDE),
    [weekStart, forecast, tides],
  );

  const selectedDay = days.find((d) => d.date === selected);

  const pickDay = (day: SunriseDaySchedule) => {
    if (mode === 'book' && day.status === 'unavailable') return;
    if (mode === 'book' && !day.isRideDay) return;
    setSelected(day.date);
    onSelectDay?.(day);
  };

  return (
    <div className="sunrise-cal">
      <div className="sunrise-cal__nav">
        <button type="button" className="sunrise-cal__nav-btn" onClick={() => shiftWeek(-1)}>
          ← Previous week
        </button>
        <span className="sunrise-cal__range">{formatWeekRange(weekStart)}</span>
        <button type="button" className="sunrise-cal__nav-btn" onClick={() => shiftWeek(1)}>
          Next week →
        </button>
      </div>

      {loading && <p className="sunrise-cal__status">Loading sunrise & tide times…</p>}
      {error && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}
      {tideNote && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

      {!loading && days.length > 0 && <WeekSummary days={days} />}

      <div className="sunrise-cal__grid">
        {days.map((day, i) => {
          const selectable =
            mode === 'browse' ||
            (day.isRideDay && day.status !== 'unavailable');
          const isSelected = selected === day.date;

          return (
            <button
              key={day.date}
              type="button"
              className={[
                'sunrise-cal__day',
                day.isRideDay ? 'sunrise-cal__day--ride' : 'sunrise-cal__day--off',
                `sunrise-cal__day--${day.status}`,
                isSelected ? 'sunrise-cal__day--selected' : '',
                !selectable ? 'sunrise-cal__day--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectable && pickDay(day)}
              disabled={!selectable}
              aria-label={`${formatDayLabel(day.date)}. ${STATUS_LABEL[day.status]}. Ride starts ${formatClock(day.rideStart)}.`}
            >
              <span className="sunrise-cal__weekday">{WEEKDAYS[i]}</span>
              <span className="sunrise-cal__date">{formatDayLabel(day.date).replace(/^(\w+), /, '')}</span>
              <DayTimeline day={day} tides={tides} />
              <span className={`sunrise-cal__pill sunrise-cal__pill--${day.status}`}>
                {!day.isRideDay ? 'Not scheduled' : STATUS_LABEL[day.status]}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="sunrise-cal__detail">
          <p className="sunrise-cal__detail-text">{detailSummary(selectedDay)}</p>
          <ul className="sunrise-cal__detail-reasons">
            {selectedDay.statusReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {mode === 'book' && selectedDay.status !== 'unavailable' && (
            <button
              type="button"
              className="btn btn--green sunrise-cal__continue"
              onClick={() => onContinue?.(selectedDay)}
            >
              Continue to booking
            </button>
          )}
        </div>
      )}

      <p className="sunrise-cal__footnote">
        Sunrise rides run Wed, Fri & Sun · start 1 hour before sunrise · beach access needs 3h+ before high tide or 2h+ after.
        {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
      </p>
    </div>
  );
}
