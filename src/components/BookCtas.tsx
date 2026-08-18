import { useEffect, useState } from 'react';
import { BOOKING } from '../lib/constants';
import './BookCtas.css';

type BookingKind = 'ride' | 'stay';

const LABELS: Record<BookingKind, string> = {
  ride: 'Book a Ride',
  stay: 'Book your Stay',
};

export default function BookCtas() {
  const [open, setOpen] = useState<BookingKind | null>(null);

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

  return (
    <>
      <div className="book-ctas">
        <button type="button" className="book-ctas__ride" onClick={() => setOpen('ride')}>
          Book a Ride
        </button>
        <button type="button" className="book-ctas__stay" onClick={() => setOpen('stay')}>
          Book your Stay
        </button>
      </div>

      {open && (
        <div className="book-card" role="dialog" aria-modal="true" aria-label={LABELS[open]}>
          <button type="button" className="book-card__backdrop" aria-label="Close booking" onClick={() => setOpen(null)} />
          <div className="book-card__panel">
            <div className="book-card__bar">
              <h2>{LABELS[open]}</h2>
              <button type="button" className="book-card__close" onClick={() => setOpen(null)} aria-label="Close">
                ×
              </button>
            </div>
            <iframe
              title={LABELS[open]}
              src={BOOKING[open]}
              className="book-card__frame"
            />
          </div>
        </div>
      )}
    </>
  );
}
