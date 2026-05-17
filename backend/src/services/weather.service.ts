import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { getSolunarForDate, isSolunarWindow } from '../utils/solunar';
import * as tripService from './trip.service';
import {
  geocodeLocation,
  reverseGeocode,
  fetchForecast,
  fetchMarine,
  fetchMarineHistory,
  type HourlyForecast,
  type HourlyMarine,
} from './openmeteo.client';
import { buildTideMapFromMarine, type TideHour, type TideTrend } from './tide.client';

export type WeatherCondition = 'CLEAR' | 'OVERCAST' | 'STORM' | 'FOG';

export interface ForecastHour {
  time: string;
  tempC: number;
  windKts: number;
  pressureHpa: number;
  swellM: number;
  condition: WeatherCondition;
  tideM: number | null;
  tideTrend: TideTrend | null;
  moonPhase: string;
  lunarDay: number;
  sunrise: string;
  sunset: string;
  fishActivity: number;
  fishActivityLabel: string;
}

export interface WeatherSnapshot {
  location: { name: string; lat: number; lon: number };
  current: {
    windKts: number;
    windDirection: string;
    pressureHpa: number;
    airTempC: number;
    waterTempC: number | null;
    swellM: number;
    cloudCoverPct: number;
    condition: WeatherCondition;
  };
  forecast: ForecastHour[];
  seaTempHistory: { labels: string[]; values: number[] };
  seaTemp24h: { labels: string[]; values: number[] };
  clarityPct: number;
  sectorLabel: string;
  advisory: { severity: 'moderate' | 'high'; message: string } | null;
  solunarSummary?: string;
  usedDefaultLocation?: boolean;
  usedDeviceLocation?: boolean;
}

export interface WeatherQuery {
  location?: string;
  lat?: number;
  lon?: number;
  tripId?: string;
  userId?: string;
}

interface ResolvedCoords {
  lat: number;
  lon: number;
  name: string;
  usedDefault: boolean;
  usedDevice: boolean;
}

const cache = new Map<string, { expiresAt: number; payload: WeatherSnapshot }>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

function sectorLabelFromName(name: string): string {
  return name.replace(/\s+/g, '_').toUpperCase().slice(0, 32);
}

function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 45 || code === 48) return 'FOG';
  if (code >= 95) return 'STORM';
  if (code >= 61 || (code >= 51 && code <= 57) || (code >= 71 && code <= 77)) return 'STORM';
  if (code >= 2) return 'OVERCAST';
  return 'CLEAR';
}

function computeClarityPct(cloud: number, windKts: number, precipMm: number): number {
  let score = 100;
  score -= Math.min(cloud, 100) * 0.45;
  score -= Math.min(windKts, 40) * 1.2;
  score -= Math.min(precipMm, 20) * 3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx] ?? 'N';
}

function formatHourLabel(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

function isoHourKey(iso: string): string {
  return iso.slice(0, 13);
}

function findCurrentIndex(times: string[]): number {
  const now = Date.now();
  let best = 0;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]!).getTime();
    if (t <= now) best = i;
    else break;
  }
  return best;
}

function formatTimeLabel24(isoTime: string): string {
  const d = new Date(isoTime);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}${m}`;
}

/** Last 24h of marine SST in 8 three-hour buckets for the Weather Ops bar chart. */
function aggregateSeaTemp24h(marine: HourlyMarine): { labels: string[]; values: number[] } {
  const BUCKETS = 8;
  const HOURS_PER_BUCKET = 3;
  const TOTAL_HOURS = BUCKETS * HOURS_PER_BUCKET;

  const startIdx = findCurrentIndex(marine.time);
  const hourly: { label: string; temp: number }[] = [];

  for (let h = 0; h < TOTAL_HOURS; h++) {
    const i = startIdx + h;
    if (i >= marine.time.length) break;
    const temp = marine.sea_surface_temperature[i];
    const time = marine.time[i];
    if (time == null || temp === undefined || temp === null) continue;
    hourly.push({ label: formatTimeLabel24(time), temp });
  }

  if (hourly.length === 0) {
    return { labels: [], values: [] };
  }

  const labels: string[] = [];
  const values: number[] = [];

  for (let b = 0; b < BUCKETS; b++) {
    const chunk = hourly.slice(b * HOURS_PER_BUCKET, (b + 1) * HOURS_PER_BUCKET);
    if (chunk.length === 0) break;
    const avg = chunk.reduce((sum, c) => sum + c.temp, 0) / chunk.length;
    labels.push(chunk[chunk.length - 1]!.label);
    values.push(Math.round(avg * 10) / 10);
  }

  return { labels, values };
}

function aggregateSeaTempHistory(marine: HourlyMarine): { labels: string[]; values: number[] } {
  const byDay = new Map<string, number[]>();
  for (let i = 0; i < marine.time.length; i++) {
    const day = marine.time[i]!.slice(0, 10);
    const temp = marine.sea_surface_temperature[i];
    if (temp === undefined || temp === null) continue;
    const bucket = byDay.get(day) ?? [];
    bucket.push(temp);
    byDay.set(day, bucket);
  }
  const days = [...byDay.keys()].sort().slice(-7);
  return {
    labels: days.map(formatDayLabel),
    values: days.map((day) => {
      const temps = byDay.get(day) ?? [];
      const avg = temps.reduce((a, b) => a + b, 0) / (temps.length || 1);
      return Math.round(avg * 10) / 10;
    }),
  };
}

/**
 * Heuristic fish-activity score: solunar windows, moon phase, tide, wind, pressure.
 * Not a biological survey — tactical estimate for planning.
 */
function computeFishActivity(input: {
  when: Date;
  lat: number;
  lon: number;
  windKts: number;
  pressureHpa: number;
  condition: WeatherCondition;
  tideTrend: TideTrend | null;
  moonPhase: string;
}): { score: number; label: string } {
  let score = 40;
  if (isSolunarWindow(input.when, input.lat, input.lon)) score += 25;
  if (input.moonPhase === 'FULL' || input.moonPhase === 'NEW') score += 15;
  if (input.tideTrend === 'RISING') score += 15;
  if (input.windKts >= 5 && input.windKts <= 18) score += 10;
  if (input.pressureHpa >= 1010 && input.pressureHpa <= 1020) score += 5;
  if (input.condition === 'STORM') score -= 30;
  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW';
  return { score, label };
}

function buildAdvisory(forecast: ForecastHour[]): WeatherSnapshot['advisory'] {
  const bad = forecast.find((f) => f.windKts >= 20 || f.pressureHpa < 1010 || f.condition === 'STORM');
  if (!bad) return null;
  const high = forecast.some((f) => f.windKts >= 28 || f.condition === 'STORM');
  const message = high
    ? `Severe conditions expected around ${bad.time}. Secure gear and avoid offshore deployment.`
    : `Elevated wind or falling pressure around ${bad.time}. Consider returning to harbor before conditions worsen.`;
  return { severity: high ? 'high' : 'moderate', message };
}

function normalizeSnapshot(
  coords: ResolvedCoords,
  forecast: HourlyForecast,
  marine: HourlyMarine,
  marineHistory: HourlyMarine,
  tides: Map<string, TideHour> | null,
): WeatherSnapshot {
  const idx = findCurrentIndex(forecast.time);
  const swell = marine.swell_wave_height[idx] ?? marine.wave_height[idx] ?? 0;
  const waterTemp = marine.sea_surface_temperature[idx] ?? null;
  const cloud = forecast.cloud_cover[idx] ?? 0;
  const wind = forecast.wind_speed_10m[idx] ?? 0;
  const precip = forecast.precipitation[idx] ?? 0;
  const code = forecast.weather_code[idx] ?? 0;

  const todaySolunar = getSolunarForDate(coords.lat, coords.lon, new Date());

  const current = {
    windKts: Math.round(wind * 10) / 10,
    windDirection: windDirectionLabel(forecast.wind_direction_10m[idx] ?? 0),
    pressureHpa: Math.round(forecast.surface_pressure[idx] ?? 0),
    airTempC: Math.round((forecast.temperature_2m[idx] ?? 0) * 10) / 10,
    waterTempC: waterTemp != null ? Math.round(waterTemp * 10) / 10 : null,
    swellM: Math.round(swell * 100) / 100,
    cloudCoverPct: Math.round(cloud),
    condition: weatherCodeToCondition(code),
  };

  const forecastHours: ForecastHour[] = [];
  for (let i = idx + 1; i < Math.min(idx + 7, forecast.time.length); i++) {
    const isoTime = forecast.time[i];
    if (!isoTime) continue;
    const when = new Date(isoTime);
    const solunar = getSolunarForDate(coords.lat, coords.lon, when);
    const tide = tides?.get(isoHourKey(isoTime)) ?? null;
    const fish = computeFishActivity({
      when,
      lat: coords.lat,
      lon: coords.lon,
      windKts: forecast.wind_speed_10m[i] ?? 0,
      pressureHpa: forecast.surface_pressure[i] ?? 0,
      condition: weatherCodeToCondition(forecast.weather_code[i] ?? 0),
      tideTrend: tide?.trend ?? null,
      moonPhase: solunar.moonPhase,
    });

    forecastHours.push({
      time: formatHourLabel(isoTime),
      tempC: Math.round((forecast.temperature_2m[i] ?? 0) * 10) / 10,
      windKts: Math.round((forecast.wind_speed_10m[i] ?? 0) * 10) / 10,
      pressureHpa: Math.round(forecast.surface_pressure[i] ?? 0),
      swellM: Math.round((marine.swell_wave_height[i] ?? marine.wave_height[i] ?? 0) * 100) / 100,
      condition: weatherCodeToCondition(forecast.weather_code[i] ?? 0),
      tideM: tide?.heightM ?? null,
      tideTrend: tide?.trend ?? null,
      moonPhase: solunar.moonPhase,
      lunarDay: solunar.lunarDay,
      sunrise: solunar.sunrise,
      sunset: solunar.sunset,
      fishActivity: fish.score,
      fishActivityLabel: fish.label,
    });
  }

  const solunarSummary = `Moon: ${todaySolunar.moonPhase} (day ${todaySolunar.lunarDay}) · Sunrise ${todaySolunar.sunrise} · Sunset ${todaySolunar.sunset}`;

  return {
    location: { name: coords.name, lat: coords.lat, lon: coords.lon },
    current,
    forecast: forecastHours,
    seaTempHistory: aggregateSeaTempHistory(marineHistory),
    seaTemp24h: aggregateSeaTemp24h(marine),
    clarityPct: computeClarityPct(cloud, wind, precip),
    sectorLabel: sectorLabelFromName(coords.name),
    advisory: buildAdvisory(forecastHours),
    solunarSummary,
    ...(coords.usedDefault ? { usedDefaultLocation: true } : {}),
    ...(coords.usedDevice ? { usedDeviceLocation: true } : {}),
  };
}

async function resolveCoordinates(query: WeatherQuery): Promise<ResolvedCoords> {
  const { weather } = env;

  if (query.lat !== undefined && query.lon !== undefined) {
    const reverse = query.location ? null : await reverseGeocode(query.lat, query.lon);
    return {
      lat: query.lat,
      lon: query.lon,
      name:
        query.location ??
        reverse?.name ??
        `Near ${query.lat.toFixed(2)}°, ${query.lon.toFixed(2)}°`,
      usedDefault: false,
      usedDevice: !query.location && !query.tripId,
    };
  }

  if (query.tripId && query.userId) {
    const trip = await tripService.loadOwnedTrip(query.userId, query.tripId);
    if (trip.latitude != null && trip.longitude != null) {
      return {
        lat: trip.latitude,
        lon: trip.longitude,
        name: trip.location,
        usedDefault: false,
        usedDevice: false,
      };
    }
    query = { ...query, location: trip.location };
  }

  if (query.location?.trim()) {
    const name = query.location.trim();
    const geo =
      (await geocodeLocation(name)) ??
      (await geocodeLocation(`${name}, Mauritius`));
    if (geo) {
      return {
        lat: geo.latitude,
        lon: geo.longitude,
        name: geo.name,
        usedDefault: false,
        usedDevice: false,
      };
    }
    throw AppError.badRequest(
      `Could not find coordinates for "${name}". Try a more specific place name.`,
    );
  }

  throw AppError.badRequest(
    'Location required. Enable device location or provide a location query parameter.',
  );
}

export async function getWeather(query: WeatherQuery): Promise<WeatherSnapshot> {
  const coords = await resolveCoordinates(query);
  const key = cacheKey(coords.lat, coords.lon);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    const cached = hit.payload;
    return {
      ...cached,
      seaTemp24h: cached.seaTemp24h ?? { labels: [], values: [] },
      ...(coords.usedDefault ? { usedDefaultLocation: true } : {}),
      ...(coords.usedDevice ? { usedDeviceLocation: true } : {}),
    };
  }

  const tz = 'auto';

  const [forecastResult, marineResult, historyResult] = await Promise.allSettled([
    fetchForecast(coords.lat, coords.lon, tz),
    fetchMarine(coords.lat, coords.lon, tz),
    fetchMarineHistory(coords.lat, coords.lon, tz, 7),
  ]);

  if (forecastResult.status === 'rejected' || marineResult.status === 'rejected') {
    if (forecastResult.status === 'rejected' && forecastResult.reason instanceof AppError) {
      throw forecastResult.reason;
    }
    if (marineResult.status === 'rejected' && marineResult.reason instanceof AppError) {
      throw marineResult.reason;
    }
    throw AppError.serviceUnavailable('Weather data temporarily unavailable');
  }

  const forecast = forecastResult.value;
  const marine = marineResult.value;
  const marineHistory =
    historyResult.status === 'fulfilled' ? historyResult.value : marine;
  const tides = buildTideMapFromMarine(marine);

  const payload = normalizeSnapshot(coords, forecast, marine, marineHistory, tides);
  cache.set(key, { expiresAt: Date.now() + env.weather.cacheTtlMs, payload });
  return payload;
}
