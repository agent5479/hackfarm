import { useEffect, useState } from 'react';
import { BOOKING, fareHarborRideUrl } from '../lib/constants';
import { OPEN_RIDE_BOOKING_EVENT } from '../lib/booking-events';
import RidePlanner from '../booking/RidePlanner';
import './BookCtas.css';

type BookingKind = 'ride' | 'stay';
type RideStep = 'planner' | 'fareharbor';

const LABELS: Record<BookingKind, string> = {
  ride: 'Book a Ride',
  stay: 'Book your Stay',
};

export default function BookCtas() {
  const [open, setOpen] = useState<BookingKind | null>(null);
  const [rideStep, setRideStep] = useState<RideStep>('planner');
  const [rideSrc, setRideSrc] = useState(BOOKING.ride);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const openRide = () => openKind('ride');
    window.addEventListener(OPEN_RIDE_BOOKING_EVENT, openRide);
    return () => window.removeEventListener(OPEN_RIDE_BOOKING_EVENT, openRide);
  }, []);

  const openKind = (kind: BookingKind) => {
    setRideStep('planner');
    setRideSrc(BOOKING.ride);
    setOpen(kind);
  };

  const title = open === 'ride' && rideStep === 'planner' ? 'Sunrise ride — pick a day' : open ? LABELS[open] : '';

  return (
    <>
      <div className="book-ctas">
        <button type="button" className="book-ctas__ride" onClick={() => openKind('ride')}>
          Book a Ride
        </button>
        <button type="button" className="book-ctas__stay" onClick={() => openKind('stay')}>
          Book your Stay
        </button>
      </div>

      {open && (
        <div className="book-card" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="book-card__backdrop" aria-label="Close booking" onClick={() => setOpen(null)} />
          <div className="book-card__panel">
            <div className="book-card__bar">
              <h2>{title}</h2>
              {open === 'ride' && rideStep === 'fareharbor' && (
                <button type="button" className="book-card__back" onClick={() => setRideStep('planner')}>
                  Back
                </button>
              )}
              <button type="button" className="book-card__close" onClick={() => setOpen(null)} aria-label="Close">
                ×
              </button>
            </div>
            {open === 'ride' && rideStep === 'planner' ? (
              <RidePlanner
                onContinue={({ itemId, date, rideStart }) => {
                  setRideSrc(fareHarborRideUrl(itemId, date, rideStart));
                  setRideStep('fareharbor');
                }}
              />
            ) : (
              <iframe
                title={LABELS[open]}
                src={open === 'ride' ? rideSrc : BOOKING.stay}
                className="book-card__frame"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
