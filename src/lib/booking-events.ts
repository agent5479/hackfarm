export const OPEN_RIDE_BOOKING_EVENT = 'hackfarm:open-ride-booking';

export function openRideBooking(): void {
  window.dispatchEvent(new CustomEvent(OPEN_RIDE_BOOKING_EVENT));
}
