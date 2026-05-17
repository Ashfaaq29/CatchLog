import { AppError } from '../utils/AppError';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const GEO_REVERSE_BASE = 'https://geocoding-api.open-meteo.com/v1/reverse';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';

export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
  }>;
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  surface_pressure: number[];
  weather_code: number[];
  cloud_cover: number[];
  precipitation: number[];
}

export interface HourlyMarine {
  time: string[];
  wave_height: number[];
  swell_wave_height: number[];
  sea_surface_temperature: number[];
  sea_level_height_msl?: number[];
}

interface ForecastApiResponse {
  hourly: HourlyForecast;
}

interface MarineApiResponse {
  hourly: HourlyMarine;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw AppError.serviceUnavailable(`Open-Meteo request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    language: 'en',
  });
  try {
    const res = await fetch(`${GEO_REVERSE_BASE}?${params}`, {
      headers: { Accept: 'application/json' },
    });
    // Open-Meteo returns 404 when no settlement is nearby (common offshore / rural).
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResponse;
    const hit = data.results?.[0];
    if (!hit) return null;
    return {
      name: hit.country ? `${hit.name}, ${hit.country}` : hit.name,
      latitude: hit.latitude,
      longitude: hit.longitude,
      country: hit.country,
    };
  } catch {
    return null;
  }
}

export async function geocodeLocation(query: string, count = 1): Promise<GeoResult | null> {
  const results = await geocodeSuggestions(query, count);
  return results[0] ?? null;
}

export async function geocodeSuggestions(query: string, count = 8): Promise<GeoResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: String(Math.min(Math.max(count, 1), 20)),
    language: 'en',
    format: 'json',
  });
  try {
    const data = await fetchJson<GeocodingResponse>(`${GEO_BASE}?${params}`);
    return (data.results ?? []).map((hit) => ({
      name: hit.country ? `${hit.name}, ${hit.country}` : hit.name,
      latitude: hit.latitude,
      longitude: hit.longitude,
      country: hit.country,
    }));
  } catch {
    return [];
  }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  timezone: string,
): Promise<HourlyForecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    wind_speed_unit: 'kn',
    hourly: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'surface_pressure',
      'weather_code',
      'cloud_cover',
      'precipitation',
    ].join(','),
    forecast_days: '2',
  });
  const data = await fetchJson<ForecastApiResponse>(`${FORECAST_BASE}?${params}`);
  return data.hourly;
}

export async function fetchMarine(
  lat: number,
  lon: number,
  timezone: string,
  pastDays = 0,
): Promise<HourlyMarine> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    cell_selection: 'sea',
    hourly: [
      'wave_height',
      'swell_wave_height',
      'sea_surface_temperature',
      'sea_level_height_msl',
    ].join(','),
    forecast_days: '2',
  });
  if (pastDays > 0) {
    params.set('past_days', String(pastDays));
  }
  const data = await fetchJson<MarineApiResponse>(`${MARINE_BASE}?${params}`);
  return data.hourly;
}

/** Marine hourly SST with `past_days` for history chart. */
export async function fetchMarineHistory(
  lat: number,
  lon: number,
  timezone: string,
  pastDays: number,
): Promise<HourlyMarine> {
  return fetchMarine(lat, lon, timezone, pastDays);
}
