import { useMemo, useState } from 'react';
import {
  buildSunriseMonthSchedule,
  dayOfMonth,
  detailSummary,
  formatClock,
  formatMonthTitle,
  monthGridDates,
  type SunriseDaySchedule,
} from '../../booking/schedule';
import { SUNRISE_RIDE } from '../../booking/rides';
import { useSunriseSchedule } from '../../booking/useSunriseSchedule';
import DayCell from './DayCell';
import MonthSummary from './MonthSummary';
import './SunriseRideCalendar.css';

type CalendarMode = 'browse' | 'book' | 'intercept';

interface SunriseRideCalendarProps {
  mode?: CalendarMode;
  onSelectDay?: (day: SunriseDaySchedule) => void;
  onContinue?: (day: SunriseDaySchedule) => void;
  onBookDay?: (day: SunriseDaySchedule) => void;
}

const STATUS_LABEL: Record<SunriseDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SunriseRideCalendar({
  mode = 'browse',
  onSelectDay,
  onContinue,
  onBookDay,
}: SunriseRideCalendarProps) {
  const { monthKey, shiftMonth, forecast, tides, allTides, loading, error, tideNote } =
    useSunriseSchedule();
  const [selected, setSelected] = useState<string | null>(null);

  const gridCells = useMemo(() => monthGridDates(monthKey), [monthKey]);

  const scheduleMap = useMemo(
    () => buildSunriseMonthSchedule(monthKey, forecast, tides, SUNRISE_RIDE, allTides),
    [monthKey, forecast, tides, allTides],
  );

  const monthDays = useMemo(() => Array.from(scheduleMap.values()), [scheduleMap]);

  const selectedDay = selected ? scheduleMap.get(selected) : undefined;

  const pickDay = (day: SunriseDaySchedule) => {
    if ((mode === 'book' || mode === 'intercept') && day.status === 'unavailable') return;
    if ((mode === 'book' || mode === 'intercept') && !day.isRideDay) return;
    if ((mode === 'book' || mode === 'intercept') && !day.hasScheduleData) return;
    setSelected(day.date);
    onSelectDay?.(day);
    if (mode === 'intercept' && day.isRideDay && day.status !== 'unavailable' && day.hasScheduleData) {
      onBookDay?.(day);
    }
  };

  return (
    <div className={`sunrise-cal${mode === 'intercept' ? ' sunrise-cal--intercept' : ''}`}>
      <div className="sunrise-cal__nav">
        <button type="button" className="sunrise-cal__nav-btn" onClick={() => shiftMonth(-1)}>
          ← Previous month
        </button>
        <span className="sunrise-cal__range">{formatMonthTitle(monthKey)}</span>
        <button type="button" className="sunrise-cal__nav-btn" onClick={() => shiftMonth(1)}>
          Next month →
        </button>
      </div>

      {loading && <p className="sunrise-cal__status">Loading sunrise & tide times…</p>}
      {error && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}
      {tideNote && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

      {!loading && monthDays.length > 0 && (
        <MonthSummary days={monthDays} monthKey={monthKey} />
      )}

      <div className="sunrise-cal__weekdays">
        {WEEKDAY_HEADERS.map((d) => (
          <span key={d} className="sunrise-cal__weekday-head">
            {d}
          </span>
        ))}
      </div>

      <div className="sunrise-cal__grid sunrise-cal__grid--month">
        {gridCells.map((cell) => {
          const day = scheduleMap.get(cell.date)!;
          const selectable =
            mode === 'browse' ||
            (day.isRideDay && day.status !== 'unavailable' && day.hasScheduleData);
          const isSelected = selected === day.date;
          const bookable = mode === 'intercept' && selectable && day.isRideDay;

          return (
            <button
              key={cell.date}
              type="button"
              className={[
                'sunrise-cal__day',
                !cell.inMonth ? 'sunrise-cal__day--outside' : '',
                day.isRideDay ? 'sunrise-cal__day--ride' : 'sunrise-cal__day--off',
                `sunrise-cal__day--${day.status}`,
                isSelected ? 'sunrise-cal__day--selected' : '',
                !selectable && day.isRideDay ? 'sunrise-cal__day--disabled' : '',
                bookable ? 'sunrise-cal__day--bookable' : '',
                day.tideBlocked ? 'sunrise-cal__day--tide-block' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => (cell.inMonth && (mode === 'browse' || day.isRideDay) && pickDay(day))}
              disabled={cell.inMonth && day.isRideDay && mode !== 'browse' && !selectable}
              aria-label={
                day.isRideDay
                  ? `${day.date}. ${STATUS_LABEL[day.status]}. Arrive by ${formatClock(day.rideStart)}.`
                  : `${day.date}. Not scheduled.`
              }
            >
              <span className="sunrise-cal__date-num">{dayOfMonth(cell.date)}</span>

              {cell.inMonth && day.isRideDay && <DayCell day={day} />}

              {cell.inMonth && day.isRideDay && day.hasScheduleData && (
                <span className={`sunrise-cal__pill sunrise-cal__pill--${day.status}`}>
                  {STATUS_LABEL[day.status]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && selectedDay.isRideDay && (
        <div className="sunrise-cal__detail">
          <p className="sunrise-cal__detail-text">{detailSummary(selectedDay)}</p>
          <ul className="sunrise-cal__detail-reasons">
            {selectedDay.statusReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {mode === 'intercept' &&
            selectedDay.isRideDay &&
            selectedDay.status !== 'unavailable' &&
            selectedDay.hasScheduleData && (
              <p className="sunrise-cal__book-hint">
                Click this day again to open booking for the Sunrise/Sunset Twilight Ride.
              </p>
            )}
          {mode === 'book' && selectedDay.status !== 'unavailable' && selectedDay.hasScheduleData && (
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
        Sunrise rides Wed, Fri & Sun · arrive 1 hour before sunrise · wave height shows tide level.
        {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
        {mode === 'intercept' && ' Click a rideable day to book the Sunrise/Sunset Twilight Ride.'}
      </p>
      <p className="sunrise-cal__legend">
        Wave height = tide at ride time · blue overlay = high tide block · corner icon = weather (7-day
        forecast)
      </p>
    </div>
  );
}
