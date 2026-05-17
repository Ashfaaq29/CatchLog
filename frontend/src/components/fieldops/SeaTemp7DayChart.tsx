import { useState } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { StatusPill } from '../ui/StatusPill';
import { SonarSpinner } from '../ui/Spinner';

export interface SeaTemp7DayChartProps {
  labels: string[];
  values: number[];
  loading?: boolean;
}

const VIEW_W = 560;
const VIEW_H = 180;
const PAD_X = 32;
const PAD_Y = 28;
const MIN_Y_SPAN = 2;

export function SeaTemp7DayChart({ labels, values, loading }: SeaTemp7DayChartProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading || values.length === 0) {
    return (
      <GlassPanel bg="high" rounded="xl" padding="lg" className="min-h-[220px] flex items-center justify-center">
        <SonarSpinner label="LOADING SEA TEMP HISTORY" embedded compact />
      </GlassPanel>
    );
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const span = Math.max(dataMax - dataMin, MIN_Y_SPAN);
  const yMin = dataMin - span * 0.15;
  const yMax = dataMax + span * 0.15;
  const yRange = yMax - yMin;

  const chartW = VIEW_W - PAD_X * 2;
  const chartH = VIEW_H - PAD_Y * 2;

  const points = values.map((v, i) => {
    const x = PAD_X + (i / Math.max(values.length - 1, 1)) * chartW;
    const y = PAD_Y + chartH - ((v - yMin) / yRange) * chartH;
    return { x, y, value: v, label: labels[i] ?? '' };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_Y + chartH} L ${points[0].x} ${PAD_Y + chartH} Z`;
  const latest = values[values.length - 1];
  const active = activeIndex !== null ? points[activeIndex] : null;

  const yTicks = [yMin, yMin + yRange / 2, yMax].map((v) => ({
    value: v,
    y: PAD_Y + chartH - ((v - yMin) / yRange) * chartH,
  }));

  return (
    <GlassPanel bg="high" rounded="xl" padding="lg" className="flex flex-col gap-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Sea Temp — 7 Day</h3>
        <div className="flex gap-sm">
          <StatusPill tone="orange">{latest.toFixed(1)}°C TODAY</StatusPill>
          <StatusPill tone="cyan">LIVE</StatusPill>
        </div>
      </div>

      <div className="relative w-full max-w-3xl mx-auto">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Seven day sea surface temperature chart"
        >
          <defs>
            <linearGradient id="sea-temp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,244,254,0.35)" />
              <stop offset="100%" stopColor="rgba(0,244,254,0.02)" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={PAD_X}
                y1={tick.y}
                x2={VIEW_W - PAD_X}
                y2={tick.y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={PAD_X - 6}
                y={tick.y + 3}
                textAnchor="end"
                className="fill-on-surface-variant/60"
                fontSize="9"
                fontFamily="var(--font-data, monospace)"
              >
                {tick.value.toFixed(1)}°
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#sea-temp-fill)" />
          <path d={linePath} fill="none" stroke="rgba(0,244,254,0.85)" strokeWidth="2" strokeLinejoin="round" />

          {points.map((p, i) => {
            const isActive = activeIndex === i;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: ${p.value.toFixed(1)} degrees Celsius`}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5 : 3}
                  fill={isActive ? '#ffb86b' : '#00f4fe'}
                  stroke={isActive ? '#00f4fe' : 'none'}
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            );
          })}

          {active && (
            <g pointerEvents="none">
              <line
                x1={active.x}
                y1={PAD_Y}
                x2={active.x}
                y2={PAD_Y + chartH}
                stroke="rgba(0,244,254,0.25)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] px-sm py-xs rounded border border-secondary-container/40 bg-surface-container-high shadow-lg"
            style={{
              left: `${(active.x / VIEW_W) * 100}%`,
              top: `${(active.y / VIEW_H) * 100}%`,
            }}
          >
            <p className="font-label-caps text-[9px] text-on-surface-variant tracking-widest whitespace-nowrap">
              {active.label}
            </p>
            <p className="font-data-sm text-secondary-container text-sm whitespace-nowrap">
              {active.value.toFixed(1)}°C
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between max-w-3xl mx-auto w-full px-8 font-label-caps text-[9px] text-on-surface-variant/70 tracking-widest">
        {labels.map((l) => (
          <span key={l} className="text-center min-w-0 truncate">
            {l}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}
