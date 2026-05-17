import type { ForecastHour, WeatherCondition } from '../../types';

export type ForecastColumnKey =
  | 'time'
  | 'condition'
  | 'temp'
  | 'wind'
  | 'pressure'
  | 'swell'
  | 'tide'
  | 'moonPhase'
  | 'lunarDay'
  | 'sunrise'
  | 'sunset'
  | 'fishActivity';

export const FORECAST_COLUMN_GROUPS: Record<string, ForecastColumnKey[]> = {
  atmospherics: ['time', 'condition', 'temp', 'wind', 'pressure', 'swell'],
  tides: ['tide'],
  lunar: ['moonPhase', 'lunarDay'],
  solar: ['sunrise', 'sunset'],
  fish: ['fishActivity'],
};

export const DEFAULT_FORECAST_COLUMNS: ForecastColumnKey[] = [
  'time',
  'condition',
  'temp',
  'wind',
];

export const ALL_FORECAST_COLUMNS: ForecastColumnKey[] = [
  'time',
  'condition',
  'temp',
  'wind',
  'pressure',
  'swell',
  'tide',
  'moonPhase',
  'lunarDay',
  'sunrise',
  'sunset',
  'fishActivity',
];

export const COLUMN_LABELS: Record<ForecastColumnKey, string> = {
  time: 'TIME',
  condition: 'CONDITION',
  temp: 'TEMP',
  wind: 'WIND',
  pressure: 'PRESSURE',
  swell: 'SWELL',
  tide: 'TIDE',
  moonPhase: 'MOON',
  lunarDay: 'LUNAR DAY',
  sunrise: 'SUNRISE',
  sunset: 'SUNSET',
  fishActivity: 'FISH ACT',
};

const STORAGE_KEY = 'catchlog.forecastColumns';

export function loadForecastColumns(): ForecastColumnKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FORECAST_COLUMNS;
    const parsed = JSON.parse(raw) as ForecastColumnKey[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_FORECAST_COLUMNS;
    return parsed.filter((k) => ALL_FORECAST_COLUMNS.includes(k));
  } catch {
    return DEFAULT_FORECAST_COLUMNS;
  }
}

export function saveForecastColumns(columns: ForecastColumnKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  } catch {
    // ignore
  }
}

function conditionClass(cond: WeatherCondition): string {
  if (cond === 'STORM') return 'text-error';
  if (cond === 'OVERCAST' || cond === 'FOG') return 'text-on-surface-variant';
  return 'text-secondary-container';
}

export function renderForecastCell(key: ForecastColumnKey, row: ForecastHour): string {
  switch (key) {
    case 'time':
      return row.time;
    case 'condition':
      return row.condition;
    case 'temp':
      return `${row.tempC}°C`;
    case 'wind':
      return `${row.windKts} KTS`;
    case 'pressure':
      return `${row.pressureHpa} HPA`;
    case 'swell':
      return `${row.swellM.toFixed(1)} M`;
    case 'tide':
      if (row.tideM == null) return '—';
      return `${row.tideM.toFixed(2)} M ${row.tideTrend ?? ''}`.trim();
    case 'moonPhase':
      return row.moonPhase.replace(/_/g, ' ');
    case 'lunarDay':
      return String(row.lunarDay);
    case 'sunrise':
      return row.sunrise;
    case 'sunset':
      return row.sunset;
    case 'fishActivity':
      return `${row.fishActivity} ${row.fishActivityLabel}`;
    default:
      return '—';
  }
}

export function forecastCellClassName(key: ForecastColumnKey, row: ForecastHour): string {
  if (key === 'time') return 'text-primary';
  if (key === 'condition') return conditionClass(row.condition);
  return 'text-on-surface';
}
