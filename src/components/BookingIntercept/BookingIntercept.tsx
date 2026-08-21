import { OTHER_FAREHARBOR_RIDES, SUNRISE_TWILIGHT_RIDE } from '../../booking/fareharbor-catalog';
import { formatClock } from '../../booking/schedule';
import { openFareHarborBooking } from '../../lib/booking-events';
import { optimizedUrl } from '../../lib/images';
import SunriseRideCalendar, {
  type BookSlotPayload,
} from '../SunriseRideCalendar/SunriseRideCalendar';
import './BookingIntercept.css';

const RIDE_OUTLINE = [
  {
    id: 'twilight-rides',
    title: 'Sunrise & Twilight Beach Rides',
    blurb: 'Wed · Fri · Sun · tide-checked',
    image: SUNRISE_TWILIGHT_RIDE.image,
  },
  {
    id: 'other-rides',
    title: 'Trail, Beach & Swim Rides',
    blurb: 'Hack Track · Patons Rock · Rangi · Swim',
    image: OTHER_FAREHARBOR_RIDES[0].image,
  },
] as const;

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
      <nav className="booking-intercept__outline" aria-label="Ride types">
        {RIDE_OUTLINE.map((item) => (
          <a key={item.id} className="booking-intercept__outline-card" href={`#${item.id}`}>
            <img
              className="booking-intercept__outline-image"
              src={optimizedUrl(item.image, 'thumb')}
              alt=""
              decoding="async"
            />
            <span className="booking-intercept__outline-body">
              <span className="booking-intercept__outline-title">{item.title}</span>
              <span className="booking-intercept__outline-blurb">{item.blurb}</span>
            </span>
          </a>
        ))}
      </nav>

      <section id="twilight-rides" className="booking-intercept__sunrise">
        <div className="booking-intercept__sunrise-media">
          <img
            className="booking-intercept__sunrise-image"
            src={optimizedUrl(SUNRISE_TWILIGHT_RIDE.image, 'content')}
            alt={SUNRISE_TWILIGHT_RIDE.title}
            decoding="async"
          />
        </div>
        <div className="booking-intercept__sunrise-body">
          <h3>{SUNRISE_TWILIGHT_RIDE.title}</h3>
          <SunriseRideCalendar mode="intercept" onBookDay={bookTwilightSlot} />
        </div>
      </section>

      <section id="other-rides" className="booking-intercept__other">
        <h3>Trail, beach &amp; swim rides</h3>
        <div className="booking-intercept__grid">
          {OTHER_FAREHARBOR_RIDES.map((ride) => (
            <article key={ride.id} className="booking-intercept__card">
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
