import type { Catch, Trip, WeatherSnapshot } from '../../types';
import { sectorTagFor } from '../../utils/formatters';

export type LogbookSort = 'CHRONOLOGICAL' | 'CATCH_COUNT';
export type LogbookFilter = 'ALL_SECTORS' | string;
export type LogbookViewMode = 'BY_MISSION' | 'BY_SECTOR';

export interface SectorGroup {
  key: string;
  label: string;
  placeId?: string;
  trips: Trip[];
  totalCatches: number;
}

export interface MissionStats {
  catches: number;
  strikes: number;
  efficiency: number;
}

export interface GearPerformanceRow {
  label: string;
  pct: number;
  tone: 'cyan' | 'tertiary' | 'orange';
}

export interface ChronologicalRow {
  catchId: string;
  time: string;
  species: string;
  weight: string;
  status: 'LOGGED' | 'FAILED';
  isFailed: boolean;
  imageUrl?: string;
}

const LOST_PATTERN = /\b(lost|miss|strike\s*lost|failed)\b/i;

export function missionId(tripId: string): string {
  const tail = tripId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `MSN-${tail || '0000'}`;
}

export function locationLabel(location: string): string {
  return location
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase()
    .slice(0, 32);
}

export function formatMissionDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/ /g, '-')
    .toUpperCase();
}

export function formatLogTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function terrainIcon(seed: string): 'water' | 'waves' | 'landscape' {
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const icons = ['water', 'waves', 'landscape'] as const;
  return icons[hash % icons.length]!;
}

export function computeMissionStats(catches: Catch[]): MissionStats {
  const catchesN = catches.filter((c) => !isFailedStrike(c.notes)).length;
  const strikes = Math.max(catchesN, Math.round(catchesN * 2.3));
  const efficiency =
    catchesN === 0 ? 0 : Math.min(99, Math.round((catchesN / strikes) * 100));
  return { catches: catchesN, strikes, efficiency };
}

export function isFailedStrike(notes?: string): boolean {
  return Boolean(notes && LOST_PATTERN.test(notes));
}

export function gearPerformanceFromCatches(catches: Catch[]): GearPerformanceRow[] {
  const logged = catches.filter((c) => !isFailedStrike(c.notes));
  if (logged.length === 0) return [];

  const counts = new Map<string, number>();
  for (const c of logged) {
    const key = c.fishType.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase().slice(0, 20);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = sorted.reduce((s, [, n]) => s + n, 0) || 1;
  const tones: GearPerformanceRow['tone'][] = ['cyan', 'tertiary', 'orange'];

  return sorted.map(([label, count], i) => ({
    label,
    pct: Math.round((count / total) * 100),
    tone: tones[i] ?? 'orange',
  }));
}

export function chronologicalRows(catches: Catch[]): ChronologicalRow[] {
  return [...catches]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((c) => {
      const failed = isFailedStrike(c.notes);
      return {
        catchId: c.id,
        time: formatLogTime(c.createdAt),
        species: failed ? 'STRIKE_LOST' : c.fishType.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase(),
        weight: failed || c.weight == null ? '--' : `${c.weight.toFixed(1)} KG`,
        status: failed ? ('FAILED' as const) : ('LOGGED' as const),
        isFailed: failed,
        ...(c.imageUrl ? { imageUrl: c.imageUrl } : {}),
      };
    });
}

export function pressureSeriesFromWeather(weather: WeatherSnapshot | null): number[] {
  if (!weather) return [];
  const fromForecast = weather.forecast
    .slice(0, 8)
    .map((f) => f.pressureHpa)
    .filter((v) => v > 0);
  if (fromForecast.length >= 4) return fromForecast;
  const current = weather.current.pressureHpa;
  if (current <= 0) return [];
  return Array.from({ length: 8 }, (_, i) => current - (7 - i) * 0.8);
}

export function formatCoordLine(lat: number, lon: number): string {
  const latH = lat >= 0 ? 'N' : 'S';
  const lonH = lon >= 0 ? 'E' : 'W';
  return `LAT: ${Math.abs(lat).toFixed(4)} ${latH}\nLON: ${Math.abs(lon).toFixed(4)} ${lonH}`;
}

/** Deterministic ~30m jitter per catch index around trip center. */
export function jitterLngLat(
  lat: number,
  lon: number,
  index: number,
  total: number,
): [number, number] {
  if (total <= 1) return [lon, lat];
  const angle = (index / total) * Math.PI * 2;
  const dLat = Math.cos(angle) * 0.00025;
  const dLon = Math.sin(angle) * 0.00025;
  return [lon + dLon, lat + dLat];
}

export function missionFooter(
  trip: Trip,
  weather: WeatherSnapshot | null | undefined,
): string {
  const sector = sectorTagFor(trip.location);
  if (weather) {
    const cond = weather.current.condition.replace(/_/g, '_');
    return `${sector} — ${cond}`;
  }
  if (trip.notes?.trim()) {
    const snippet = trip.notes.trim().slice(0, 24).replace(/\s+/g, '_').toUpperCase();
    return `${sector} — ${snippet}`;
  }
  return `${sector} — OPERATIONAL`;
}

export function filterTrips(trips: Trip[], filter: LogbookFilter): Trip[] {
  if (filter === 'ALL_SECTORS') return trips;
  return trips.filter((t) => sectorTagFor(t.location) === filter);
}

export function sortTrips(trips: Trip[], sort: LogbookSort): Trip[] {
  const copy = [...trips];
  if (sort === 'CATCH_COUNT') {
    return copy.sort((a, b) => (b.catchCount ?? 0) - (a.catchCount ?? 0));
  }
  return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function uniqueSectors(trips: Trip[]): string[] {
  const set = new Set(trips.map((t) => sectorTagFor(t.location)));
  return [...set].sort();
}

export function groupTripsBySector(trips: Trip[]): SectorGroup[] {
  const map = new Map<string, SectorGroup>();
  for (const t of trips) {
    const key = t.placeId ?? `loc:${locationLabel(t.location)}`;
    const label = t.location;
    const existing = map.get(key);
    if (existing) {
      existing.trips.push(t);
      existing.totalCatches += t.catchCount ?? 0;
    } else {
      map.set(key, {
        key,
        label,
        ...(t.placeId ? { placeId: t.placeId } : {}),
        trips: [t],
        totalCatches: t.catchCount ?? 0,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.totalCatches - a.totalCatches);
}

export function nextFilter(current: LogbookFilter, sectors: string[]): LogbookFilter {
  if (current === 'ALL_SECTORS') {
    return sectors[0] ?? 'ALL_SECTORS';
  }
  const idx = sectors.indexOf(current);
  if (idx < 0 || idx >= sectors.length - 1) return 'ALL_SECTORS';
  return sectors[idx + 1]!;
}
