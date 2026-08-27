import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveAvailabilityId } from '../booking/fareharbor-availability';
import { formatDayLabel } from '../booking/schedule';
import { BOOKING, fareHarborRideUrl } from '../lib/constants';
import {
  OPEN_FAREHARBOR_BOOKING_EVENT,
  OPEN_RIDE_BOOKING_EVENT,
  type FareHarborBookingDetail,
} from '../lib/booking-events';
import './BookCtas.css';

type BookingKind = 'ride' | 'stay';

const LABELS: Record<BookingKind, string> = {
  ride: 'Book a Ride',
  stay: 'Book your Stay',
};

const RIDES_BOOKING_PATH = '/holistic-horse-rides/#book-rides';

function scrollToBookRides() {
  const el = document.getElementById('book-rides');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function BookCtas() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState<BookingKind | null>(null);
  const [rideSrc, setRideSrc] = useState(BOOKING.ride);
  const [rideDetail, setRideDetail] = useState<FareHarborBookingDetail>({});
  const [rideLoading, setRideLoading] = useState(false);

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

  const goToRideBooking = useCallback(() => {
    const onRidesPage = pathname.replace(/\/$/, '') === '/holistic-horse-rides';
    if (onRidesPage && hash === '#book-rides') {
      scrollToBookRides();
      return;
    }
    navigate(RIDES_BOOKING_PATH);
  }, [hash, navigate, pathname]);

  const openFareHarbor = useCallback(async (detail: FareHarborBookingDetail = {}) => {
    setRideDetail(detail);
    setOpen('ride');

    const fallbackSrc = fareHarborRideUrl(detail.itemId, detail.date, detail.rideStart);
    if (!detail.itemId || !detail.date || detail.lockDate === false) {
      setRideSrc(fallbackSrc);
      setRideLoading(false);
      return;
    }

    setRideLoading(true);
    setRideSrc(fallbackSrc);
    try {
      const availabilityId = await resolveAvailabilityId(detail.itemId, detail.date, detail.rideStart);
      setRideSrc(
        availabilityId != null
          ? fareHarborRideUrl(detail.itemId, detail.date, detail.rideStart, availabilityId)
          : fallbackSrc,
      );
    } catch {
      setRideSrc(fallbackSrc);
    } finally {
      setRideLoading(false);
    }
  }, []);

  useEffect(() => {
    const onRideBooking = () => goToRideBooking();
    const onFareHarbor = (e: Event) => {
      openFareHarbor((e as CustomEvent<FareHarborBookingDetail>).detail ?? {});
    };
    window.addEventListener(OPEN_RIDE_BOOKING_EVENT, onRideBooking);
    window.addEventListener(OPEN_FAREHARBOR_BOOKING_EVENT, onFareHarbor);
    return () => {
      window.removeEventListener(OPEN_RIDE_BOOKING_EVENT, onRideBooking);
      window.removeEventListener(OPEN_FAREHARBOR_BOOKING_EVENT, onFareHarbor);
    };
  }, [goToRideBooking, openFareHarbor]);

  useEffect(() => {
    if (hash === '#book-rides' && pathname.replace(/\/$/, '') === '/holistic-horse-rides') {
      requestAnimationFrame(scrollToBookRides);
    }
  }, [hash, pathname]);

  const showDateLock = open === 'ride' && rideDetail.date && rideDetail.lockDate !== false;

  const title = useMemo(() => {
    if (open === 'stay') return LABELS.stay;
    if (open !== 'ride') return '';
    const base = rideDetail.title ?? LABELS.ride;
    if (!rideDetail.date) return base;
    return `${base} · ${formatDayLabel(rideDetail.date)}`;
  }, [open, rideDetail.date, rideDetail.title]);

  return (
    <>
      <div className="book-ctas">
        <button type="button" className="book-ctas__ride" onClick={goToRideBooking}>
          Book a Ride
        </button>
        <button type="button" className="book-ctas__stay" onClick={() => setOpen('stay')}>
          Book your Stay
        </button>
      </div>

      {open && (
        <div className="book-card" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="book-card__backdrop" aria-label="Close booking" onClick={() => setOpen(null)} />
          <div className="book-card__panel">
            <div className="book-card__bar">
              <h2>{title}</h2>
              <button type="button" className="book-card__close" onClick={() => setOpen(null)} aria-label="Close">
                ×
              </button>
            </div>
            {showDateLock && (
              <div className="book-card__date-lock" role="status">
                <p className="book-card__date-lock-heading">
                  Booking for {formatDayLabel(rideDetail.date!)}
                </p>
                {rideDetail.rideStart && (
                  <p className="book-card__date-lock-start">Suggested start {rideDetail.rideStart}</p>
                )}
                <p className="book-card__date-lock-hint">
                  To change the date, close this window and pick a different day on the tide calendar.
                </p>
              </div>
            )}
            <div className="book-card__frame-wrap">
              {open === 'ride' && rideLoading && (
                <div className="book-card__loading" role="status" aria-live="polite">
                  <span className="book-card__spinner" aria-hidden="true" />
                  <p className="book-card__loading-text">Loading your booking slot…</p>
                </div>
              )}
              {open === 'ride' && showDateLock && !rideLoading && (
                <div
                  className="book-card__fh-shield"
                  aria-hidden="true"
                  title="To change the date, close this window and pick again on the tide calendar"
                />
              )}
              <iframe
                key={open === 'ride' ? rideSrc : 'stay'}
                title={title}
                src={open === 'ride' ? rideSrc : BOOKING.stay}
                className="book-card__frame"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { RIDES_BOOKING_PATH, scrollToBookRides };
