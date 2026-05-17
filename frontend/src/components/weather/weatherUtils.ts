import type { TideTrend, WeatherCondition, WeatherSnapshot } from '../../types';

const CONDITION_HEADLINE: Record<WeatherCondition, string> = {
  STORM: 'STORM_FRONT DELTA',
  OVERCAST: 'OVERCAST_SECTOR',
  FOG: 'FOG_BANK ALPHA',
  CLEAR: 'CLEAR_SECTOR',
};

export function conditionHeadline(condition: WeatherCondition): string {
  return CONDITION_HEADLINE[condition];
}

export function alertLevel(weather: WeatherSnapshot): 'ELEVATED' | 'CAUTION' | 'NOMINAL' {
  if (weather.advisory) return 'ELEVATED';
  const { windKts, pressureHpa } = weather.current;
  if (windKts > 20 || pressureHpa < 1010) return 'CAUTION';
  return 'NOMINAL';
}

export function pressureTrendArrow(pressureHpa: number): string {
  return pressureHpa >= 1012 ? '→' : '↓';
}

export function swellChopLabel(swellM: number): string {
  if (swellM < 1) return 'LIGHT_CHOP';
  if (swellM < 2.5) return 'MODERATE_CHOP';
  return 'HEAVY_SWELL';
}

export function clarityVisibilityLabel(clarityPct: number): string {
  if (clarityPct >= 80) return 'CLEAR_OPERATIONS';
  if (clarityPct >= 50) return 'REDUCED_VIS';
  return 'LOW_VISIBILITY';
}

export function formatMoonPhase(phase: string): string {
  return phase.replace(/_/g, ' ');
}

export function formatTideCycle(
  tideM: number | null,
  tideTrend: string | null,
): string {
  if (tideM == null) return 'NO TIDE DATA';
  const trend = tideTrend ?? 'SLACK';
  return `${trend} (${tideM.toFixed(1)}m MSL)`;
}

export interface TideWaveState {
  tideM: number | null;
  tideTrend: TideTrend | null;
  /** 0 = low in window, 1 = high in window */
  normalized: number;
  /** SVG surface line Y (viewBox 0–100) */
  surfaceY: number;
  trendLabel: string;
  heightLabel: string;
}

export function getTideWaveState(weather: WeatherSnapshot): TideWaveState {
  const withTide = weather.forecast.filter((h) => h.tideM != null);
  const now = weather.forecast[0];
  const tideM = now?.tideM ?? null;
  const tideTrend = now?.tideTrend ?? null;

  if (tideM == null || withTide.length === 0) {
    return {
      tideM: null,
      tideTrend: null,
      normalized: 0.5,
      surfaceY: 58,
      trendLabel: 'NO DATA',
      heightLabel: '—',
    };
  }

  const heights = withTide.map((h) => h.tideM as number);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  const span = Math.max(max - min, 0.25);
  const normalized = Math.max(0, Math.min(1, (tideM - min) / span));
  const surfaceY = 74 - normalized * 36;

  const trendLabel =
    tideTrend === 'RISING' ? 'RISING' : tideTrend === 'FALLING' ? 'FALLING' : 'SLACK';

  return {
    tideM,
    tideTrend,
    normalized,
    surfaceY,
    trendLabel,
    heightLabel: `${tideM.toFixed(1)}m`,
  };
}

export function bestFishActivity(forecast: WeatherSnapshot['forecast']): {
  score: number;
  hour: string | null;
} {
  if (forecast.length === 0) return { score: 0, hour: null };
  let best = forecast[0]!;
  for (const row of forecast) {
    if (row.fishActivity > best.fishActivity) best = row;
  }
  return { score: best.fishActivity, hour: best.time };
}

/** Map 8 bucket labels to 4 axis ticks (0600, 1200, 1800, 0000 style). */
export function axisTicksFromLabels(labels: string[]): string[] {
  if (labels.length === 0) return ['0600', '1200', '1800', '0000'];
  if (labels.length <= 4) return labels;
  const picks = [0, Math.floor(labels.length / 3), Math.floor((2 * labels.length) / 3), labels.length - 1];
  return picks.map((i) => labels[i] ?? '');
}
