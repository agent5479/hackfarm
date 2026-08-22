import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OTHER_FAREHARBOR_RIDES, SUNRISE_TWILIGHT_RIDE } from '../../booking/fareharbor-catalog';
import { formatClock } from '../../booking/schedule';
import { openFareHarborBooking } from '../../lib/booking-events';
import { optimizedUrl } from '../../lib/images';
import SunriseRideCalendar, {
  type BookSlotPayload,
} from '../SunriseRideCalendar/SunriseRideCalendar';
import './BookingIntercept.css';

function bookTwilightSlot({ day, slot }: BookSlotPayload) {
  const slotTitle = slot === 'sunrise' ? 'Sunrise' : 'Twilight';
  openFareHarborBooking({
    itemId: SUNRISE_TWILIGHT_RIDE.fareharborItemId,
    date: day.date,
    rideStart: formatClock(day.rideStart),
    title: `${slotTitle} — ${SUNRISE_TWILIGHT_RIDE.title}`,
  });
}

function bookOtherRide(itemId: string, title: string) {
  openFareHarborBooking({ itemId, title });
}

function shouldOpenCalendar(hash: string) {
  return hash === '#twilight-rides' || hash === '#tide-calendar';
}

export default function BookingIntercept() {
  const { hash } = useLocation();
  const [calendarOpen, setCalendarOpen] = useState(() =>
    typeof window !== 'undefined' ? shouldOpenCalendar(window.location.hash) : false,
  );

  useEffect(() => {
    if (!shouldOpenCalendar(hash)) return;
    setCalendarOpen(true);
    const id = hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  return (
    <div className="booking-intercept">
      <article id="twilight-rides" className="booking-intercept__twilight-card">
        <img
          className="booking-intercept__twilight-image"
          src={optimizedUrl(SUNRISE_TWILIGHT_RIDE.image, 'thumb')}
          alt={SUNRISE_TWILIGHT_RIDE.title}
          decoding="async"
        />
        <div className="booking-intercept__twilight-body">
          <p className="booking-intercept__panel-eyebrow">Tide-dependent · Wed / Fri / Sun</p>
          <h3>{SUNRISE_TWILIGHT_RIDE.title}</h3>
          <p className="booking-intercept__meta">{SUNRISE_TWILIGHT_RIDE.meta}</p>
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
          <p className="booking-intercept__calendar-lead">
            Green border = bookable. Faded = tide and sun do not align — do not book those slots.
          </p>
          <SunriseRideCalendar mode="intercept" onBookDay={bookTwilightSlot} />
        </div>
      )}

      <div className="booking-intercept__divider" aria-hidden="true">
        <span>Other rides (no tide calendar needed)</span>
      </div>

      <section id="other-rides" className="booking-intercept__panel booking-intercept__panel--other">
        <header className="booking-intercept__panel-head">
          <p className="booking-intercept__panel-eyebrow">Open dates</p>
          <h3>Other rides</h3>
        </header>
        <div className="booking-intercept__grid">
          {OTHER_FAREHARBOR_RIDES.map((ride) => (
            <article key={ride.id} id={ride.id} className="booking-intercept__card">
              <img
                className="booking-intercept__card-image"
                src={optimizedUrl(ride.image, 'thumb')}
                alt={ride.title}
                loading="lazy"
                decoding="async"
              />
              <div className="booking-intercept__card-body">
                <h4>{ride.title}</h4>
                <p className="booking-intercept__meta">{ride.meta}</p>
                <div className="booking-intercept__footer">
                  {ride.priceFrom && <span className="booking-intercept__price">From {ride.priceFrom}</span>}
                  <button
                    type="button"
                    className="booking-intercept__select"
                    onClick={() => bookOtherRide(ride.fareharborItemId, ride.title)}
                  >
                    Select date
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
