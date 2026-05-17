import type { MapDeployment } from '../../types';
import { Icon } from '../ui/Icon';

export interface StructureMarkersListProps {
  structures: MapDeployment[];
  selectedId?: string | null;
  onSelect?: (structure: MapDeployment) => void;
}

function formatCoord(lat: number, lon: number): string {
  const latH = lat >= 0 ? 'N' : 'S';
  const lonH = lon >= 0 ? 'E' : 'W';
  return `LAT: ${Math.abs(lat).toFixed(2)} ${latH} | LON: ${Math.abs(lon).toFixed(2)} ${lonH}`;
}

export function StructureMarkersList({
  structures,
  selectedId,
  onSelect,
}: StructureMarkersListProps): JSX.Element {
  const items = structures.slice(0, 6);

  if (items.length === 0) {
    return (
      <p className="font-data-sm text-[10px] text-on-surface-variant">No structure markers logged.</p>
    );
  }

  return (
    <ul className="space-y-sm">
      {items.map((s, i) => {
        const label = s.location.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase().slice(0, 24);
        const icon = i % 2 === 0 ? 'water_lux' : 'anchor';
        const iconClass = i % 2 === 0 ? 'text-secondary-container' : 'text-primary';
        const selected = selectedId === s.id;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect?.(s)}
              className={`w-full flex items-center gap-sm glass-panel p-sm rounded text-left transition-colors ${
                selected
                  ? 'bg-secondary-container/15 ring-1 ring-secondary-container/50'
                  : 'bg-surface-container/40 hover:bg-surface-container/70'
              }`}
            >
              <Icon name={icon} className={`${iconClass} text-sm shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="font-label-caps text-[11px] text-on-surface truncate">{label}</p>
                <p className="font-data-sm text-[10px] text-on-surface-variant">{formatCoord(s.lat, s.lon)}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
