import { useState } from 'react';
import type { SectorGroup } from './logbookUtils';
import { formatMissionDate, locationLabel, missionId } from './logbookUtils';
import { MissionCollapsedCard } from './MissionCollapsedCard';
import { Icon } from '../ui/Icon';

export interface SectorListPanelProps {
  groups: SectorGroup[];
  selectedId: string | null;
  onSelect: (tripId: string) => void;
}

export function SectorListPanel({
  groups,
  selectedId,
  onSelect,
}: SectorListPanelProps): JSX.Element {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = (key: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section className="col-span-12 lg:col-span-5 space-y-md">
      <div className="font-label-caps text-on-surface-variant text-[10px] tracking-widest mb-sm opacity-50 uppercase">
        Sectors // Grouped by place
      </div>

      {groups.length === 0 ? (
        <div className="glass-panel rounded-lg p-md text-center text-on-surface-variant text-sm">
          No sectors in this filter.
        </div>
      ) : (
        groups.map((group) => {
          const isOpen = expanded.has(group.key);
          const hasSelected = group.trips.some((t) => t.id === selectedId);
          return (
            <div
              key={group.key}
              className={`glass-panel rounded-lg border overflow-hidden ${
                hasSelected ? 'border-secondary-container/50' : 'border-outline-variant/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(group.key)}
                className="w-full flex items-center justify-between gap-sm p-md text-left hover:bg-surface-bright/10 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-label-caps text-primary text-xs block truncate">
                    {locationLabel(group.label)}
                  </span>
                  <span className="font-data-sm text-[10px] text-on-surface-variant">
                    {group.trips.length} mission{group.trips.length === 1 ? '' : 's'} ·{' '}
                    {group.totalCatches} catch{group.totalCatches === 1 ? '' : 'es'}
                  </span>
                </div>
                <Icon
                  name={isOpen ? 'expand_less' : 'expand_more'}
                  className="text-on-surface-variant shrink-0"
                />
              </button>
              {isOpen && (
                <div className="border-t border-outline-variant/20 p-sm space-y-xs">
                  {group.trips.map((t) =>
                    t.id === selectedId ? (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelect(t.id)}
                        className="w-full text-left px-sm py-xs rounded bg-secondary-container/10 border border-secondary-container/40"
                      >
                        <span className="font-data-sm text-[11px] text-secondary-container">
                          {missionId(t.id)} · {formatMissionDate(t.date)}
                        </span>
                      </button>
                    ) : (
                      <MissionCollapsedCard key={t.id} trip={t} onSelect={() => onSelect(t.id)} />
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
