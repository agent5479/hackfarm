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

export default function BookingIntercept() {
  return (
    <div className="booking-intercept">
      <section id="twilight-rides" className="booking-intercept__panel booking-intercept__panel--twilight">
        <header className="booking-intercept__panel-head">
          <p className="booking-intercept__panel-eyebrow">Tide-checked schedule</p>
          <h3>{SUNRISE_TWILIGHT_RIDE.title}</h3>
        </header>
        <div className="booking-intercept__sunrise-media">
          <img
            className="booking-intercept__sunrise-image"
            src={optimizedUrl(SUNRISE_TWILIGHT_RIDE.image, 'content')}
            alt={SUNRISE_TWILIGHT_RIDE.title}
            decoding="async"
          />
        </div>
        <div className="booking-intercept__sunrise-body">
          <SunriseRideCalendar mode="intercept" onBookDay={bookTwilightSlot} />
        </div>
      </section>

      <div className="booking-intercept__divider" aria-hidden="true">
        <span>Trail, beach &amp; swim rides</span>
      </div>

      <section id="other-rides" className="booking-intercept__panel booking-intercept__panel--other">
        <header className="booking-intercept__panel-head">
          <p className="booking-intercept__panel-eyebrow">Open dates</p>
          <h3>Trail, beach &amp; swim rides</h3>
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
