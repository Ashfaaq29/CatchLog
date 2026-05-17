import { useMemo } from 'react';
import type { WeatherSnapshot } from '../../types';
import { getTideWaveState } from '../weather/weatherUtils';
import { Icon } from '../ui/Icon';
import { classNames } from '../../utils/formatters';

export interface TideStatusBadgeProps {
  weather: WeatherSnapshot;
  className?: string;
}

export function TideStatusBadge({ weather, className }: TideStatusBadgeProps): JSX.Element {
  const state = useMemo(() => getTideWaveState(weather), [weather]);

  const trendIcon =
    state.tideTrend === 'RISING'
      ? 'trending_up'
      : state.tideTrend === 'FALLING'
        ? 'trending_down'
        : 'trending_flat';

  const trendTone =
    state.tideTrend === 'RISING'
      ? 'text-secondary-container border-secondary-container/40 bg-secondary-container/10'
      : state.tideTrend === 'FALLING'
        ? 'text-primary border-primary/40 bg-primary/10'
        : 'text-on-surface-variant border-outline-variant/40 bg-surface-container-low/60';

  return (
    <div
      className={classNames(
        'inline-flex items-center gap-sm px-md py-sm rounded-lg border backdrop-blur-sm',
        trendTone,
        className,
      )}
      aria-label={`Tide ${state.heightLabel} ${state.trendLabel}`}
    >
      <Icon name="waves" className="text-base shrink-0 opacity-90" />
      <span className="font-data-lg text-lg leading-none tracking-tight">{state.heightLabel}</span>
      <span
        className={classNames(
          'font-label-caps text-[10px] tracking-widest flex items-center gap-0.5 pl-sm border-l border-current/30',
        )}
      >
        <Icon name={trendIcon} className="text-sm" />
        {state.trendLabel}
      </span>
    </div>
  );
}
