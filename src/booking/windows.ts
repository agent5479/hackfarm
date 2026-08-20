import { PATONS_ROCK, WEATHER_HORIZON_DAYS } from './location';
import { type RideType } from './rides';
import { buildSunriseDaySchedule, daysFromToday, formatClock } from './schedule';
import { sunTimesForDate } from './sun';
import { highTidesNear, tidesOnDay, type TideExtreme } from './tides';
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
  nearestHighTide?: Date;
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

function scheduleStatusToWindow(status: 'rideable' | 'caution' | 'unavailable'): WindowStatus {
  if (status === 'rideable') return 'ok';
  if (status === 'caution') return 'caution';
  return 'unsuitable';
}

function legacyWindow(ride: RideType, day: DayWeather, tides: TideExtreme[]): RideWindow {
  const sun = sunTimesForDate(day.date);
  const reasons: string[] = [];
  let status: WindowStatus = 'ok';

  let start: Date;
  let end: Date;

  if (ride.daylight === 'around-sunset') {
    end = addMinutes(sun.sunset, 15);
    start = addMinutes(end, -ride.durationHours * 60);
    reasons.unshift(`Sunset ${formatClock(sun.sunset)}`);
  } else {
    start = addMinutes(sun.sunrise, ride.startOffsetMin);
    end = addMinutes(start, ride.durationHours * 60);
  }

  reasons.unshift(`Sunrise ${formatClock(sun.sunrise)}`);

  const applyWeather = daysFromToday(day.date) <= WEATHER_HORIZON_DAYS;
  if (applyWeather) {
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
  }

  let nearestHigh: Date | undefined;
  if (ride.usesTides) {
    const dayTides = tidesOnDay(tides, day.date);
    const highs = highTidesNear(tides, start, end);
    nearestHigh = highs[0]?.time;
    if (!dayTides.length) {
      if (status !== 'unsuitable') status = 'caution';
      reasons.push('Tide times unavailable');
    }
  }

  const wx = weatherLabel(day.weatherCode);
  const summary =
    status === 'ok'
      ? `${formatClock(start)}–${formatClock(end)} · ${wx}`
      : status === 'caution'
        ? `${formatClock(start)}–${formatClock(end)} · check conditions`
        : 'Not a good window';

  return {
    date: day.date,
    start,
    end,
    status,
    reasons,
    summary,
    weatherLabel: wx,
    nearestHighTide: nearestHigh,
  };
}

export function buildWindows(
  ride: RideType,
  forecast: DayWeather[],
  tides: TideExtreme[],
): RideWindow[] {
  if (ride.id === 'sunrise') {
    return forecast.map((day) => {
      const schedule = buildSunriseDaySchedule(day.date, forecast, tides, ride);
      const status = scheduleStatusToWindow(schedule.status);
      const wx = schedule.weatherLabel ?? weatherLabel(day.weatherCode);
      const summary =
        status === 'ok'
          ? `${formatClock(schedule.rideStart)} · ${wx}`
          : status === 'caution'
            ? `${formatClock(schedule.rideStart)} · check conditions`
            : schedule.statusReasons[0] ?? 'Unavailable';

      return {
        date: day.date,
        start: schedule.rideStart,
        end: schedule.rideEnd,
        status,
        reasons: schedule.statusReasons,
        summary,
        weatherLabel: wx,
        nearestHighTide: schedule.nearestHigh,
      };
    });
  }

  return forecast.map((day) => legacyWindow(ride, day, tides));
}
