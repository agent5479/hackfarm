import { OTHER_FAREHARBOR_RIDES, SUNRISE_TWILIGHT_RIDE } from '../../booking/fareharbor-catalog';
import { formatClock } from '../../booking/schedule';
import type { SunriseDaySchedule } from '../../booking/schedule';
import { openFareHarborBooking } from '../../lib/booking-events';
import { withBase } from '../../lib/constants';
import SunriseRideCalendar from '../SunriseRideCalendar/SunriseRideCalendar';
import './BookingIntercept.css';

function bookSunriseDay(day: SunriseDaySchedule) {
  openFareHarborBooking({
    itemId: SUNRISE_TWILIGHT_RIDE.fareharborItemId,
    date: day.date,
    rideStart: formatClock(day.rideStart),
    title: SUNRISE_TWILIGHT_RIDE.title,
  });
}

function bookOtherRide(itemId: string, title: string) {
  openFareHarborBooking({ itemId, title });
}

export default function BookingIntercept() {
  return (
    <div className="booking-intercept">
      <div className="booking-intercept__disclaimer">
        <h3>Sunrise &amp; sunset twilight rides — check before you book</h3>
        <p>
          The schedule checker below applies <strong>only</strong> to our{' '}
          <strong>{SUNRISE_TWILIGHT_RIDE.title}</strong> on FareHarbor. Beach access at Paton&apos;s Rock
          depends on tide and sunrise lining up safely.
        </p>
        <ul>
          <li>Available <strong>Wednesday, Friday &amp; Sunday</strong> only</li>
          <li>Ride starts <strong>1 hour before sunrise</strong> — the exact time is shown for each day</li>
          <li>Beach access needs tide clearance around high water (3h+ before or 2h+ after high tide)</li>
          <li>
            <strong>Only book dates marked rideable</strong> — unavailable days mean tide and sunrise do
            not align safely
          </li>
        </ul>
      </div>

      <div className="booking-intercept__sunrise">
        <span className="booking-intercept__badge">Sunrise / Sunset Twilight — schedule checker</span>
        <SunriseRideCalendar mode="intercept" onBookDay={bookSunriseDay} />
      </div>

      <div className="booking-intercept__other">
        <h3>All other rides</h3>
        <p className="booking-intercept__other-note">
          Sunrise twilight bookings use the calendar above. Select a date below for our other experiences.
        </p>
        <div className="booking-intercept__grid">
          {OTHER_FAREHARBOR_RIDES.map((ride) => (
            <article key={ride.id} className="booking-intercept__card">
              <img className="booking-intercept__card-image" src={withBase(ride.image)} alt={ride.title} />
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
      </div>
    </div>
  );
}
