import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { SonarForecastHero } from '../components/dashboard/SonarForecastHero';
import { FieldStatsBento } from '../components/dashboard/FieldStatsBento';
import { SeaTemp7DayChart } from '../components/fieldops/SeaTemp7DayChart';
import { FieldForecastPanel } from '../components/fieldops/FieldForecastPanel';
import { TacticalFeed } from '../components/dashboard/TacticalFeed';
import { FloatingActionButton } from '../components/layout/FloatingActionButton';
import { NewTripModal } from '../components/trips/NewTripModal';
import { LogCatchModal } from '../components/catches/LogCatchModal';
import { EditCatchModal } from '../components/catches/EditCatchModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { SonarSpinner } from '../components/ui/Spinner';
import { useAuthStore } from '../context/authStore';
import { getStats, listTrips } from '../services/trip.service';
import { extractErrorMessage } from '../services/api';
import { useWeather } from '../hooks/useWeather';
import type { Stats, Trip, Catch } from '../types';

export function DashboardPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [catchModalOpen, setCatchModalOpen] = useState(false);
  const [editCatch, setEditCatch] = useState<Catch | null>(null);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);

  const latestTrip = trips[0];
  const {
    data: weather,
    loading: weatherLoading,
  } = useWeather({
    enabled: !loading,
    ...(latestTrip?.latitude != null && latestTrip?.longitude != null
      ? {
          lat: latestTrip.latitude,
          lon: latestTrip.longitude,
          location: latestTrip.location,
        }
      : latestTrip?.location
        ? { location: latestTrip.location }
        : {}),
  });

  const refresh = async (): Promise<void> => {
    try {
      const [s, t] = await Promise.all([getStats(), listTrips()]);
      setStats(s);
      setTrips(t);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'TELEMETRY UNAVAILABLE'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onLogCatchPressed = (): void => {
    setCatchModalOpen(true);
  };

  const onTripCreated = (trip: Trip): void => {
    setTrips((prev) => [trip, ...prev]);
    void refresh();
  };

  const onCatchCreated = (catchItem: Catch): void => {
    setStats((prev) =>
      prev
        ? {
            ...prev,
            totalCatches: prev.totalCatches + 1,
            recentCatches: [catchItem, ...prev.recentCatches].slice(0, 5),
          }
        : prev,
    );
    void refresh();
  };

  return (
    <AppShell onLogCatch={onLogCatchPressed} sectorLabel={weather?.sectorLabel}>
      <section className="col-span-12 lg:col-span-8 space-y-gutter">
        {loading ? (
          <GlassPanel bg="mid" emissive="cyan" rounded="xl" padding="lg">
            <SonarSpinner label="LOADING TELEMETRY" embedded compact />
          </GlassPanel>
        ) : (
          <>
            <SonarForecastHero weather={weather} loading={weatherLoading} />
            {weather && weather.forecast.length > 0 && (
              <FieldForecastPanel
                forecast={weather.forecast}
                sectorLabel={weather.sectorLabel}
              />
            )}
            <SeaTemp7DayChart
              labels={weather?.seaTempHistory.labels ?? []}
              values={weather?.seaTempHistory.values ?? []}
              loading={weatherLoading}
            />
            <FieldStatsBento stats={stats} />

            <GlassPanel bg="mid" rounded="xl" padding="lg" className="flex flex-col gap-md">
              <div className="flex items-center justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  <Icon name="menu_book" className="text-secondary-container" />
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Recent Deployments
                  </h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/trips')}>
                  View All →
                </Button>
              </div>
              {trips.length === 0 ? (
                <div className="text-on-surface-variant font-body-md py-md">
                  No deployments yet. Mark your first waypoint to start the logbook.
                </div>
              ) : (
                <ul className="divide-y divide-outline-variant/20">
                  {trips.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${t.id}`)}
                        className="w-full py-sm flex items-center justify-between gap-md hover:bg-surface-bright/20 px-xs rounded transition-colors text-left"
                      >
                        <div className="flex items-center gap-md min-w-0">
                          <Icon name="pin_drop" className="text-secondary-container text-base shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-body-md text-on-surface truncate">
                              {t.location}
                            </span>
                            <span className="font-data-sm text-[10px] text-on-surface-variant tracking-widest">
                              {new Date(t.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="font-data-lg text-primary shrink-0">
                          {t.catchCount ?? 0}
                          <span className="text-[10px] ml-1 text-on-surface-variant">CATCH</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>
          </>
        )}
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
        {!loading && (
          <TacticalFeed
            catches={stats?.recentCatches ?? []}
            trips={trips.slice(0, 5)}
            operatorName={user?.name ?? 'OPERATOR'}
            onEditCatch={setEditCatch}
            onEditTrip={setEditTrip}
          />
        )}
      </aside>

      <FloatingActionButton onClick={onLogCatchPressed} icon="add" label="Log Catch" />

      <NewTripModal
        open={tripModalOpen}
        onClose={() => setTripModalOpen(false)}
        onCreated={onTripCreated}
      />
      <LogCatchModal
        open={catchModalOpen}
        onClose={() => setCatchModalOpen(false)}
        trips={trips}
        onCreated={onCatchCreated}
      />

      <EditCatchModal
        open={editCatch != null}
        catchItem={editCatch}
        onClose={() => setEditCatch(null)}
        onUpdated={() => {
          setEditCatch(null);
          void refresh();
        }}
        onDeleted={() => {
          setEditCatch(null);
          void refresh();
        }}
      />

      <EditTripModal
        open={editTrip != null}
        trip={editTrip}
        onClose={() => setEditTrip(null)}
        onUpdated={(t) => {
          setEditTrip(null);
          setTrips((prev) => prev.map((x) => (x.id === t.id ? t : x)));
          void refresh();
        }}
        onDeleted={() => {
          setEditTrip(null);
          void refresh();
        }}
      />
    </AppShell>
  );
}
