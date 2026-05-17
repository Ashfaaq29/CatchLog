import type { HourlyMarine } from './openmeteo.client';

function isoHourKey(iso: string): string {
  return iso.slice(0, 13);
}

export type TideTrend = 'RISING' | 'FALLING' | 'SLACK';

export interface TideHour {
  heightM: number;
  trend: TideTrend;
}

/**
 * Tide heights from Open-Meteo Marine `sea_level_height_msl` (Copernicus tides model).
 * Global coverage including Mauritius / Indian Ocean — no separate API key.
 */
export function buildTideMapFromMarine(marine: HourlyMarine): Map<string, TideHour> | null {
  const heights = marine.sea_level_height_msl;
  if (!heights?.length || !marine.time.length) return null;

  const map = new Map<string, TideHour>();
  let prevHeight: number | null = null;

  for (let i = 0; i < marine.time.length; i++) {
    const iso = marine.time[i];
    const raw = heights[i];
    if (!iso || raw === undefined || raw === null) continue;

    const heightM = Math.round(raw * 100) / 100;
    const key = isoHourKey(iso);
    let trend: TideTrend = 'SLACK';
    if (prevHeight !== null) {
      const delta = heightM - prevHeight;
      if (delta > 0.02) trend = 'RISING';
      else if (delta < -0.02) trend = 'FALLING';
    }
    map.set(key, { heightM, trend });
    prevHeight = heightM;
  }

  return map.size > 0 ? map : null;
}
