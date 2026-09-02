import { useMemo, useState } from 'react';
import {
  buildSunriseHorizonSchedule,
  dayOfMonth,
  detailSummary,
  formatClock,
  formatHorizonRange,
  formatMonthTitle,
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
import TideCalendarLoading from '../TideCalendarLoading/TideCalendarLoading';
import './SunriseRideCalendar.css';

type CalendarMode = 'browse' | 'book' | 'intercept';

export interface BookSlotPayload {
  day: SunriseDaySchedule;
  slot: 'sunrise';
}

interface SunriseRideCalendarProps {
  mode?: CalendarMode;
  onSelectDay?: (day: SunriseDaySchedule) => void;
  onContinue?: (day: SunriseDaySchedule) => void;
  onBookDay?: (payload: BookSlotPayload) => void;
}

interface MonthGroup {
  monthKey: string;
  title: string;
  weeks: (SunriseDaySchedule | null)[][];
}

const STATUS_LABEL: Record<SunriseDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RIDE_COLUMNS = [3, 5, 0] as const;
const RIDE_COLUMN_LABELS = ['Wednesday', 'Friday', 'Sunday'];

function groupRideDaysByMonth(rideDays: SunriseDaySchedule[]): MonthGroup[] {
  const byMonth = new Map<string, SunriseDaySchedule[]>();
  for (const day of rideDays) {
    const monthKey = day.date.slice(0, 7);
    const list = byMonth.get(monthKey) ?? [];
    list.push(day);
    byMonth.set(monthKey, list);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, days]) => {
      const weeks = new Map<string, SunriseDaySchedule[]>();
      for (const day of days) {
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
          .map(([, weekDays]) => RIDE_COLUMNS.map((wd) => weekDays.find((d) => d.weekday === wd) ?? null)),
      };
    });
}

export default function SunriseRideCalendar({
  mode = 'browse',
  onSelectDay,
  onContinue,
  onBookDay,
}: SunriseRideCalendarProps) {
  const { startKey, todayKey, canPrev, canNext, shiftWindow, forecast, tides, allTides, loading, error, tideNote } =
    useSunriseSchedule();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const dates = useMemo(() => rollingHorizonDates(startKey, PLANNER_DAYS), [startKey]);

  const scheduleMap = useMemo(
    () => buildSunriseHorizonSchedule(startKey, forecast, tides, SUNRISE_RIDE, allTides),
    [startKey, forecast, tides, allTides],
  );

  const rideDays = useMemo(
    () => dates.map((dateKey) => scheduleMap.get(dateKey)!).filter((day) => day.isRideDay),
    [dates, scheduleMap],
  );

  const rideMonths = useMemo(() => groupRideDaysByMonth(rideDays), [rideDays]);

  const selectedDay = selectedKey ? scheduleMap.get(selectedKey) : undefined;

  const pickDay = (day: SunriseDaySchedule) => {
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
      onBookDay?.({ day, slot: 'sunrise' });
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

      {error && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}

      <div className="sunrise-cal__body">
        {loading && <TideCalendarLoading message="Checking sunrise & tide times…" />}

        {!loading && (
          <>
            {tideNote && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

            {rideDays.length > 0 && <HorizonSummary days={rideDays} />}

            <p className="sunrise-cal__days-note">
              Sunrise beach rides: <strong>Wednesday, Friday &amp; Sunday</strong> only. Green border =
              bookable; faded = do not book.
            </p>

            <div className="sunrise-cal__months">
              {rideMonths.map((month) => (
                <section
                  key={month.monthKey}
                  className="sunrise-cal__month"
                  aria-labelledby={`cal-month-${month.monthKey}`}
                >
                  <h4 id={`cal-month-${month.monthKey}`} className="sunrise-cal__month-title">
                    {month.title}
                  </h4>

                  <div className="sunrise-cal__weekdays sunrise-cal__weekdays--rides" aria-hidden="true">
                    {RIDE_COLUMN_LABELS.map((label) => (
                      <span key={label} className="sunrise-cal__weekday-head">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="sunrise-cal__grid sunrise-cal__grid--rides">
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
                          (day.status !== 'unavailable' && Boolean(day.hasScheduleData));
                        const isSelected = selectedKey === day.date;
                        const bookable = mode === 'intercept' && selectable;

                        return (
                          <button
                            key={day.date}
                            type="button"
                            className={[
                              'sunrise-cal__day',
                              'sunrise-cal__day--ride',
                              `sunrise-cal__day--${day.status}`,
                              isToday ? 'sunrise-cal__day--today' : '',
                              isSelected ? 'sunrise-cal__day--selected' : '',
                              !selectable ? 'sunrise-cal__day--disabled' : '',
                              bookable ? 'sunrise-cal__day--bookable' : '',
                              day.tideBlocked ? 'sunrise-cal__day--tide-block' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => pickDay(day)}
                            disabled={mode !== 'browse' && !selectable}
                            aria-label={`${WEEKDAY_LONG[day.weekday]} ${day.date}, Sunrise. ${STATUS_LABEL[day.status]}. Arrive by ${formatClock(day.rideStart)}.`}
                          >
                            <span className="sunrise-cal__weekday-tag">{WEEKDAY_LONG[day.weekday]}</span>
                            <span className="sunrise-cal__date-num">
                              {dayOfMonth(day.date)}
                              <span className="sunrise-cal__date-month">{shortMonth(day.date)}</span>
                            </span>
                            <DayCell day={day} compact />
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
                </section>
              ))}
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
                      Click this day again to open booking for the sunrise ride.
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
              Wed, Fri &amp; Sun · arrive 1 hour before sunrise · wave height shows tide level.
              {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
              {mode === 'intercept' && ' Click a rideable sunrise day to book.'}
            </p>
            <p className="sunrise-cal__legend">
              Wave height = tide at ride time · arrows show incoming (up) or outgoing (down) · blue overlay = high
              tide block · corner icon = weather (7-day forecast)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
