import { PATONS_ROCK } from './location';
import { type RideType } from './rides';
import { sunTimesForDate } from './sun';
import { tidesOnDay, type TideExtreme } from './tides';
import { weatherLabel, type DayWeather } from './weather';

export type WindowStatus = 'ok' | 'caution' | 'unsuitable';

export interface RideWindow {
  date: string;
  start: Date;
  end: Date;
  status: WindowStatus;
  reasons: string[];
  summary: string;
  weatherLabel: string;
  lowTide?: Date;
}

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: PATONS_ROCK.timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function pickLowTide(dayTides: TideExtreme[], after: Date, before: Date): TideExtreme | undefined {
  const lows = dayTides.filter((t) => t.type === 'low');
  const inWindow = lows.find((t) => t.time >= after && t.time <= before);
  if (inWindow) return inWindow;
  return lows[0];
}

function tideUsable(low: TideExtreme | undefined, start: Date, end: Date): boolean {
  if (!low) return false;
  const centre = new Date((start.getTime() + end.getTime()) / 2);
  const hours = Math.abs(low.time.getTime() - centre.getTime()) / 3_600_000;
  return hours <= 2.5;
}

export function buildWindows(
  ride: RideType,
  forecast: DayWeather[],
  tides: TideExtreme[],
): RideWindow[] {
  return forecast.map((day) => {
    const noon = new Date(`${day.date}T12:00:00`);
    const sun = sunTimesForDate(noon);
    const dayTides = tidesOnDay(tides, day.date);
    const reasons: string[] = [];
    let status: WindowStatus = 'ok';

    let start: Date;
    let end: Date;
    if (ride.daylight === 'around-sunset') {
      end = addMinutes(sun.sunset, 15);
      start = addMinutes(end, -ride.durationHours * 60);
    } else if (ride.daylight === 'daylight') {
      start = addMinutes(sun.sunrise, ride.sunriseBufferMin);
      end = addMinutes(start, ride.durationHours * 60);
    } else {
      start = addMinutes(sun.sunrise, ride.sunriseBufferMin);
      const low = pickLowTide(dayTides, start, addMinutes(sun.sunset, -30));
      if (low) {
        start = addMinutes(low.time, -ride.durationHours * 30);
        if (start < addMinutes(sun.sunrise, ride.sunriseBufferMin)) {
          start = addMinutes(sun.sunrise, ride.sunriseBufferMin);
        }
      }
      end = addMinutes(start, ride.durationHours * 60);
    }

    const low = pickLowTide(dayTides, start, end);

    if (day.windMaxKmh > ride.maxWindKmh) {
      status = 'unsuitable';
      reasons.push(`Wind ${Math.round(day.windMaxKmh)} km/h`);
    } else if (day.windMaxKmh > ride.maxWindKmh * 0.75) {
      status = 'caution';
      reasons.push(`Breezy ${Math.round(day.windMaxKmh)} km/h`);
    }

    if (day.rainMm > ride.maxRainMm) {
      status = 'unsuitable';
      reasons.push(`${day.rainMm.toFixed(0)} mm rain`);
    } else if (day.rainMm > ride.maxRainMm * 0.5) {
      if (status !== 'unsuitable') status = 'caution';
      reasons.push(`Showers ${day.rainMm.toFixed(1)} mm`);
    }

    if (ride.minTempC != null && day.maxTempC < ride.minTempC) {
      status = 'unsuitable';
      reasons.push(`Cool ${Math.round(day.maxTempC)}°C`);
    }

    if (ride.usesTides) {
      if (!low) {
        if (status !== 'unsuitable') status = 'caution';
        reasons.push('Tide times unavailable');
      } else if (!tideUsable(low, start, end)) {
        status = 'unsuitable';
        reasons.push(`Tide not aligned (${formatClock(low.time)})`);
      } else {
        reasons.push(`Low tide ${formatClock(low.time)}`);
      }
    }

    reasons.unshift(`Sunrise ${formatClock(sun.sunrise)}`);
    if (ride.daylight === 'around-sunset') reasons.unshift(`Sunset ${formatClock(sun.sunset)}`);

    const wx = weatherLabel(day.weatherCode);
    const summary =
      status === 'ok'
        ? `${formatClock(start)}–${formatClock(end)} · ${wx}`
        : status === 'caution'
          ? `${formatClock(start)}–${formatClock(end)} · check conditions`
          : 'Not a good beach window';

    return {
      date: day.date,
      start,
      end,
      status,
      reasons,
      summary,
      weatherLabel: wx,
      lowTide: low?.time,
    };
  });
}
