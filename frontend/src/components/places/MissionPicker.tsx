import { useMemo } from 'react';
import type { Place, Trip } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { formatMissionDate } from '../logbook/logbookUtils';

export interface MissionPickerProps {
  place: Place;
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onNewMission: () => void;
  creating?: boolean;
  disabled?: boolean;
}

export function MissionPicker({
  place,
  trips,
  selectedTripId,
  onSelectTrip,
  onNewMission,
  creating,
  disabled,
}: MissionPickerProps): JSX.Element {
  const missionsAtPlace = useMemo(() => {
    return trips
      .filter(
        (t) =>
          t.placeId === place.id ||
          (t.latitude != null &&
            t.longitude != null &&
            Math.abs(t.latitude - place.latitude) < 0.002 &&
            Math.abs(t.longitude - place.longitude) < 0.002),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips, place]);

  return (
    <div className="flex flex-col gap-md border border-outline-variant/30 rounded-lg p-md bg-surface-container-low/40">
      <div>
        <p className="font-label-caps text-[11px] text-secondary-container">SELECT MISSION</p>
        <p className="font-data-sm text-[10px] text-on-surface-variant mt-xs">
          Sector: {place.name}
        </p>
      </div>

      {missionsAtPlace.length === 0 ? (
        <p className="font-data-sm text-[11px] text-on-surface-variant">
          No missions at this sector yet. Start a new mission below.
        </p>
      ) : (
        <ul className="space-y-xs max-h-36 overflow-y-auto">
          {missionsAtPlace.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectTrip(t.id)}
                className={`w-full text-left px-sm py-xs rounded font-data-sm text-[11px] transition-colors ${
                  selectedTripId === t.id
                    ? 'bg-secondary-container/20 border border-secondary-container/50'
                    : 'hover:bg-surface-container-high border border-transparent'
                }`}
              >
                <span className="font-bold text-on-surface block">
                  {formatMissionDate(t.date)} · {t.catchCount ?? 0} catches
                </span>
                {t.notes && (
                  <span className="text-on-surface-variant text-[10px] line-clamp-1">{t.notes}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="primary"
        size="sm"
        loading={creating}
        disabled={disabled}
        onClick={onNewMission}
        iconLeft={<Icon name="add" />}
      >
        New mission at this sector
      </Button>
    </div>
  );
}
