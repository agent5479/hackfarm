export const OPEN_RIDE_BOOKING_EVENT = 'hackfarm:open-ride-booking';
export const OPEN_FAREHARBOR_BOOKING_EVENT = 'hackfarm:open-fareharbor-booking';

export interface FareHarborBookingDetail {
  itemId?: string;
  date?: string;
  rideStart?: string;
  title?: string;
  /** When true (default if date is set), show date-lock banner in the booking modal. */
  lockDate?: boolean;
}

export function openRideBooking(): void {
  window.dispatchEvent(new CustomEvent(OPEN_RIDE_BOOKING_EVENT));
}

export function openFareHarborBooking(detail: FareHarborBookingDetail = {}): void {
  window.dispatchEvent(new CustomEvent(OPEN_FAREHARBOR_BOOKING_EVENT, { detail }));
}
