import type { Stats } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { formatLongDate } from '../../utils/formatters';

export interface FieldStatsBentoProps {
  stats: Stats | null;
}

export function FieldStatsBento({ stats }: FieldStatsBentoProps): JSX.Element {
  const totalTrips = stats?.totalTrips ?? 0;
  const totalCatches = stats?.totalCatches ?? 0;
  const heaviest = stats?.heaviestCatch;
  const top = stats?.topLocation;
  const tripPct = Math.min(100, totalTrips * 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      <GlassPanel emissive="orange" bg="low" rounded="lg" padding="md" className="flex flex-col gap-sm">
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase">
            TOTAL TRIPS
          </span>
          <Icon name="directions_boat" className="text-primary text-base" />
        </div>
        <div className="font-data-lg text-3xl text-primary">{totalTrips}</div>
        <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${tripPct}%` }} />
        </div>
      </GlassPanel>

      <GlassPanel emissive="cyan" bg="low" rounded="lg" padding="md" className="flex flex-col gap-sm">
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase">
            PERSONAL BEST
          </span>
          <Icon name="military_tech" filled className="text-secondary-container text-base animate-pulse" />
        </div>
        <div className="font-data-lg text-3xl text-secondary-container">
          {heaviest ? (
            <>
              {heaviest.weight.toFixed(1)}
              <span className="text-sm ml-1">KG</span>
            </>
          ) : (
            <>
              0.0<span className="text-sm ml-1">KG</span>
            </>
          )}
        </div>
        <div className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
          {heaviest
            ? `${heaviest.fishType.toUpperCase()} • ${formatLongDate(heaviest.date).toUpperCase()}`
            : 'NO DATA YET'}
        </div>
      </GlassPanel>

      <GlassPanel bg="low" rounded="lg" padding="md" className="flex flex-col gap-sm">
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase">
            TOP LOCATION
          </span>
          <Icon name="location_on" className="text-on-surface-variant text-base" />
        </div>
        <div className="font-data-lg text-xl text-on-surface uppercase truncate">
          {top ? top.location.replace(/\s+/g, '_').toUpperCase() : 'NO DEPLOYMENTS'}
        </div>
        <div className="text-[10px] font-label-caps text-secondary-container tracking-widest uppercase">
          {top ? `${top.count} SESSION${top.count === 1 ? '' : 'S'} RECORDED` : '—'}
        </div>
      </GlassPanel>

      <GlassPanel bg="low" rounded="lg" padding="md" className="flex flex-col gap-sm md:col-span-3">
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-on-surface-variant text-[11px] tracking-widest uppercase">
            TOTAL CATCHES LOGGED
          </span>
          <Icon name="set_meal" className="text-primary text-base" />
        </div>
        <div className="font-data-lg text-3xl text-on-surface">
          {totalCatches}
          <span className="text-sm ml-1 text-on-surface-variant">RECORDS</span>
        </div>
      </GlassPanel>
    </div>
  );
}
