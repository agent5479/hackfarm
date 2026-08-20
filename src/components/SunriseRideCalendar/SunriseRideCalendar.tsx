import { useMemo, useState } from 'react';
import {
  buildSunriseHorizonSchedule,
  dayOfMonth,
  detailSummary,
  formatClock,
  formatHorizonRange,
  rollingHorizonDates,
  shortMonth,
  startOfWeekMonday,
  type SunriseDaySchedule,
} from '../../booking/schedule';
import { nzNoon } from '../../booking/nzTime';
import { PLANNER_DAYS } from '../../booking/location';
import { SUNRISE_RIDE } from '../../booking/rides';
import { useSunriseSchedule } from '../../booking/useSunriseSchedule';
import DayCell from './DayCell';
import HorizonSummary from './HorizonSummary';
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

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RIDE_COLUMNS = [3, 5, 0] as const;
const RIDE_COLUMN_LABELS = ['Wednesday', 'Friday', 'Sunday'];

export default function SunriseRideCalendar({
  mode = 'browse',
  onSelectDay,
  onContinue,
  onBookDay,
}: SunriseRideCalendarProps) {
  const { startKey, todayKey, canPrev, canNext, shiftWindow, forecast, tides, allTides, loading, error, tideNote } =
    useSunriseSchedule();
  const [selected, setSelected] = useState<string | null>(null);

  const dates = useMemo(() => rollingHorizonDates(startKey, PLANNER_DAYS), [startKey]);

  const scheduleMap = useMemo(
    () => buildSunriseHorizonSchedule(startKey, forecast, tides, SUNRISE_RIDE, allTides),
    [startKey, forecast, tides, allTides],
  );

  const rideDays = useMemo(
    () => dates.map((dateKey) => scheduleMap.get(dateKey)!).filter((day) => day.isRideDay),
    [dates, scheduleMap],
  );

  const rideWeeks = useMemo(() => {
    const weeks = new Map<string, SunriseDaySchedule[]>();
    for (const day of rideDays) {
      const week = startOfWeekMonday(nzNoon(day.date));
      const list = weeks.get(week) ?? [];
      list.push(day);
      weeks.set(week, list);
    }
    return [...weeks.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, days]) => RIDE_COLUMNS.map((wd) => days.find((d) => d.weekday === wd) ?? null));
  }, [rideDays]);

  const horizonDays = rideDays;
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
        <button
          type="button"
          className="sunrise-cal__nav-btn"
          onClick={() => shiftWindow(-4)}
          disabled={!canPrev}
        >
          ← Previous 4 weeks
        </button>
        <span className="sunrise-cal__range">{formatHorizonRange(startKey)}</span>
        <button
          type="button"
          className="sunrise-cal__nav-btn"
          onClick={() => shiftWindow(4)}
          disabled={!canNext}
        >
          Next 4 weeks →
        </button>
      </div>

      {loading && <p className="sunrise-cal__status">Loading sunrise & tide times…</p>}
      {error && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}
      {tideNote && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

      {!loading && horizonDays.length > 0 && <HorizonSummary days={horizonDays} />}

      <p className="sunrise-cal__days-note">
        Regular sunrise rides run <strong>Wednesday, Friday &amp; Sunday</strong> only.
        Other weekdays are by special arrangement — ask us if you need a private session.
      </p>

      <div className="sunrise-cal__weekdays sunrise-cal__weekdays--rides" aria-hidden="true">
        {RIDE_COLUMN_LABELS.map((label) => (
          <span key={label} className="sunrise-cal__weekday-head">
            {label}
          </span>
        ))}
      </div>

      <div className="sunrise-cal__grid sunrise-cal__grid--rides">
        {rideWeeks.flatMap((week, weekIndex) =>
          week.map((day, colIndex) => {
            if (!day) {
              return (
                <div
                  key={`empty-${weekIndex}-${colIndex}`}
                  className="sunrise-cal__day sunrise-cal__day--empty"
                  aria-hidden="true"
                />
              );
            }

            const selectable =
              mode === 'browse' ||
              (day.status !== 'unavailable' && day.hasScheduleData);
            const isSelected = selected === day.date;
            const bookable = mode === 'intercept' && selectable;
            const isToday = day.date === todayKey;

            return (
              <button
                key={day.date}
                type="button"
                className={[
                  'sunrise-cal__day',
                  'sunrise-cal__day--ride',
                  `sunrise-cal__day--${day.status}`,
                  isSelected ? 'sunrise-cal__day--selected' : '',
                  !selectable ? 'sunrise-cal__day--disabled' : '',
                  bookable ? 'sunrise-cal__day--bookable' : '',
                  day.tideBlocked ? 'sunrise-cal__day--tide-block' : '',
                  isToday ? 'sunrise-cal__day--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pickDay(day)}
                disabled={mode !== 'browse' && !selectable}
                aria-label={`${WEEKDAY_LONG[day.weekday]} ${day.date}. ${STATUS_LABEL[day.status]}. Arrive by ${formatClock(day.rideStart)}.`}
              >
                <span className="sunrise-cal__weekday-tag">{WEEKDAY_LONG[day.weekday]}</span>
                <span className="sunrise-cal__date-num">
                  {dayOfMonth(day.date)}
                  <span className="sunrise-cal__date-month">{shortMonth(day.date)}</span>
                </span>

                <DayCell day={day} />

                {day.hasScheduleData && (
                  <span className={`sunrise-cal__pill sunrise-cal__pill--${day.status}`}>
                    {STATUS_LABEL[day.status]}
                  </span>
                )}
              </button>
            );
          }),
        )}
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
        Regular sunrise rides: Wednesday, Friday &amp; Sunday · arrive 1 hour before sunrise · wave height
        shows tide level. Other days by special arrangement.
        {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
        {mode === 'intercept' && ' Click a rideable day to book the Sunrise/Sunset Twilight Ride.'}
      </p>
      <p className="sunrise-cal__legend">
        Wave height = tide at ride time · arrows show incoming (up) or outgoing (down) · blue overlay = high
        tide block · corner icon = weather (7-day forecast)
      </p>
    </div>
  );
}
