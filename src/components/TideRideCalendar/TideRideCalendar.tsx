import { useMemo, useState } from 'react';
import {
  buildTideHorizonSchedule,
  dayOfMonth,
  formatClock,
  formatHorizonRange,
  formatMonthTitle,
  rollingHorizonDates,
  shortMonth,
  startOfWeekMonday,
  tideDetailSummary,
  tideHorizonSummary,
  type TideDaySchedule,
} from '../../booking/schedule';
import { nzNoon } from '../../booking/nzTime';
import { PLANNER_DAYS } from '../../booking/location';
import type { RideType } from '../../booking/rides';
import { useSunriseSchedule } from '../../booking/useSunriseSchedule';
import DayCell from '../SunriseRideCalendar/DayCell';
import TideCalendarLoading from '../TideCalendarLoading/TideCalendarLoading';
import '../SunriseRideCalendar/SunriseRideCalendar.css';

type CalendarMode = 'browse' | 'book' | 'intercept';

export interface BookTideDayPayload {
  day: TideDaySchedule;
}

interface TideRideCalendarProps {
  ride: RideType;
  mode?: CalendarMode;
  onSelectDay?: (day: TideDaySchedule) => void;
  onContinue?: (day: TideDaySchedule) => void;
  onBookDay?: (payload: BookTideDayPayload) => void;
}

interface MonthGroup {
  monthKey: string;
  title: string;
  weeks: (TideDaySchedule | null)[][];
}

const STATUS_LABEL: Record<TideDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_COLUMNS = [1, 2, 3, 4, 5, 6, 0] as const;
const WEEK_COLUMN_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function groupDaysByMonth(days: TideDaySchedule[]): MonthGroup[] {
  const byMonth = new Map<string, TideDaySchedule[]>();
  for (const day of days) {
    const monthKey = day.date.slice(0, 7);
    const list = byMonth.get(monthKey) ?? [];
    list.push(day);
    byMonth.set(monthKey, list);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthDays]) => {
      const weeks = new Map<string, TideDaySchedule[]>();
      for (const day of monthDays) {
        const week = startOfWeekMonday(nzNoon(day.date));
        const list = weeks.get(week) ?? [];
        list.push(day);
        weeks.set(week, list);
      }

      return {
        monthKey,
        title: formatMonthTitle(monthKey),
        weeks: [...weeks.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, weekDays]) =>
            WEEK_COLUMNS.map((wd) => weekDays.find((d) => d.weekday === wd) ?? null),
          ),
      };
    });
}

export default function TideRideCalendar({
  ride,
  mode = 'browse',
  onSelectDay,
  onContinue,
  onBookDay,
}: TideRideCalendarProps) {
  const { startKey, todayKey, canPrev, canNext, shiftWindow, forecast, tides, allTides, loading, error, tideNote } =
    useSunriseSchedule();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const dates = useMemo(() => rollingHorizonDates(startKey, PLANNER_DAYS), [startKey]);

  const scheduleMap = useMemo(
    () => buildTideHorizonSchedule(startKey, forecast, tides, ride, allTides),
    [startKey, forecast, tides, allTides, ride],
  );

  const horizonDays = useMemo(
    () => dates.map((dateKey) => scheduleMap.get(dateKey)!),
    [dates, scheduleMap],
  );

  const months = useMemo(() => groupDaysByMonth(horizonDays), [horizonDays]);
  const selected = selectedKey ? scheduleMap.get(selectedKey) : undefined;

  const tideNoun = ride.tideMode === 'require-high' ? 'high' : 'low';
  const windowLabel =
    ride.tideBeforeHours != null && ride.tideAfterHours != null
      ? `±${ride.tideBeforeHours}h`
      : 'tide window';

  const pickDay = (day: TideDaySchedule) => {
    if ((mode === 'book' || mode === 'intercept') && day.status === 'unavailable') return;
    if ((mode === 'book' || mode === 'intercept') && !day.isRideDay) return;
    if ((mode === 'book' || mode === 'intercept') && !day.hasScheduleData) return;
    setSelectedKey(day.date);
    onSelectDay?.(day);
    if (
      mode === 'intercept' &&
      day.isRideDay &&
      day.status !== 'unavailable' &&
      day.hasScheduleData
    ) {
      onBookDay?.({ day });
    }
  };

  return (
    <div className={`sunrise-cal sunrise-cal--tide${mode === 'intercept' ? ' sunrise-cal--intercept' : ''}`}>
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

      {error && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}

      <div className="sunrise-cal__body">
        {loading && <TideCalendarLoading message="Checking tide times…" />}

        {!loading && (
          <>
            {tideNote && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

            {horizonDays.length > 0 && (
              <p className="sunrise-cal__summary">{tideHorizonSummary(horizonDays)}</p>
            )}

            <p className="sunrise-cal__days-note">
              <strong>{ride.name}</strong>: not Fridays · entire ride inside {tideNoun} tide {windowLabel} ·
              daylight only · must not overlap sunrise slots. Green border = bookable; faded = do
              not book.
            </p>

            <div className="sunrise-cal__months">
        {months.map((month) => (
          <section
            key={month.monthKey}
            className="sunrise-cal__month"
            aria-labelledby={`tide-cal-month-${ride.id}-${month.monthKey}`}
          >
            <h4
              id={`tide-cal-month-${ride.id}-${month.monthKey}`}
              className="sunrise-cal__month-title"
            >
              {month.title}
            </h4>

            <div className="sunrise-cal__weekdays sunrise-cal__weekdays--full" aria-hidden="true">
              {WEEK_COLUMN_LABELS.map((label) => (
                <span key={label} className="sunrise-cal__weekday-head">
                  {label}
                </span>
              ))}
            </div>

            <div className="sunrise-cal__grid sunrise-cal__grid--full">
              {month.weeks.flatMap((week, weekIndex) =>
                week.map((day, colIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${month.monthKey}-${weekIndex}-${colIndex}`}
                        className="sunrise-cal__day sunrise-cal__day--empty"
                        aria-hidden="true"
                      />
                    );
                  }

                  const isToday = day.date === todayKey;
                  const selectable =
                    mode === 'browse' ||
                    (day.isRideDay &&
                      day.status !== 'unavailable' &&
                      Boolean(day.hasScheduleData));
                  const isSelected = selectedKey === day.date;
                  const bookable = mode === 'intercept' && selectable;

                  return (
                    <button
                      key={day.date}
                      type="button"
                      className={[
                        'sunrise-cal__day',
                        'sunrise-cal__day--ride',
                        'sunrise-cal__day--tide',
                        `sunrise-cal__day--${day.status}`,
                        isToday ? 'sunrise-cal__day--today' : '',
                        isSelected ? 'sunrise-cal__day--selected' : '',
                        !selectable ? 'sunrise-cal__day--disabled' : '',
                        bookable ? 'sunrise-cal__day--bookable' : '',
                        day.tideBlocked ? 'sunrise-cal__day--tide-block' : '',
                        !day.isRideDay ? 'sunrise-cal__day--off' : '',
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

                      {day.isRideDay ? (
                        <>
                          <DayCell day={day} compact />
                          {day.hasScheduleData && (
                            <span className={`sunrise-cal__pill sunrise-cal__pill--${day.status}`}>
                              {STATUS_LABEL[day.status]}
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="sunrise-cal__off-note">Not Fridays</p>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </section>
        ))}
            </div>

            {selected && selected.isRideDay && (
              <div className="sunrise-cal__detail">
                <p className="sunrise-cal__detail-text">{tideDetailSummary(selected)}</p>
                <ul className="sunrise-cal__detail-reasons">
                  {selected.statusReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {mode === 'intercept' &&
                  selected.isRideDay &&
                  selected.status !== 'unavailable' &&
                  selected.hasScheduleData && (
                    <p className="sunrise-cal__book-hint">
                      Click this day again to open booking for {ride.name}.
                    </p>
                  )}
                {mode === 'book' && selected.status !== 'unavailable' && selected.hasScheduleData && (
                  <button
                    type="button"
                    className="btn btn--green sunrise-cal__continue"
                    onClick={() => onContinue?.(selected)}
                  >
                    Continue to booking
                  </button>
                )}
              </div>
            )}

            <p className="sunrise-cal__footnote">
              Not Fridays · ride must fit inside {tideNoun} tide {windowLabel} during daylight · clear of
              sunrise package times.
              {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
              {mode === 'intercept' && ' Click a rideable day to book.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
