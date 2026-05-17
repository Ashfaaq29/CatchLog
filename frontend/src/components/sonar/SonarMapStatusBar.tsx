import type { WeatherSnapshot } from '../../types';

export interface SonarMapStatusBarProps {
  cursor: { lat: number; lon: number } | null;
  weather: WeatherSnapshot | null;
}

function formatCoord(lat: number, lon: number): string {
  const latH = lat >= 0 ? 'N' : 'S';
  const lonH = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latH}, ${Math.abs(lon).toFixed(4)}° ${lonH}`;
}

export function SonarMapStatusBar({ cursor, weather }: SonarMapStatusBarProps): JSX.Element {
  const swellFt = weather ? (weather.current.swellM * 3.281).toFixed(1) : '3.5';
  const seaState =
    weather && weather.current.swellM >= 2
      ? 'ROUGH'
      : weather && weather.current.swellM >= 1
        ? 'MODERATE'
        : 'CALM';
  const sog = weather ? (weather.current.windKts * 0.35 + 2).toFixed(1) : '4.2';

  return (
    <div className="glass-panel bg-surface-container-high/80 rounded-lg px-lg flex items-center gap-xl h-full pointer-events-auto border border-outline-variant/20">
      <div className="flex flex-col">
        <span className="font-label-caps text-[10px] text-on-surface-variant">CURSOR_COORD</span>
        <span className="font-data-sm text-secondary-container">
          {cursor ? formatCoord(cursor.lat, cursor.lon) : '—'}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-caps text-[10px] text-on-surface-variant">SEA_STATE</span>
        <span className="font-data-sm text-primary">
          {seaState} ({swellFt}FT)
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-caps text-[10px] text-on-surface-variant">SPEED_OVER_GROUND</span>
        <span className="font-data-sm text-on-surface">{sog} KTS</span>
      </div>
    </div>
  );
}
