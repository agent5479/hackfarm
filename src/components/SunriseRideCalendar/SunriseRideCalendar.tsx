import { useMemo, useState } from 'react';
import {
  buildDualHorizonSchedule,
  dayOfMonth,
  detailSummary,
  formatClock,
  formatHorizonRange,
  formatMonthTitle,
  rollingHorizonDates,
  shortMonth,
  startOfWeekMonday,
  type DualDaySchedule,
  type RideSlotId,
  type SunriseDaySchedule,
} from '../../booking/schedule';
import { nzNoon } from '../../booking/nzTime';
import { PLANNER_DAYS } from '../../booking/location';
import { SUNRISE_RIDE, TWILIGHT_RIDE } from '../../booking/rides';
import { useSunriseSchedule } from '../../booking/useSunriseSchedule';
import DayCell from './DayCell';
import HorizonSummary from './HorizonSummary';
import './SunriseRideCalendar.css';

type CalendarMode = 'browse' | 'book' | 'intercept';

export interface BookSlotPayload {
  day: SunriseDaySchedule;
  slot: RideSlotId;
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
  weeks: (DualDaySchedule | null)[][];
}

const STATUS_LABEL: Record<SunriseDaySchedule['status'], string> = {
  rideable: 'Rideable',
  caution: 'Check weather',
  unavailable: 'Unavailable',
};

const SLOT_LABEL: Record<RideSlotId, string> = {
  sunrise: 'Sunrise',
  twilight: 'Twilight',
};

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RIDE_COLUMNS = [3, 5, 0] as const;
const RIDE_COLUMN_LABELS = ['Wednesday', 'Friday', 'Sunday'];

function slotFromDay(day: DualDaySchedule, slot: RideSlotId): SunriseDaySchedule {
  return slot === 'sunrise' ? day.sunrise : day.twilight;
}

function groupRideDaysByMonth(rideDays: DualDaySchedule[]): MonthGroup[] {
  const byMonth = new Map<string, DualDaySchedule[]>();
  for (const day of rideDays) {
    const monthKey = day.date.slice(0, 7);
    const list = byMonth.get(monthKey) ?? [];
    list.push(day);
    byMonth.set(monthKey, list);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, days]) => {
      const weeks = new Map<string, DualDaySchedule[]>();
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
    () => buildDualHorizonSchedule(startKey, forecast, tides, SUNRISE_RIDE, TWILIGHT_RIDE, allTides),
    [startKey, forecast, tides, allTides],
  );

  const rideDays = useMemo(
    () => dates.map((dateKey) => scheduleMap.get(dateKey)!).filter((day) => day.isRideDay),
    [dates, scheduleMap],
  );

  const rideMonths = useMemo(() => groupRideDaysByMonth(rideDays), [rideDays]);

  const selectedSlot = selectedKey
    ? (() => {
        const [date, slot] = selectedKey.split('::') as [string, RideSlotId];
        const dual = scheduleMap.get(date);
        return dual ? slotFromDay(dual, slot) : undefined;
      })()
    : undefined;

  const pickSlot = (slotDay: SunriseDaySchedule) => {
    if ((mode === 'book' || mode === 'intercept') && slotDay.status === 'unavailable') return;
    if ((mode === 'book' || mode === 'intercept') && !slotDay.isRideDay) return;
    if ((mode === 'book' || mode === 'intercept') && !slotDay.hasScheduleData) return;
    const key = `${slotDay.date}::${slotDay.slot}`;
    setSelectedKey(key);
    onSelectDay?.(slotDay);
    if (
      mode === 'intercept' &&
      slotDay.isRideDay &&
      slotDay.status !== 'unavailable' &&
      slotDay.hasScheduleData
    ) {
      onBookDay?.({ day: slotDay, slot: slotDay.slot });
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

      {loading && <p className="sunrise-cal__status">Loading sunrise, twilight &amp; tide times…</p>}
      {error && <p className="sunrise-cal__status sunrise-cal__status--warn">{error}</p>}
      {tideNote && !loading && <p className="sunrise-cal__status sunrise-cal__status--warn">{tideNote}</p>}

      {!loading && rideDays.length > 0 && <HorizonSummary days={rideDays} />}

      <p className="sunrise-cal__days-note">
        Sunrise and twilight rides run <strong>Wednesday, Friday &amp; Sunday</strong> only. Pick a
        rideable slot — only book dates marked rideable.
      </p>

      <div className="sunrise-cal__months">
        {rideMonths.map((month) => (
          <section key={month.monthKey} className="sunrise-cal__month" aria-labelledby={`cal-month-${month.monthKey}`}>
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

            <div className="sunrise-cal__grid sunrise-cal__grid--rides sunrise-cal__grid--dual">
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
                  const slots: RideSlotId[] = ['sunrise', 'twilight'];

                  return (
                    <div
                      key={day.date}
                      className={[
                        'sunrise-cal__day',
                        'sunrise-cal__day--ride',
                        'sunrise-cal__day--dual',
                        isToday ? 'sunrise-cal__day--today' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="sunrise-cal__weekday-tag">{WEEKDAY_LONG[day.weekday]}</span>
                      <span className="sunrise-cal__date-num">
                        {dayOfMonth(day.date)}
                        <span className="sunrise-cal__date-month">{shortMonth(day.date)}</span>
                      </span>

                      <div className="sunrise-cal__slots">
                        {slots.map((slot) => {
                          const slotDay = slotFromDay(day, slot);
                          const selectable =
                            mode === 'browse' ||
                            (slotDay.status !== 'unavailable' && Boolean(slotDay.hasScheduleData));
                          const isSelected = selectedKey === `${day.date}::${slot}`;
                          const bookable = mode === 'intercept' && selectable;

                          return (
                            <button
                              key={slot}
                              type="button"
                              className={[
                                'sunrise-cal__slot',
                                `sunrise-cal__slot--${slot}`,
                                `sunrise-cal__slot--${slotDay.status}`,
                                isSelected ? 'sunrise-cal__slot--selected' : '',
                                !selectable ? 'sunrise-cal__slot--disabled' : '',
                                bookable ? 'sunrise-cal__slot--bookable' : '',
                                slotDay.tideBlocked ? 'sunrise-cal__slot--tide-block' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => pickSlot(slotDay)}
                              disabled={mode !== 'browse' && !selectable}
                              aria-label={`${WEEKDAY_LONG[day.weekday]} ${day.date}, ${SLOT_LABEL[slot]}. ${STATUS_LABEL[slotDay.status]}. Arrive by ${formatClock(slotDay.rideStart)}.`}
                            >
                              <span className="sunrise-cal__slot-label">{SLOT_LABEL[slot]}</span>
                              <DayCell day={slotDay} compact />
                              {slotDay.hasScheduleData && (
                                <span className={`sunrise-cal__pill sunrise-cal__pill--${slotDay.status}`}>
                                  {STATUS_LABEL[slotDay.status]}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          </section>
        ))}
      </div>

      {selectedSlot && selectedSlot.isRideDay && (
        <div className="sunrise-cal__detail">
          <p className="sunrise-cal__detail-text">{detailSummary(selectedSlot)}</p>
          <ul className="sunrise-cal__detail-reasons">
            {selectedSlot.statusReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {mode === 'intercept' &&
            selectedSlot.isRideDay &&
            selectedSlot.status !== 'unavailable' &&
            selectedSlot.hasScheduleData && (
              <p className="sunrise-cal__book-hint">
                Click this slot again to open booking for the {SLOT_LABEL[selectedSlot.slot]} ride.
              </p>
            )}
          {mode === 'book' && selectedSlot.status !== 'unavailable' && selectedSlot.hasScheduleData && (
            <button
              type="button"
              className="btn btn--green sunrise-cal__continue"
              onClick={() => onContinue?.(selectedSlot)}
            >
              Continue to booking
            </button>
          )}
        </div>
      )}

      <p className="sunrise-cal__footnote">
        Wed, Fri &amp; Sun · arrive 1 hour before sunrise or sunset · wave height shows tide level.
        {mode === 'browse' && ' Weather affects suitability within the next 7 days only.'}
        {mode === 'intercept' && ' Click a rideable sunrise or twilight slot to book.'}
      </p>
      <p className="sunrise-cal__legend">
        Wave height = tide at ride time · arrows show incoming (up) or outgoing (down) · blue overlay = high
        tide block · corner icon = weather (7-day forecast)
      </p>
    </div>
  );
}
