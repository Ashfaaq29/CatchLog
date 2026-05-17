import { useMemo } from 'react';
import type { WeatherSnapshot } from '../../types';
import { getTideWaveState } from '../weather/weatherUtils';
import { classNames } from '../../utils/formatters';

export interface TideWaveVisualizationProps {
  weather: WeatherSnapshot;
}

function wavePaths(surfaceY: number): { fill: string; line: string } {
  const y = surfaceY;
  const fill = `M0,${y} C150,${y - 40} 350,${y + 40} 500,${y} C650,${y - 40} 850,${y + 40} 1000,${y} L1200,${y} L1200,100 L0,100 Z`;
  const line = `M0,${y + 10} C200,${y - 20} 350,${y + 30} 550,${y + 10} C700,${y - 10} 900,${y + 30} 1050,${y + 10} L1200,${y + 10}`;
  return { fill, line };
}

export function TideWaveVisualization({ weather }: TideWaveVisualizationProps): JSX.Element {
  const state = useMemo(() => getTideWaveState(weather), [weather]);
  const { fill, line } = wavePaths(state.surfaceY);

  const animClass =
    state.tideTrend === 'RISING'
      ? 'tide-wave-rising'
      : state.tideTrend === 'FALLING'
        ? 'tide-wave-falling'
        : 'tide-wave-slack';

  return (
    <div className="absolute bottom-0 left-0 w-full h-28 md:h-32 pointer-events-none z-[5]">
      <svg
        className={classNames('w-full h-full opacity-60 transition-transform duration-700 ease-out', animClass)}
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d={fill} fill="rgba(0, 244, 254, 0.18)" stroke="rgba(0, 244, 254, 0.55)" strokeWidth="2" />
        <path d={line} fill="none" stroke="rgba(0, 244, 254, 0.35)" strokeWidth="1.5" />
      </svg>

      <div className="absolute bottom-3 right-4 md:right-6 flex flex-col items-end gap-0.5 opacity-70">
        <span className="font-data-sm text-[9px] text-on-surface-variant tracking-widest">HIGH</span>
        <div className="w-1 h-10 rounded-full bg-outline-variant/40 relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-secondary-container/80 rounded-full transition-all duration-700 ease-out"
            style={{ height: `${Math.round(state.normalized * 100)}%` }}
          />
        </div>
        <span className="font-data-sm text-[9px] text-on-surface-variant tracking-widest">LOW</span>
      </div>
    </div>
  );
}
