import { PATONS_ROCK, PLANNER_DAYS } from './location';

export interface DayWeather {
  date: string;
  maxTempC: number;
  minTempC: number;
  rainMm: number;
  windMaxKmh: number;
  weatherCode: number;
}

export function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Mixed';
}

export function weatherIcon(code: number): string {
  if (code === 0) return '☀';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫';
  if (code <= 57) return '🌦';
  if (code <= 67) return '🌧';
  if (code <= 77) return '❄';
  if (code <= 82) return '🌦';
  if (code <= 99) return '⛈';
  return '🌤';
}

export interface WeatherImpact {
  status: 'rideable' | 'caution' | 'unavailable';
  blocked: boolean;
  caution: boolean;
}

export function weatherImpact(
  day: DayWeather,
  ride: { maxWindKmh: number; maxRainMm: number; minTempC?: number },
  priorStatus: 'rideable' | 'caution' | 'unavailable',
): WeatherImpact {
  let status = priorStatus;
  let blocked = false;
  let caution = false;

  if (day.windMaxKmh > ride.maxWindKmh) {
    status = 'unavailable';
    blocked = true;
  } else if (day.windMaxKmh > ride.maxWindKmh * 0.75) {
    if (status !== 'unavailable') status = 'caution';
    caution = true;
  }

  if (day.rainMm > ride.maxRainMm) {
    status = 'unavailable';
    blocked = true;
  } else if (day.rainMm > ride.maxRainMm * 0.5) {
    if (status !== 'unavailable') status = 'caution';
    caution = true;
  }

  if (ride.minTempC != null && day.maxTempC < ride.minTempC) {
    status = 'unavailable';
    blocked = true;
  }

  return { status, blocked, caution };
}

export async function fetchForecast(): Promise<DayWeather[]> {
  const params = new URLSearchParams({
    latitude: String(PATONS_ROCK.lat),
    longitude: String(PATONS_ROCK.lon),
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max',
    timezone: PATONS_ROCK.timezone,
    forecast_days: String(Math.min(PLANNER_DAYS, 16)),
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather forecast unavailable');
  const data = await res.json();
  const daily = data.daily as {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
  return daily.time.map((date, i) => ({
    date,
    maxTempC: daily.temperature_2m_max[i],
    minTempC: daily.temperature_2m_min[i],
    rainMm: daily.precipitation_sum[i],
    windMaxKmh: daily.windspeed_10m_max[i],
    weatherCode: daily.weathercode[i],
  }));
}
