import { useState } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import { axisTicksFromLabels } from './weatherUtils';

export interface WaterTempTrendChartProps {
  labels: string[];
  values: number[];
  loading?: boolean;
  className?: string;
}

const BAR_OPACITY = [20, 30, 40, 50, 60, 40, 60, 40] as const;
const CYAN_OPACITY = [60, 40, 30] as const;

export function WaterTempTrendChart({
  labels,
  values,
  loading,
  className,
}: WaterTempTrendChartProps): JSX.Element {
  const [hovered, setHovered] = useState<number | null>(null);

  if (loading) {
    return (
      <GlassPanel
        bg="mid"
        padding="md"
        rounded="lg"
        className={`h-[400px] flex items-center justify-center ${className ?? ''}`}
      >
        <SonarSpinner label="LOADING WATER TEMP" embedded compact />
      </GlassPanel>
    );
  }

  if (values.length === 0) {
    return (
      <GlassPanel
        bg="mid"
        padding="md"
        rounded="lg"
        className={`h-[400px] flex flex-col ${className ?? ''}`}
      >
        <ChartHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-data-sm text-[11px] text-on-surface-variant">No sea surface temperature data.</p>
        </div>
      </GlassPanel>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.5);
  const axisTicks = axisTicksFromLabels(labels);
  const cyanStart = Math.max(0, values.length - 3);

  return (
    <GlassPanel
      bg="mid"
      padding="md"
      rounded="lg"
      className={`h-[400px] flex flex-col ${className ?? ''}`}
    >
      <ChartHeader />

      <div className="flex-1 bg-surface-container-lowest/50 rounded-lg p-md flex items-end gap-2 border border-outline-variant/10 min-h-0">
        {values.map((value, i) => {
          const heightPct = 25 + ((value - min) / span) * 70;
          const isCyan = i >= cyanStart;
          const isLatest = i === values.length - 1;
          const opacityIdx = isCyan ? i - cyanStart : i;
          const opacity = isCyan
            ? CYAN_OPACITY[Math.min(opacityIdx, CYAN_OPACITY.length - 1)]
            : BAR_OPACITY[Math.min(i, BAR_OPACITY.length - 1)];

          return (
            <div
              key={`${labels[i] ?? i}-${value}`}
              className="flex-1 relative group h-full flex flex-col justify-end"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`w-full border-t transition-all ${
                  isCyan ? 'border-secondary-container' : 'border-primary'
                } ${isLatest ? 'animate-pulse' : ''}`}
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isCyan
                    ? `rgba(0, 244, 254, ${opacity / 100})`
                    : `rgba(255, 198, 139, ${opacity / 100})`,
                }}
              />
              {(hovered === i || isLatest) && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] px-1 font-label-caps whitespace-nowrap z-10">
                  {value.toFixed(1)}°C
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-md grid grid-cols-4 gap-sm text-center shrink-0">
        {axisTicks.map((tick) => (
          <p key={tick} className="font-label-caps text-[9px] text-on-surface-variant">
            {tick}
          </p>
        ))}
      </div>
    </GlassPanel>
  );
}

function ChartHeader(): JSX.Element {
  return (
    <div className="flex justify-between items-center mb-md shrink-0">
      <div className="flex items-center gap-sm">
        <Icon name="show_chart" className="text-primary text-xl" />
        <span className="font-label-caps text-on-surface uppercase tracking-widest">
          Water Temp Trend (24H)
        </span>
      </div>
      <span className="font-data-sm text-on-surface-variant text-[10px]">UPDATE: LIVE</span>
    </div>
  );
}
