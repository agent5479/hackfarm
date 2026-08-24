import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OTHER_FAREHARBOR_RIDES, SUNRISE_TWILIGHT_RIDE } from '../../booking/fareharbor-catalog';
import { getRideType } from '../../booking/rides';
import { formatClock } from '../../booking/schedule';
import { openFareHarborBooking } from '../../lib/booking-events';
import { optimizedUrl } from '../../lib/images';
import SunriseRideCalendar, {
  type BookSlotPayload,
} from '../SunriseRideCalendar/SunriseRideCalendar';
import TideRideCalendar, {
  type BookTideDayPayload,
} from '../TideRideCalendar/TideRideCalendar';
import './BookingIntercept.css';

const TIDE_CALENDAR_RIDE_IDS = new Set(['patons-rock', 'rangi', 'swimming']);

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

function bookTideRide(title: string, itemId: string, { day }: BookTideDayPayload) {
  openFareHarborBooking({
    itemId,
    date: day.date,
    rideStart: formatClock(day.rideStart),
    title,
  });
}

function shouldOpenCalendar(hash: string) {
  return (
    hash === '#twilight-rides' ||
    hash === '#tide-calendar' ||
    hash === '#patons-rock' ||
    hash === '#rangi' ||
    hash === '#swimming'
  );
}

function calendarIdFromHash(hash: string): string | null {
  if (hash === '#twilight-rides' || hash === '#tide-calendar') return 'sunrise-twilight';
  if (hash === '#patons-rock') return 'patons-rock';
  if (hash === '#rangi') return 'rangi';
  if (hash === '#swimming') return 'swimming';
  return null;
}

export default function BookingIntercept() {
  const { hash } = useLocation();
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? calendarIdFromHash(window.location.hash) : null,
  );

  useEffect(() => {
    if (!shouldOpenCalendar(hash)) return;
    const id = calendarIdFromHash(hash);
    setOpenCalendarId(id);
    const elId = hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  const toggleCalendar = (id: string) => {
    setOpenCalendarId((current) => (current === id ? null : id));
  };

  return (
    <div className="booking-intercept">
      <div className="booking-intercept__list">
        <article id="twilight-rides" className="booking-intercept__ride">
          <img
            className="booking-intercept__ride-image"
            src={optimizedUrl(SUNRISE_TWILIGHT_RIDE.image, 'thumb')}
            alt={SUNRISE_TWILIGHT_RIDE.title}
            decoding="async"
          />
          <div className="booking-intercept__ride-body">
            <p className="booking-intercept__eyebrow">Tide-dependent · Wed / Fri / Sun</p>
            <h3>{SUNRISE_TWILIGHT_RIDE.title}</h3>
            <p className="booking-intercept__meta">{SUNRISE_TWILIGHT_RIDE.meta}</p>
            <button
              type="button"
              className="booking-intercept__select"
              aria-expanded={openCalendarId === 'sunrise-twilight'}
              aria-controls="tide-calendar"
              onClick={() => toggleCalendar('sunrise-twilight')}
            >
              {openCalendarId === 'sunrise-twilight' ? 'Hide tide calendar' : 'Check dates & book'}
            </button>
          </div>
        </article>

        {openCalendarId === 'sunrise-twilight' && (
          <div id="tide-calendar" className="booking-intercept__calendar">
            <p className="booking-intercept__calendar-lead">
              Green border = bookable. Faded = tide and sun do not align — do not book those slots.
            </p>
            <SunriseRideCalendar mode="intercept" onBookDay={bookTwilightSlot} />
          </div>
        )}

        {OTHER_FAREHARBOR_RIDES.map((ride) => {
          const usesTideCalendar = TIDE_CALENDAR_RIDE_IDS.has(ride.id);
          const calendarOpen = openCalendarId === ride.id;
          const calendarDomId = `${ride.id}-calendar`;

          return (
            <div key={ride.id} className="booking-intercept__ride-block">
              <article id={ride.id} className="booking-intercept__ride">
                <img
                  className="booking-intercept__ride-image"
                  src={optimizedUrl(ride.image, 'thumb')}
                  alt={ride.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="booking-intercept__ride-body">
                  {usesTideCalendar ? (
                    <p className="booking-intercept__eyebrow">
                      Tide-dependent · not Fridays · daylight only
                    </p>
                  ) : (
                    ride.priceFrom && (
                      <p className="booking-intercept__eyebrow">From {ride.priceFrom}</p>
                    )
                  )}
                  {usesTideCalendar && ride.priceFrom && (
                    <p className="booking-intercept__price-from">From {ride.priceFrom}</p>
                  )}
                  <h3>{ride.title}</h3>
                  <p className="booking-intercept__meta">{ride.meta}</p>
                  {usesTideCalendar ? (
                    <button
                      type="button"
                      className="booking-intercept__select"
                      aria-expanded={calendarOpen}
                      aria-controls={calendarDomId}
                      onClick={() => toggleCalendar(ride.id)}
                    >
                      {calendarOpen ? 'Hide tide calendar' : 'Check dates & book'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="booking-intercept__select"
                      onClick={() => bookOtherRide(ride.fareharborItemId, ride.title)}
                    >
                      Select date
                    </button>
                  )}
                </div>
              </article>

              {usesTideCalendar && calendarOpen && (
                <div id={calendarDomId} className="booking-intercept__calendar">
                  <p className="booking-intercept__calendar-lead">
                    Green border = bookable. Faded = tide window, daylight, Friday, or sunrise/twilight
                    overlap — do not book those days.
                  </p>
                  <TideRideCalendar
                    ride={getRideType(ride.id)}
                    mode="intercept"
                    onBookDay={(payload) =>
                      bookTideRide(ride.title, ride.fareharborItemId, payload)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
