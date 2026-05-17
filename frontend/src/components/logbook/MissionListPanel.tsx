import type { Catch, Trip } from '../../types';
import type { WeatherSnapshot } from '../../types';
import { MissionActiveCard } from './MissionActiveCard';
import { MissionCollapsedCard } from './MissionCollapsedCard';
import { computeMissionStats, missionFooter } from './logbookUtils';
import { SonarSpinner } from '../ui/Spinner';

export interface MissionListPanelProps {
  trips: Trip[];
  selectedId: string | null;
  catches: Catch[];
  reportLoading: boolean;
  weatherByTripId: Map<string, WeatherSnapshot | null>;
  onSelect: (id: string) => void;
}

export function MissionListPanel({
  trips,
  selectedId,
  catches,
  reportLoading,
  weatherByTripId,
  onSelect,
}: MissionListPanelProps): JSX.Element {
  const selected = trips.find((t) => t.id === selectedId);
  const others = trips.filter((t) => t.id !== selectedId);

  const stats =
    selected && selectedId && !reportLoading
      ? computeMissionStats(catches)
      : selected
        ? computeMissionStats(
            Array.from({ length: selected.catchCount ?? 0 }, (_, i) => ({
              id: `p-${i}`,
              trip: selected.id,
              user: '',
              fishType: '—',
              notes: '',
              createdAt: selected.date,
            })),
          )
        : { catches: 0, strikes: 0, efficiency: 0 };

  const footer = selected
    ? missionFooter(selected, weatherByTripId.get(selected.id))
    : '';

  return (
    <section className="col-span-12 lg:col-span-5 space-y-md">
      <div className="font-label-caps text-on-surface-variant text-[10px] tracking-widest mb-sm opacity-50 uppercase">
        Active Log Session
      </div>

      {selected ? (
        <MissionActiveCard
          trip={selected}
          stats={stats}
          footer={footer}
          onSelect={() => onSelect(selected.id)}
        />
      ) : (
        <div className="glass-panel rounded-lg p-md text-center text-on-surface-variant text-sm">
          Select a mission
        </div>
      )}

      {reportLoading && selectedId && (
        <div className="flex justify-center py-sm">
          <SonarSpinner label="SYNCING MISSION DATA" embedded compact />
        </div>
      )}

      {others.map((t) => (
        <MissionCollapsedCard key={t.id} trip={t} onSelect={() => onSelect(t.id)} />
      ))}
    </section>
  );
}
