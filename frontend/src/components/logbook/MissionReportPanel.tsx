import type { Catch, Trip } from '../../types';
import type { WeatherSnapshot } from '../../types';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import { BarometricMiniChart } from './BarometricMiniChart';
import { GearPerformanceBars } from './GearPerformanceBars';
import { StrikeMapPanel } from './StrikeMapPanel';
import { ChronologicalLogTable } from './ChronologicalLogTable';
import { PinDeploymentGps } from './PinDeploymentGps';
import { Button } from '../ui/Button';
import {
  chronologicalRows,
  gearPerformanceFromCatches,
  missionId,
} from './logbookUtils';

export interface MissionReportPanelProps {
  trip: Trip | null;
  catches: Catch[];
  loading: boolean;
  weather: WeatherSnapshot | null;
  weatherLoading: boolean;
  onTripUpdated?: (trip: Trip) => void;
  onEditTrip?: (trip: Trip) => void;
  onCatchEdit?: (catchId: string) => void;
  onCatchDelete?: (catchId: string) => void;
}

export function MissionReportPanel({
  trip,
  catches,
  loading,
  weather,
  weatherLoading,
  onTripUpdated,
  onEditTrip,
  onCatchEdit,
  onCatchDelete,
}: MissionReportPanelProps): JSX.Element {
  if (!trip) {
    return (
      <section className="col-span-12 lg:col-span-7 flex items-center justify-center min-h-[400px]">
        <p className="font-data-sm text-on-surface-variant">Select a mission to view the report.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="col-span-12 lg:col-span-7 flex items-center justify-center min-h-[400px]">
        <SonarSpinner label="LOADING MISSION REPORT" />
      </section>
    );
  }

  const gearRows = gearPerformanceFromCatches(catches);
  const logRows = chronologicalRows(catches);
  const hasGps = trip.latitude != null && trip.longitude != null;

  return (
    <section className="col-span-12 lg:col-span-7 space-y-lg">
      <div className="glass-panel bg-surface-container-low/80 rounded-xl p-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-lg opacity-10 pointer-events-none">
          <Icon name="query_stats" className="text-9xl text-on-surface" />
        </div>
        <div className="flex items-center justify-between gap-sm mb-lg relative z-10">
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 bg-secondary-container rounded-sm shadow-[0_0_8px_rgba(0,244,254,0.5)]" />
            <h2 className="font-headline-sm text-headline-sm">
              MISSION_REPORT: {missionId(trip.id)}
            </h2>
          </div>
          {onEditTrip && (
            <Button variant="ghost" size="sm" onClick={() => onEditTrip(trip)} iconLeft={<Icon name="edit" />}>
              Edit mission
            </Button>
          )}
        </div>

        {!hasGps && onTripUpdated && (
          <div className="relative z-10 mb-lg">
            <PinDeploymentGps trip={trip} onUpdated={onTripUpdated} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl relative z-10">
          <BarometricMiniChart weather={weather} loading={weatherLoading} />
          <GearPerformanceBars rows={gearRows} />
        </div>

        <div className="relative z-10">
          <StrikeMapPanel trip={trip} catches={catches} />
        </div>

        <div className="relative z-10">
          <ChronologicalLogTable
            rows={logRows}
            onEdit={onCatchEdit}
            onDelete={onCatchDelete}
          />
        </div>
      </div>
    </section>
  );
}
