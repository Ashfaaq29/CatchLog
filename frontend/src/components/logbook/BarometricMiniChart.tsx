import type { WeatherSnapshot } from '../../types';
import { pressureTrendArrow } from '../weather/weatherUtils';
import { pressureSeriesFromWeather } from './logbookUtils';

export interface BarometricMiniChartProps {
  weather: WeatherSnapshot | null;
  loading?: boolean;
}

export function BarometricMiniChart({ weather, loading }: BarometricMiniChartProps): JSX.Element {
  if (loading) {
    return (
      <div className="space-y-md animate-pulse">
        <div className="h-4 w-32 bg-surface-container-highest rounded" />
        <div className="h-32 bg-surface-container-lowest rounded" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="space-y-md">
        <span className="font-label-caps text-[11px] text-on-surface-variant">
          BAROMETRIC_PRESSURE (mbar)
        </span>
        <p className="font-data-sm text-[11px] text-on-surface-variant">
          No coordinates for pressure telemetry.
        </p>
      </div>
    );
  }

  const values = pressureSeriesFromWeather(weather);
  const current = weather.current.pressureHpa;
  const min = values.length > 0 ? Math.min(...values) : current - 4;
  const max = values.length > 0 ? Math.max(...values) : current + 4;
  const span = Math.max(max - min, 2);

  return (
    <div className="space-y-md">
      <div className="flex justify-between items-end">
        <span className="font-label-caps text-[11px] text-on-surface-variant">
          BAROMETRIC_PRESSURE (mbar)
        </span>
        <span className="font-data-sm text-primary">
          {current.toFixed(1)} {pressureTrendArrow(current)}
        </span>
      </div>
      {values.length === 0 ? (
        <p className="font-data-sm text-[11px] text-on-surface-variant">Pressure data unavailable.</p>
      ) : (
        <>
          <div className="h-32 flex items-end gap-1 px-1 border-l border-b border-outline-variant/30">
            {values.map((v, i) => {
              const h = 20 + ((v - min) / span) * 75;
              return (
                <div
                  key={i}
                  className="flex-1 bg-secondary-container/40 hover:bg-secondary-container rounded-t-xs transition-all"
                  style={{ height: `${h}%` }}
                  title={`${v.toFixed(0)} mbar`}
                />
              );
            })}
          </div>
          <div className="flex justify-between font-data-sm text-[10px] opacity-50">
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
          </div>
        </>
      )}
    </div>
  );
}
