/**
 * Shelved: tide calendars for Patons Rock / Rangi / Swimming.
 * Booking intercept now uses FareHarbor "Select date" for those rides;
 * only Sunrise keeps a live tide calendar. Re-wire from here when ready.
 */
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
  type TideDaySchedule,
} from '../../../booking/schedule';
import { nzNoon } from '../../../booking/nzTime';
import { PLANNER_DAYS } from '../../../booking/location';
import {
  type FareHarborDateStatus,
  useFareHarborDateStatuses,
} from '../../../booking/fareharbor-availability';
import {
  PATONS_ROCK_RIDE,
  RANGI_RIDE,
  type RideType,
} from '../../../booking/rides';
import { useSunriseSchedule } from '../../../booking/useSunriseSchedule';
import DayCell from '../../SunriseRideCalendar/DayCell';
import TideCalendarLoading from '../../TideCalendarLoading/TideCalendarLoading';
import '../../SunriseRideCalendar/SunriseRideCalendar.css';

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

/** Low-tide rides share capacity — when one is booked, the other must not be offered. */
const LOW_TIDE_SIBLING: Record<string, { itemId: string; badge: string; title: string }> = {
  [PATONS_ROCK_RIDE.id]: {
    itemId: RANGI_RIDE.fareharborItemId!,
    badge: 'Rangi booked',
    title: 'Already booked on the Rangi ride',
  },
  [RANGI_RIDE.id]: {
    itemId: PATONS_ROCK_RIDE.fareharborItemId!,
    badge: 'Patons booked',
    title: 'Already booked on the Patons Rock ride',
  },
};

const STATUS_LABEL: Record<TideDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const OWN_FH_BADGE: Record<'full' | 'none', { label: string; title: string }> = {
  full: { label: 'Fully booked', title: 'Already booked by another guest' },
  none: { label: 'Not online', title: 'Not available to book online' },
};

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_COLUMNS = [1, 2, 3, 4, 5, 6, 0] as const;
const WEEK_COLUMN_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isTideBookable(day: TideDaySchedule): boolean {
  return Boolean(day.isRideDay && day.hasScheduleData && day.status !== 'unavailable');
}

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

function resolveFhGate(
  day: TideDaySchedule,
  ownStatus: FareHarborDateStatus,
  siblingStatus: FareHarborDateStatus,
  fhReady: boolean,
  siblingMeta?: { badge: string; title: string },
): {
  blocked: boolean;
  bookable: boolean;
  badge?: { label: string; title: string };
} {
  const tideBookable = isTideBookable(day);
  if (!tideBookable) {
    return { blocked: false, bookable: false };
  }

  if (!fhReady) {
    return { blocked: false, bookable: true };
  }

  if (ownStatus === 'full' || ownStatus === 'none') {
    return {
      blocked: true,
      bookable: false,
      badge: OWN_FH_BADGE[ownStatus],
    };
  }

  if (siblingMeta && siblingStatus === 'full') {
    return {
      blocked: true,
      bookable: false,
      badge: { label: siblingMeta.badge, title: siblingMeta.title },
    };
  }

  return {
    blocked: false,
    bookable: ownStatus === 'bookable',
  };
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
  const sibling = LOW_TIDE_SIBLING[ride.id];
  const {
    statuses: ownStatuses,
    loading: ownFhLoading,
    ready: ownFhReady,
  } = useFareHarborDateStatuses(ride.fareharborItemId ?? '');
  const {
    statuses: siblingStatuses,
    loading: siblingFhLoading,
    ready: siblingFhReady,
  } = useFareHarborDateStatuses(sibling?.itemId ?? '');

  const fhLoading = ownFhLoading || Boolean(sibling && siblingFhLoading);
  const fhReady = ownFhReady && (!sibling || siblingFhReady);
  const showLoading = loading || fhLoading;

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
  const selectedGate = selected
    ? resolveFhGate(
        selected,
        ownStatuses.get(selected.date) ?? 'unknown',
        siblingStatuses.get(selected.date) ?? 'unknown',
        fhReady,
        sibling,
      )
    : undefined;

  const pickDay = (day: TideDaySchedule) => {
    const gate = resolveFhGate(
      day,
      ownStatuses.get(day.date) ?? 'unknown',
      siblingStatuses.get(day.date) ?? 'unknown',
      fhReady,
      sibling,
    );
    if ((mode === 'book' || mode === 'intercept') && day.status === 'unavailable') return;
    if ((mode === 'book' || mode === 'intercept') && !day.isRideDay) return;
    if ((mode === 'book' || mode === 'intercept') && !day.hasScheduleData) return;
    if ((mode === 'book' || mode === 'intercept') && gate.blocked) return;
    setSelectedKey(day.date);
    onSelectDay?.(day);
    if (
      mode === 'intercept' &&
      day.isRideDay &&
      day.status !== 'unavailable' &&
      day.hasScheduleData &&
      !gate.blocked
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

      {error && !showLoading && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}

      <div className="sunrise-cal__body">
        {showLoading && <TideCalendarLoading message="Checking tide & availability…" />}

        {!showLoading && (
          <>
            {tideNote && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

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
                        const gate = resolveFhGate(
                          day,
                          ownStatuses.get(day.date) ?? 'unknown',
                          siblingStatuses.get(day.date) ?? 'unknown',
                          fhReady,
                          sibling,
                        );
                        const tideBookable = isTideBookable(day);
                        const selectable =
                          mode === 'browse' || (tideBookable && !gate.blocked);
                        const isSelected = selectedKey === day.date;
                        const bookable = mode === 'intercept' && selectable;
                        const ariaFh = gate.badge ? ` ${gate.badge.title}.` : '';

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
                              gate.blocked ? 'sunrise-cal__day--fh-blocked' : '',
                              gate.bookable ? 'sunrise-cal__day--fh-bookable' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => pickDay(day)}
                            disabled={mode !== 'browse' && !selectable}
                            aria-label={`${WEEKDAY_LONG[day.weekday]} ${day.date}. ${STATUS_LABEL[day.status]}.${ariaFh} Arrive by ${formatClock(day.rideStart)}.`}
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
                                  <span className="sunrise-cal__pills">
                                    <span className={`sunrise-cal__pill sunrise-cal__pill--${day.status}`}>
                                      {STATUS_LABEL[day.status]}
                                    </span>
                                    {gate.badge && (
                                      <span
                                        className="sunrise-cal__pill sunrise-cal__pill--fh-full"
                                        title={gate.badge.title}
                                      >
                                        {gate.badge.label}
                                      </span>
                                    )}
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
                {mode === 'book' &&
                  selected.status !== 'unavailable' &&
                  selected.hasScheduleData &&
                  !selectedGate?.blocked && (
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
          </>
        )}
      </div>
    </div>
  );
}
