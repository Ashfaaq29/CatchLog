import type { MissionStats } from './logbookUtils';
import type { Trip } from '../../types';
import {
  formatMissionDate,
  locationLabel,
  missionId,
} from './logbookUtils';
import { Icon } from '../ui/Icon';

export interface MissionActiveCardProps {
  trip: Trip;
  stats: MissionStats;
  footer: string;
  onSelect: () => void;
}

export function MissionActiveCard({
  trip,
  stats,
  footer,
  onSelect,
}: MissionActiveCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left glass-panel bg-surface-container-highest/60 rounded-lg p-md border-l-4 border-l-secondary-container shadow-lg"
    >
      <div className="flex justify-between items-start mb-md">
        <div>
          <span className="font-data-sm text-secondary-container bg-secondary-container/10 px-xs rounded">
            ID: {missionId(trip.id)}
          </span>
          <h3 className="font-headline-sm text-headline-sm mt-xs text-on-surface">
            {locationLabel(trip.location)}
          </h3>
        </div>
        <span className="font-data-sm text-on-surface-variant">{formatMissionDate(trip.date)}</span>
      </div>
      <div className="grid grid-cols-3 gap-sm mb-md">
        <StatCell label="CATCHES" value={String(stats.catches)} tone="cyan" />
        <StatCell label="STRIKES" value={String(stats.strikes)} tone="orange" />
        <StatCell label="EFFICIENCY" value={`${stats.efficiency}%`} tone="tertiary" />
      </div>
      <div className="flex items-center gap-sm text-on-surface-variant border-t border-outline-variant/20 pt-sm">
        <Icon name="location_on" className="text-xs" />
        <span className="font-label-caps text-[10px]">{footer}</span>
      </div>
    </button>
  );
}

function StatCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'cyan' | 'orange' | 'tertiary';
}): JSX.Element {
  const valueClass =
    tone === 'cyan'
      ? 'text-secondary-container'
      : tone === 'orange'
        ? 'text-primary'
        : 'text-tertiary';
  return (
    <div className="bg-background/40 p-xs rounded border border-outline-variant/10 text-center">
      <div className="font-label-caps text-[10px] opacity-50">{label}</div>
      <div className={`font-data-lg ${valueClass}`}>{value}</div>
    </div>
  );
}
