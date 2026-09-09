import { PATONS_ROCK } from './location';
import { nzNoon } from './nzTime';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  /** End of civil twilight (sun −6°): last usable evening light. */
  civilDusk: Date;
}

function toJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function solarNoonAndDeclination(julian: number, lon: number) {
  const n = julian - 2451545 + 0.0008;
  const jStar = n - lon / 360;
  const m = (357.5291 + 0.98560028 * jStar) % 360;
  const mRad = (m * Math.PI) / 180;
  const c = 1.9148 * Math.sin(mRad) + 0.02 * Math.sin(2 * mRad) + 0.0003 * Math.sin(3 * mRad);
  const lambda = (m + c + 180 + 102.9372) % 360;
  const lambdaRad = (lambda * Math.PI) / 180;
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(mRad) - 0.0069 * Math.sin(2 * lambdaRad);
  const sinDec = Math.sin(lambdaRad) * Math.sin((23.4397 * Math.PI) / 180);
  const dec = Math.asin(sinDec);
  return { jTransit, dec };
}

/** Solar elevation angle in degrees (sunrise/sunset ≈ −0.833, civil twilight ≈ −6). */
function hourAngle(lat: number, dec: number, elevationDeg: number): number {
  const latRad = (lat * Math.PI) / 180;
  const elevRad = (elevationDeg * Math.PI) / 180;
  const cosHa =
    (Math.sin(elevRad) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec));
  const clamped = Math.min(1, Math.max(-1, cosHa));
  return Math.acos(clamped);
}

function julianToDate(j: number): Date {
  return new Date((j - 2440587.5) * 86400000);
}

/** Sunrise/sunset/civil-dusk instants (UTC). Display with Pacific/Auckland so NZST/NZDT apply. */
export function sunTimesForDate(
  date: Date | string,
  lat = PATONS_ROCK.lat,
  lon = PATONS_ROCK.lon,
): SunTimes {
  const noon = typeof date === 'string' ? nzNoon(date) : date;
  const { jTransit, dec } = solarNoonAndDeclination(toJulian(noon), lon);
  const haSun = hourAngle(lat, dec, -0.833);
  const haCivil = hourAngle(lat, dec, -6);
  const rise = julianToDate(jTransit - (haSun * 180) / Math.PI / 360);
  const set = julianToDate(jTransit + (haSun * 180) / Math.PI / 360);
  const civilDusk = julianToDate(jTransit + (haCivil * 180) / Math.PI / 360);
  return { sunrise: rise, sunset: set, civilDusk };
}

/**
 * True when the ride runs into the evening sunset / civil-twilight window.
 * Tide rides are clamped to daylight, so late placements often end at sunset —
 * those still count as dipping into twilight for beach comfort at Paton's Rock.
 */
export function rideDipsIntoTwilight(
  rideStart: Date,
  rideEnd: Date,
  sunset: Date,
  civilDusk?: Date,
): boolean {
  const twilightEnd = civilDusk ?? sunset;
  // Overlap with [sunset, civil dusk], including rides that end exactly at sunset.
  return rideEnd.getTime() >= sunset.getTime() && rideStart.getTime() < twilightEnd.getTime();
}
