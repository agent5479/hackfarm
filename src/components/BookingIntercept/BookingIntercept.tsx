import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BOOKABLE_FAREHARBOR_RIDES,
  SUNRISE_BEACH_RIDE,
  type FareHarborRide,
} from '../../booking/fareharbor-catalog';
import { formatClock, formatSuggestedStart, type SunriseDaySchedule } from '../../booking/schedule';
import { rideDipsIntoTwilight, sunTimesForDate } from '../../booking/sun';
import { openFareHarborBooking, type FareHarborBookingDetail } from '../../lib/booking-events';
import { optimizedUrl } from '../../lib/images';
import SunriseRideCalendar, {
  type BookSlotPayload,
} from '../SunriseRideCalendar/SunriseRideCalendar';
import './BookingIntercept.css';

type PendingTwilightBooking = {
  detail: FareHarborBookingDetail;
  sunsetLabel: string;
  rideEndLabel: string;
};

function toFareHarborDetail(
  itemId: string,
  title: string,
  day: SunriseDaySchedule,
): FareHarborBookingDetail {
  return {
    itemId,
    date: day.date,
    rideStart: formatSuggestedStart(day.rideStart),
    title,
  };
}

function bookOtherRide(itemId: string, title: string) {
  openFareHarborBooking({ itemId, title });
}

function shouldOpenSunriseCalendar(hash: string) {
  return (
    hash === '#sunrise-rides' ||
    hash === '#twilight-rides' ||
    hash === '#tide-calendar'
  );
}

function scrollTargetFromHash(hash: string): string | null {
  if (!hash.startsWith('#') || hash.length < 2) return null;
  if (hash === '#twilight-rides' || hash === '#tide-calendar') return 'sunrise-rides';
  return hash.slice(1);
}

function rideLayoutClass(index: number) {
  return index < 2
    ? 'booking-intercept__ride booking-intercept__ride--featured'
    : 'booking-intercept__ride booking-intercept__ride--standard';
}

export default function BookingIntercept() {
  const { hash } = useLocation();
  const [calendarOpen, setCalendarOpen] = useState(() =>
    typeof window !== 'undefined' ? shouldOpenSunriseCalendar(window.location.hash) : false,
  );
  const [twilightNotice, setTwilightNotice] = useState<PendingTwilightBooking | null>(null);

  useEffect(() => {
    const targetId = scrollTargetFromHash(hash);
    if (!targetId) return;

    if (shouldOpenSunriseCalendar(hash)) {
      setCalendarOpen(true);
    }

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  useEffect(() => {
    if (!twilightNotice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTwilightNotice(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [twilightNotice]);

  const proceedToFareHarbor = (detail: FareHarborBookingDetail) => {
    setTwilightNotice(null);
    openFareHarborBooking(detail);
  };

  const bookScheduledRide = (itemId: string, title: string, day: SunriseDaySchedule) => {
    const detail = toFareHarborDetail(itemId, title, day);
    const { civilDusk } = sunTimesForDate(day.date);
    if (rideDipsIntoTwilight(day.rideStart, day.rideEnd, day.sunset, civilDusk)) {
      setTwilightNotice({
        detail,
        sunsetLabel: formatClock(day.sunset),
        rideEndLabel: formatClock(day.rideEnd),
      });
      return;
    }
    openFareHarborBooking(detail);
  };

  const bookSunriseSlot = ({ day }: BookSlotPayload) => {
    bookScheduledRide(SUNRISE_BEACH_RIDE.fareharborItemId, SUNRISE_BEACH_RIDE.title, day);
  };

  const renderRideCard = (ride: FareHarborRide, index: number) => {
    const isSunrise = Boolean(ride.usesTideCalendar);
    const actionLabel = isSunrise
      ? calendarOpen
        ? 'Hide tide calendar'
        : 'Check dates & book'
      : 'Select date';

    const activate = () => {
      if (isSunrise) {
        setCalendarOpen((open) => !open);
        return;
      }
      bookOtherRide(ride.fareharborItemId, ride.title);
    };

    return (
      <article
        key={ride.id}
        id={ride.id}
        className={`${rideLayoutClass(index)} booking-intercept__ride--interactive`}
        role="button"
        tabIndex={0}
        aria-label={`${ride.title}: ${actionLabel}`}
        aria-expanded={isSunrise ? calendarOpen : undefined}
        aria-controls={isSunrise ? 'tide-calendar' : undefined}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
          }
        }}
      >
        <img
          className="booking-intercept__ride-image"
          src={optimizedUrl(ride.image, 'thumb')}
          alt=""
          loading={index < 2 ? undefined : 'lazy'}
          decoding="async"
        />
        <div className="booking-intercept__ride-body">
          <h3>{ride.title}</h3>
          <p className="booking-intercept__meta">{ride.meta}</p>
          <div className="booking-intercept__ride-footer">
            {ride.priceFrom ? (
              <p className="booking-intercept__price">From {ride.priceFrom}</p>
            ) : (
              <span />
            )}
            <span className="booking-intercept__select" aria-hidden="true">
              {actionLabel}
            </span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="booking-intercept">
      <div className="booking-intercept__list">
        {BOOKABLE_FAREHARBOR_RIDES.map((ride, index) => renderRideCard(ride, index))}
      </div>

      {calendarOpen && (
        <div id="tide-calendar" className="booking-intercept__calendar">
          <SunriseRideCalendar mode="intercept" onBookDay={bookSunriseSlot} />
        </div>
      )}

      {twilightNotice && (
        <div
          className="booking-intercept__notice"
          role="dialog"
          aria-modal="true"
          aria-labelledby="twilight-notice-title"
        >
          <button
            type="button"
            className="booking-intercept__notice-backdrop"
            aria-label="Close notice"
            onClick={() => setTwilightNotice(null)}
          />
          <div className="booking-intercept__notice-panel">
            <h2 id="twilight-notice-title">Just a heads-up about timing</h2>
            <p>
              This ride runs until about {twilightNotice.rideEndLabel}, which meets sunset around{' '}
              {twilightNotice.sunsetLabel}. On Golden Bay&apos;s east-facing beaches the sun drops behind
              the hills around then, so it can feel cooler and the light fades sooner than you might
              expect — lovely in midsummer, less ideal for most of the year.
            </p>
            <p>You&apos;re welcome to continue if that still suits you, or pick another day on the calendar.</p>
            <div className="booking-intercept__notice-actions">
              <button
                type="button"
                className="booking-intercept__notice-secondary"
                onClick={() => setTwilightNotice(null)}
              >
                Choose another time
              </button>
              <button
                type="button"
                className="booking-intercept__notice-primary"
                onClick={() => proceedToFareHarbor(twilightNotice.detail)}
              >
                Continue to booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
