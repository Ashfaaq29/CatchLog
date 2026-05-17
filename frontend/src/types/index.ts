export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Place {
  id: string;
  user: string;
  name: string;
  latitude: number;
  longitude: number;
  geocodeLabel?: string;
  notes: string;
  tripCount: number;
  catchCount: number;
  lastFishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  user: string;
  placeId?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  notes: string;
  catchCount?: number;
  createdAt: string;
}

export type WeatherCondition = 'CLEAR' | 'OVERCAST' | 'STORM' | 'FOG';
export type TideTrend = 'RISING' | 'FALLING' | 'SLACK';

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

export interface Catch {
  id: string;
  trip: string;
  user: string;
  fishType: string;
  weight?: number;
  length?: number;
  imageUrl?: string;
  notes: string;
  createdAt: string;
  tripLocation?: string;
  userName?: string;
}

export interface Stats {
  totalTrips: number;
  totalCatches: number;
  heaviestCatch: { weight: number; fishType: string; date: string } | null;
  topLocation: { location: string; count: number } | null;
  recentCatches: Catch[];
}

export interface GalleryResponse {
  items: Catch[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  error: { message: string; code: string; details?: unknown };
}

export interface MapDeployment {
  id: string;
  location: string;
  lat: number;
  lon: number;
  date: string;
  catchCount: number;
}

export interface MapCatchPin {
  id: string;
  fishType: string;
  weight?: number;
  imageUrl?: string;
  lat: number;
  lon: number;
  tripLocation: string;
  userName?: string;
  createdAt: string;
}

export interface SonarMapPayload {
  center: { lat: number; lon: number; label: string };
  deployments: MapDeployment[];
  myCatches: MapCatchPin[];
  publicPings: MapCatchPin[];
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  label: string;
}

export interface GeocodeSuggestion {
  lat: number;
  lon: number;
  label: string;
}
