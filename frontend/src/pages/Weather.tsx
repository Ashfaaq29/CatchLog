import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';
import { FieldForecastPanel } from '../components/fieldops/FieldForecastPanel';
import { TacticalOutlookHero } from '../components/weather/TacticalOutlookHero';
import { StrikeProbabilityPanel } from '../components/weather/StrikeProbabilityPanel';
import { AtmosphericShearPanel } from '../components/weather/AtmosphericShearPanel';
import { WaterTempTrendChart } from '../components/weather/WaterTempTrendChart';
import { WeatherTelemetryRow } from '../components/weather/WeatherTelemetryRow';
import { useWeather } from '../hooks/useWeather';

export function WeatherPage(): JSX.Element {
  const { data: weather, loading, error } = useWeather();

  return (
    <AppShell sectorLabel={weather?.sectorLabel}>
      <section className="col-span-12 flex flex-col gap-gutter">
        <GlassPanel emissive="cyan" bg="mid" rounded="xl" padding="lg">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-md">
            <WeatherHeader locationName={weather?.location.name} />
            <WeatherBadges weather={weather} />
          </div>
          {weather?.usedDeviceLocation && (
            <p className="text-[11px] text-on-surface-variant mt-sm">
              Telemetry synced to your device location.
            </p>
          )}
        </GlassPanel>

        {error && !loading ? (
          <GlassPanel bg="mid" emissive="orange" rounded="xl" padding="lg">
            <p className="font-body-md text-on-surface">{error}</p>
            <p className="text-[11px] text-on-surface-variant mt-sm">
              Allow location access in your browser, or log a trip with a named location to load
              weather for that sector.
            </p>
          </GlassPanel>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-gutter">
              <TacticalOutlookHero weather={weather} loading={loading} />
              <StrikeProbabilityPanel weather={weather} loading={loading} />
              <AtmosphericShearPanel weather={weather} loading={loading} />
              <WaterTempTrendChart
                className="col-span-12 md:col-span-6"
                labels={weather?.seaTemp24h?.labels ?? []}
                values={weather?.seaTemp24h?.values ?? []}
                loading={loading}
              />
              {weather && <WeatherTelemetryRow weather={weather} />}
            </div>

            {weather && weather.forecast.length > 0 && (
              <FieldForecastPanel forecast={weather.forecast} sectorLabel={weather.sectorLabel} />
            )}

            {weather?.advisory && (
              <GlassPanel
                bg="mid"
                emissive="orange"
                rounded="xl"
                padding="lg"
                className="flex items-start gap-md"
              >
                <Icon name="warning" className="text-primary text-2xl shrink-0" />
                <div className="flex flex-col gap-xs">
                  <span className="label-tactical text-primary">// ADVISORY</span>
                  <p className="font-body-md text-on-surface">{weather.advisory.message}</p>
                  <span className="font-data-sm text-[11px] text-on-surface-variant tracking-widest">
                    SEVERITY: {weather.advisory.severity.toUpperCase()}
                  </span>
                </div>
              </GlassPanel>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}

function WeatherHeader({ locationName }: { locationName?: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <span className="label-tactical">// WEATHER OPS</span>
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Atmospheric Telemetry</h1>
      <p className="font-body-md text-on-surface-variant max-w-2xl">
        Real-time conditions for {locationName ?? 'your sector'}. Trigger advisories when wind
        exceeds 20 KTS or pressure drops below 1010 hPa.
      </p>
    </div>
  );
}

function WeatherBadges({
  weather,
}: {
  weather: { sectorLabel: string } | null | undefined;
}): JSX.Element {
  return (
    <div className="flex items-center gap-sm">
      <StatusPill tone="cyan">LIVE FEED</StatusPill>
      {weather && <StatusPill tone="orange">{weather.sectorLabel}</StatusPill>}
    </div>
  );
}
