import type { WeatherSnapshot } from '../../types';

const BAR_HEIGHTS = [40, 60, 45, 85, 70, 50, 30];

export interface DepthScanPanelProps {
  weather: WeatherSnapshot | null;
}

export function DepthScanPanel({ weather }: DepthScanPanelProps): JSX.Element {
  const depthM = weather
    ? Math.round((weather.current.swellM * 12 + 28) * 10) / 10
    : 42.8;

  return (
    <div className="glass-panel sonar-inner-glow bg-surface-container-low/60 rounded-lg p-md flex flex-col">
      <div className="flex justify-between items-center mb-md border-b border-outline-variant/30 pb-xs">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant">DEPTH_SCAN</h3>
        <span className="font-data-sm text-[10px] text-secondary-container animate-pulse">LIVE_FEED</span>
      </div>
      <div className="flex items-end gap-md mb-lg">
        <span className="font-headline-lg text-secondary-container leading-none">{depthM}</span>
        <span className="font-label-caps text-on-surface-variant mb-sm">METERS</span>
      </div>
      <div className="h-32 w-full flex items-end gap-1 px-1">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="bg-secondary-container/30 w-full border-t border-secondary-container/50"
            style={{
              height: `${h}%`,
              boxShadow: h > 80 ? '0 0 15px rgba(0,244,254,0.3)' : undefined,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-sm font-data-sm text-[10px] text-on-surface-variant">
        <span>T-5 MIN</span>
        <span>CURRENT_TIME</span>
      </div>
    </div>
  );
}
