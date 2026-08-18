import { BOOKING } from '../lib/constants';
import './BookCtas.css';

export default function BookCtas() {
  return (
    <div className="book-ctas">
      <a href={BOOKING.ride} className="book-ctas__ride" target="_blank" rel="noopener noreferrer">
        Book a Ride
      </a>
      <a href={BOOKING.stay} className="book-ctas__stay" target="_blank" rel="noopener noreferrer">
        Book your Stay
      </a>
    </div>
  );
}
