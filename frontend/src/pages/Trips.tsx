import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { SonarSpinner } from '../components/ui/Spinner';
import { FloatingActionButton } from '../components/layout/FloatingActionButton';
import { NewTripModal } from '../components/trips/NewTripModal';
import { LogCatchModal } from '../components/catches/LogCatchModal';
import { EditCatchModal } from '../components/catches/EditCatchModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import { deleteCatch } from '../services/catch.service';
import { LogbookHeader } from '../components/logbook/LogbookHeader';
import { MissionListPanel } from '../components/logbook/MissionListPanel';
import { MissionReportPanel } from '../components/logbook/MissionReportPanel';
import {
  filterTrips,
  sortTrips,
  uniqueSectors,
  groupTripsBySector,
  type LogbookFilter,
  type LogbookSort,
  type LogbookViewMode,
} from '../components/logbook/logbookUtils';
import { SectorListPanel } from '../components/logbook/SectorListPanel';
import { PlacesManagerModal } from '../components/places/PlacesManagerModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { listTrips, getTrip } from '../services/trip.service';
import { extractErrorMessage } from '../services/api';
import { useWeather } from '../hooks/useWeather';
import type { Catch, Trip, WeatherSnapshot } from '../types';

export function TripsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [catchModalOpen, setCatchModalOpen] = useState(false);
  const [editCatch, setEditCatch] = useState<Catch | null>(null);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [pendingDeleteCatchId, setPendingDeleteCatchId] = useState<string | null>(null);
  const [deletingCatch, setDeletingCatch] = useState(false);
  const [filter, setFilter] = useState<LogbookFilter>('ALL_SECTORS');
  const [sort, setSort] = useState<LogbookSort>('CHRONOLOGICAL');
  const [viewMode, setViewMode] = useState<LogbookViewMode>('BY_MISSION');
  const [sectorsModalOpen, setSectorsModalOpen] = useState(false);
  const [weatherCache, setWeatherCache] = useState<Map<string, WeatherSnapshot | null>>(
    () => new Map(),
  );

  const selectedParam = searchParams.get('trip');

  const loadTrips = useCallback(async (): Promise<Trip[]> => {
    const data = await listTrips();
    setTrips(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init(): Promise<void> {
      try {
        const data = await loadTrips();
        if (cancelled) return;
        if (!searchParams.get('trip') && data.length > 0) {
          setSearchParams({ trip: data[0]!.id }, { replace: true });
        }
      } catch (err) {
        toast.error(extractErrorMessage(err, 'LOGBOOK SYNC FAILED'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [loadTrips, searchParams, setSearchParams]);

  const filteredSorted = useMemo(() => {
    return sortTrips(filterTrips(trips, filter), sort);
  }, [trips, filter, sort]);

  const selectedId = useMemo(() => {
    if (selectedParam && filteredSorted.some((t) => t.id === selectedParam)) {
      return selectedParam;
    }
    return filteredSorted[0]?.id ?? null;
  }, [selectedParam, filteredSorted]);

  const selectedTrip = filteredSorted.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && selectedId !== selectedParam) {
      setSearchParams({ trip: selectedId }, { replace: true });
    }
  }, [selectedId, selectedParam, setSearchParams]);

  useEffect(() => {
    if (!selectedId) {
      setCatches([]);
      return;
    }
    let cancelled = false;
    setReportLoading(true);
    void getTrip(selectedId)
      .then((data) => {
        if (!cancelled) {
          setCatches(data.catches);
          setTrips((prev) =>
            prev.map((t) =>
              t.id === data.trip.id ? { ...t, catchCount: data.catches.length } : t,
            ),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(extractErrorMessage(err, 'MISSION LOAD FAILED'));
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const { data: reportWeather, loading: weatherLoading } = useWeather({
    lat: selectedTrip?.latitude,
    lon: selectedTrip?.longitude,
    location: selectedTrip?.location,
    enabled: Boolean(selectedTrip?.latitude != null && selectedTrip?.longitude != null),
  });

  useEffect(() => {
    if (selectedTrip?.id && reportWeather) {
      setWeatherCache((prev) => new Map(prev).set(selectedTrip.id, reportWeather));
    }
  }, [selectedTrip?.id, reportWeather]);

  const handleSelectTrip = (id: string): void => {
    setSearchParams({ trip: id });
  };

  const handleTripCreated = (trip: Trip): void => {
    setTrips((prev) => [trip, ...prev]);
    setSearchParams({ trip: trip.id });
    setTripModalOpen(false);
  };

  const handleTripUpdated = (updated: Trip): void => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCatchCreated = (item: Catch): void => {
    setCatches((prev) => [item, ...prev]);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === item.trip ? { ...t, catchCount: (t.catchCount ?? 0) + 1 } : t,
      ),
    );
    setCatchModalOpen(false);
  };

  const handleCatchUpdated = (item: Catch): void => {
    setCatches((prev) => prev.map((c) => (c.id === item.id ? item : c)));
    setEditCatch(null);
  };

  const handleCatchRemoved = (catchId: string): void => {
    setCatches((prev) => prev.filter((c) => c.id !== catchId));
    setTrips((prev) =>
      prev.map((t) =>
        t.id === selectedId ? { ...t, catchCount: Math.max(0, (t.catchCount ?? 1) - 1) } : t,
      ),
    );
    setEditCatch(null);
  };

  const confirmDeleteCatch = async (): Promise<void> => {
    if (!pendingDeleteCatchId) return;
    setDeletingCatch(true);
    try {
      await deleteCatch(pendingDeleteCatchId);
      handleCatchRemoved(pendingDeleteCatchId);
      toast.success('CATCH DELETED');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'DELETE FAILED'));
    } finally {
      setDeletingCatch(false);
      setPendingDeleteCatchId(null);
    }
  };

  const handleTripDeleted = (tripId: string): void => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setCatches([]);
    setEditTrip(null);
    const remaining = trips.filter((t) => t.id !== tripId);
    if (remaining[0]) setSearchParams({ trip: remaining[0].id });
    else setSearchParams({});
  };

  const sectors = useMemo(() => uniqueSectors(trips), [trips]);
  const sectorGroups = useMemo(() => groupTripsBySector(filteredSorted), [filteredSorted]);

  return (
    <AppShell
      onLogCatch={() => {
        if (!selectedId) {
          toast('SELECT A MISSION FIRST');
          return;
        }
        setCatchModalOpen(true);
      }}
    >
      <section className="col-span-12 flex flex-col gap-gutter">
        <LogbookHeader
          tripCount={trips.length}
          sectors={sectors}
          filter={filter}
          sort={sort}
          viewMode={viewMode}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onViewModeChange={setViewMode}
          onManageSectors={() => setSectorsModalOpen(true)}
          onNewTrip={() => setTripModalOpen(true)}
        />

        {loading ? (
          <GlassPanel bg="mid" rounded="xl" padding="lg">
            <SonarSpinner label="LOADING MISSION ARCHIVE" embedded compact />
          </GlassPanel>
        ) : trips.length === 0 ? (
          <GlassPanel bg="mid" rounded="xl" padding="lg" className="flex flex-col items-center gap-md py-xl text-center">
            <Icon name="explore_off" className="text-5xl text-on-surface-variant" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">No deployments logged</h2>
            <p className="font-body-md text-on-surface-variant max-w-md">
              Log your first trip to start building the operator logbook.
            </p>
            <Button variant="primary" onClick={() => setTripModalOpen(true)}>
              Log First Trip
            </Button>
          </GlassPanel>
        ) : filteredSorted.length === 0 ? (
          <GlassPanel bg="mid" rounded="xl" padding="lg" className="text-center">
            <p className="text-on-surface-variant">No missions in this sector filter.</p>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-12 gap-lg">
            {viewMode === 'BY_MISSION' ? (
              <MissionListPanel
                trips={filteredSorted}
                selectedId={selectedId}
                catches={catches}
                reportLoading={reportLoading}
                weatherByTripId={weatherCache}
                onSelect={handleSelectTrip}
              />
            ) : (
              <SectorListPanel
                groups={sectorGroups}
                selectedId={selectedId}
                onSelect={handleSelectTrip}
              />
            )}
            <MissionReportPanel
              trip={selectedTrip}
              catches={catches}
              loading={reportLoading}
              weather={reportWeather}
              weatherLoading={weatherLoading}
              onTripUpdated={handleTripUpdated}
              onEditTrip={setEditTrip}
              onCatchEdit={(id) => setEditCatch(catches.find((c) => c.id === id) ?? null)}
              onCatchDelete={setPendingDeleteCatchId}
            />
          </div>
        )}
      </section>

      {selectedId && (
        <FloatingActionButton
          onClick={() => setCatchModalOpen(true)}
          icon="add"
          label="Log Catch"
        />
      )}

      <NewTripModal
        open={tripModalOpen}
        onClose={() => setTripModalOpen(false)}
        onCreated={handleTripCreated}
      />

      <LogCatchModal
        open={catchModalOpen}
        defaultTripId={selectedId ?? undefined}
        trips={trips}
        onClose={() => setCatchModalOpen(false)}
        onCreated={handleCatchCreated}
      />

      <EditCatchModal
        open={editCatch != null}
        catchItem={editCatch}
        onClose={() => setEditCatch(null)}
        onUpdated={handleCatchUpdated}
        onDeleted={handleCatchRemoved}
      />

      <EditTripModal
        open={editTrip != null}
        trip={editTrip}
        onClose={() => setEditTrip(null)}
        onUpdated={handleTripUpdated}
        onDeleted={handleTripDeleted}
      />

      <PlacesManagerModal open={sectorsModalOpen} onClose={() => setSectorsModalOpen(false)} />

      <ConfirmModal
        open={pendingDeleteCatchId != null}
        onClose={() => setPendingDeleteCatchId(null)}
        onConfirm={() => void confirmDeleteCatch()}
        loading={deletingCatch}
        subtitle="// CONFIRM PURGE"
        title="Delete catch"
        message="This will permanently delete this catch record from the mission log."
        confirmLabel="Delete catch"
        cancelLabel="Abort"
      />
    </AppShell>
  );
}
