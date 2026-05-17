import type { Trip } from '../../types';
import { formatMissionDate, locationLabel, terrainIcon } from './logbookUtils';
import { Icon } from '../ui/Icon';

export interface MissionCollapsedCardProps {
  trip: Trip;
  onSelect: () => void;
}

export function MissionCollapsedCard({ trip, onSelect }: MissionCollapsedCardProps): JSX.Element {
  const icon = terrainIcon(trip.location);
  const catches = trip.catchCount ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full glass-panel bg-surface-container-low/40 rounded-lg p-md hover:bg-surface-container-high/60 transition-all text-left group"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-md min-w-0">
          <div className="w-10 h-10 rounded bg-outline-variant/20 flex items-center justify-center text-outline shrink-0">
            <Icon name={icon} />
          </div>
          <div className="min-w-0">
            <h4 className="font-label-caps text-on-surface truncate">{locationLabel(trip.location)}</h4>
            <span className="font-data-sm text-xs opacity-50">
              {formatMissionDate(trip.date)} | {catches} CATCH{catches === 1 ? '' : 'ES'}
            </span>
          </div>
        </div>
        <Icon
          name="chevron_right"
          className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0"
        />
      </div>
    </button>
  );
}
