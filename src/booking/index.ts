/**
 * Future booking applet stub.
 * Will integrate Google Apps Script, weather/tide checks, and horse availability.
 */
export interface BookingRequest {
  rideType: string;
  date: string;
  riders: number;
  experience: string;
}

export async function submitBooking(_request: BookingRequest): Promise<void> {
  throw new Error('Booking applet not yet implemented. Use FareHarbor CTAs for now.');
}
