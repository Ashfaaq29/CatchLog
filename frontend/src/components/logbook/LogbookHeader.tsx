import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import type { LogbookFilter, LogbookSort, LogbookViewMode } from './logbookUtils';
import { nextFilter } from './logbookUtils';

export interface LogbookHeaderProps {
  tripCount: number;
  sectors: string[];
  filter: LogbookFilter;
  sort: LogbookSort;
  viewMode: LogbookViewMode;
  onFilterChange: (f: LogbookFilter) => void;
  onSortChange: (s: LogbookSort) => void;
  onViewModeChange: (m: LogbookViewMode) => void;
  onManageSectors: () => void;
  onNewTrip: () => void;
}

export function LogbookHeader({
  tripCount,
  sectors,
  filter,
  sort,
  onFilterChange,
  onSortChange,
  viewMode,
  onViewModeChange,
  onManageSectors,
  onNewTrip,
}: LogbookHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-md mb-gutter">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-background tracking-tight">
          MISSION_LOGS
        </h1>
        <p className="font-data-sm text-on-surface-variant">
          ARCHIVE :: {tripCount} RECORDED EXCURSION{tripCount === 1 ? '' : 'S'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <FilterPill
          icon="filter_list"
          label={filter === 'ALL_SECTORS' ? 'FILTER: ALL_SECTORS' : `FILTER: ${filter}`}
          onClick={() => onFilterChange(nextFilter(filter, sectors))}
        />
        <FilterPill
          icon="sort"
          label={`SORT: ${sort === 'CHRONOLOGICAL' ? 'CHRONOLOGICAL' : 'CATCH_COUNT'}`}
          tone="primary"
          onClick={() =>
            onSortChange(sort === 'CHRONOLOGICAL' ? 'CATCH_COUNT' : 'CHRONOLOGICAL')
          }
        />
        <FilterPill
          icon="layers"
          label={viewMode === 'BY_MISSION' ? 'VIEW: MISSIONS' : 'VIEW: SECTORS'}
          onClick={() =>
            onViewModeChange(viewMode === 'BY_MISSION' ? 'BY_SECTOR' : 'BY_MISSION')
          }
        />
        <Button variant="ghost" size="sm" onClick={onManageSectors} iconLeft={<Icon name="map" />}>
          Sectors
        </Button>
        <Button variant="primary" size="sm" onClick={onNewTrip} iconLeft={<Icon name="add" />}>
          New Trip
        </Button>
      </div>
    </header>
  );
}

function FilterPill({
  icon,
  label,
  tone = 'cyan',
  onClick,
}: {
  icon: string;
  label: string;
  tone?: 'cyan' | 'primary';
  onClick: () => void;
}): JSX.Element {
  const iconClass = tone === 'primary' ? 'text-primary' : 'text-secondary-container';
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-surface-container-high px-md py-sm rounded border border-outline-variant/30 flex items-center gap-sm hover:bg-surface-bright/30 transition-colors"
    >
      <Icon name={icon} className={`${iconClass} text-sm`} />
      <span className="font-label-caps text-xs">{label}</span>
    </button>
  );
}
