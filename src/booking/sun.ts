import { PATONS_ROCK } from './location';
import { nzNoon } from './nzTime';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
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

function hourAngle(lat: number, dec: number): number {
  const latRad = (lat * Math.PI) / 180;
  const cosHa =
    (Math.sin((-0.833 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec));
  const clamped = Math.min(1, Math.max(-1, cosHa));
  return Math.acos(clamped);
}

function julianToDate(j: number): Date {
  return new Date((j - 2440587.5) * 86400000);
}

/** Sunrise/sunset instants (UTC). Display with Pacific/Auckland so NZST/NZDT apply. */
export function sunTimesForDate(
  date: Date | string,
  lat = PATONS_ROCK.lat,
  lon = PATONS_ROCK.lon,
): SunTimes {
  const noon = typeof date === 'string' ? nzNoon(date) : date;
  const { jTransit, dec } = solarNoonAndDeclination(toJulian(noon), lon);
  const ha = hourAngle(lat, dec);
  const rise = julianToDate(jTransit - (ha * 180) / Math.PI / 360);
  const set = julianToDate(jTransit + (ha * 180) / Math.PI / 360);
  return { sunrise: rise, sunset: set };
}
