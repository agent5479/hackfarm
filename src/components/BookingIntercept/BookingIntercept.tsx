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
    blurb: "Wed · Fri · Sun · tide-checked at Paton's Rock",
    image: SUNRISE_TWILIGHT_RIDE.image,
    summaries: [
      'Sunrise beach ride — arrive 1 hour before sunrise',
      'Twilight beach ride — arrive 1 hour before sunset',
      'Wednesday, Friday & Sunday only',
      'Only rideable tide & sun combinations can be booked',
    ],
  },
  {
    id: 'other-rides',
    title: 'Trail, Beach & Swim Rides',
    blurb: 'Book any available date on FareHarbor',
    image: OTHER_FAREHARBOR_RIDES[0].image,
    summaries: OTHER_FAREHARBOR_RIDES.map((ride) =>
      ride.priceFrom ? `${ride.title} — from ${ride.priceFrom}` : ride.title,
    ),
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
      <fieldset className="booking-intercept__chooser">
        <legend className="booking-intercept__chooser-legend">Choose your ride type</legend>
        <p className="booking-intercept__chooser-lead">
          Select a category to jump to booking options below.
        </p>
        <div className="booking-intercept__outline" role="list">
          {RIDE_OUTLINE.map((item) => (
            <a
              key={item.id}
              className="booking-intercept__outline-card"
              href={`#${item.id}`}
              role="listitem"
            >
              <img
                className="booking-intercept__outline-image"
                src={optimizedUrl(item.image, 'thumb')}
                alt=""
                decoding="async"
              />
              <span className="booking-intercept__outline-body">
                <span className="booking-intercept__outline-title">{item.title}</span>
                <span className="booking-intercept__outline-blurb">{item.blurb}</span>
                <ul className="booking-intercept__outline-list">
                  {item.summaries.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </span>
            </a>
          ))}
        </div>
      </fieldset>

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
        <span>Or book a trail, beach or swim ride</span>
      </div>

      <section id="other-rides" className="booking-intercept__panel booking-intercept__panel--other">
        <header className="booking-intercept__panel-head">
          <p className="booking-intercept__panel-eyebrow">Open dates</p>
          <h3>Trail, beach &amp; swim rides</h3>
        </header>
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
