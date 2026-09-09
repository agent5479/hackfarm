import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OTHER_FAREHARBOR_RIDES, SUNRISE_BEACH_RIDE } from '../../booking/fareharbor-catalog';
import { formatClock, type SunriseDaySchedule } from '../../booking/schedule';
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
    rideStart: formatClock(day.rideStart),
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

  return (
    <div className="booking-intercept">
      <div className="booking-intercept__list">
        <article id="sunrise-rides" className="booking-intercept__ride">
          <img
            className="booking-intercept__ride-image"
            src={optimizedUrl(SUNRISE_BEACH_RIDE.image, 'thumb')}
            alt={SUNRISE_BEACH_RIDE.title}
            decoding="async"
          />
          <div className="booking-intercept__ride-body">
            <p className="booking-intercept__eyebrow">Tide-dependent · Wed / Fri / Sun</p>
            <h3>{SUNRISE_BEACH_RIDE.title}</h3>
            <p className="booking-intercept__meta">{SUNRISE_BEACH_RIDE.meta}</p>
            <button
              type="button"
              className="booking-intercept__select"
              aria-expanded={calendarOpen}
              aria-controls="tide-calendar"
              onClick={() => setCalendarOpen((open) => !open)}
            >
              {calendarOpen ? 'Hide tide calendar' : 'Check dates & book'}
            </button>
          </div>
        </article>

        {calendarOpen && (
          <div id="tide-calendar" className="booking-intercept__calendar">
            <SunriseRideCalendar mode="intercept" onBookDay={bookSunriseSlot} />
          </div>
        )}

        {OTHER_FAREHARBOR_RIDES.map((ride) => (
          <article key={ride.id} id={ride.id} className="booking-intercept__ride">
            <img
              className="booking-intercept__ride-image"
              src={optimizedUrl(ride.image, 'thumb')}
              alt={ride.title}
              loading="lazy"
              decoding="async"
            />
            <div className="booking-intercept__ride-body">
              {ride.priceFrom && (
                <p className="booking-intercept__eyebrow">From {ride.priceFrom}</p>
              )}
              <h3>{ride.title}</h3>
              <p className="booking-intercept__meta">{ride.meta}</p>
              <button
                type="button"
                className="booking-intercept__select"
                onClick={() => bookOtherRide(ride.fareharborItemId, ride.title)}
              >
                Select date
              </button>
            </div>
          </article>
        ))}
      </div>

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
              {twilightNotice.sunsetLabel}. On Golden Bay's east-facing beaches the sun drops behind
              the hills around then, so it can feel cooler and the light fades sooner than you might
              expect — lovely in midsummer, less ideal for most of the year.
            </p>
            <p>You’re welcome to continue if that still suits you, or pick another day on the calendar.</p>
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
