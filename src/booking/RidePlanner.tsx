import { SUNRISE_RIDE } from '../booking/rides';
import { formatClock } from '../booking/schedule';
import SunriseRideCalendar from '../components/SunriseRideCalendar/SunriseRideCalendar';
import type { SunriseDaySchedule } from '../booking/schedule';
import './RidePlanner.css';

interface RidePlannerProps {
  onContinue: (opts: { itemId?: string; date?: string; rideStart?: string }) => void;
}

export default function RidePlanner({ onContinue }: RidePlannerProps) {
  const handleContinue = (day: SunriseDaySchedule) => {
    onContinue({
      itemId: SUNRISE_RIDE.fareharborItemId,
      date: day.date,
      rideStart: formatClock(day.rideStart),
    });
  };

  return (
    <div className="ride-planner">
      <p className="ride-planner__lead">
        Sunrise beach rides at Paton&apos;s Rock run Wed, Fri & Sun. Pick a week, check sunrise and tide, then continue to live booking.
      </p>
      <p className="ride-planner__hint">{SUNRISE_RIDE.hint}</p>

      <SunriseRideCalendar mode="book" onContinue={handleContinue} />

      <button
        type="button"
        className="ride-planner__skip"
        onClick={() => onContinue({ itemId: SUNRISE_RIDE.fareharborItemId })}
      >
        Skip — see all dates
      </button>
    </div>
  );
}
