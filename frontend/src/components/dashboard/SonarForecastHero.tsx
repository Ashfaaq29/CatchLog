import { GlassPanel } from '../ui/GlassPanel';
import { StatusPill } from '../ui/StatusPill';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import type { WeatherSnapshot } from '../../types';
import { TideWaveVisualization } from './TideWaveVisualization';
import { TideStatusBadge } from './TideStatusBadge';

export interface SonarForecastHeroProps {
  weather: WeatherSnapshot | null;
  loading?: boolean;
}

export function SonarForecastHero({ weather, loading }: SonarForecastHeroProps): JSX.Element {
  if (loading || !weather) {
    return (
      <GlassPanel
        emissive="cyan"
        bg="mid"
        rounded="xl"
        padding="lg"
        className="h-72 md:h-80 flex items-center justify-center"
      >
        <SonarSpinner label="SCANNING FORECAST" embedded compact />
      </GlassPanel>
    );
  }

  const { current, clarityPct, sectorLabel, location } = weather;

  return (
    <GlassPanel
      emissive="cyan"
      bg="mid"
      rounded="xl"
      padding="lg"
      className="relative overflow-hidden h-72 md:h-80 flex flex-col"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <ForecastBackdrop />
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-sm">
        <TideStatusBadge weather={weather} />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-md flex-1 min-h-0">
          <div className="space-y-xs md:space-y-sm min-w-0">
            <StatusPill tone="cyan">ACTIVE MONITORING // {sectorLabel}</StatusPill>
            <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface leading-tight">
              Sonar Forecast
            </h2>
            <p className="text-on-surface-variant font-body-md text-sm md:text-base max-w-md leading-snug">
              Peak feeding window in {location.name}. Water clarity:{' '}
              <span className="font-data-sm text-secondary-container">{clarityPct}%</span>. Barometric
              pressure: <span className="font-data-sm text-primary">{current.pressureHpa} hPa</span>.
              {weather.usedDeviceLocation && (
                <span className="block text-[11px] mt-xs text-on-surface-variant/80">
                  Based on your device location.
                </span>
              )}
              {weather.solunarSummary && (
                <span className="block text-[11px] mt-xs text-secondary-container/90 font-data-sm tracking-wide">
                  {weather.solunarSummary}
                </span>
              )}
            </p>
          </div>

          <div className="shrink-0 self-end md:self-end pb-1">
            <WindReadout windKts={current.windKts} windDirection={current.windDirection} />
          </div>
        </div>
      </div>

      <TideWaveVisualization weather={weather} />
    </GlassPanel>
  );
}

function ForecastBackdrop(): JSX.Element {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      <SonarBackdrop />
    </>
  );
}

function WindReadout({ windKts, windDirection }: { windKts: number; windDirection: string }): JSX.Element {
  return (
    <>
      <div className="flex items-center gap-xs">
        <Icon name="air" className="text-secondary-container text-3xl md:text-4xl" />
        <span className="font-data-lg text-3xl md:text-4xl text-secondary-container leading-none">
          {windKts}
          <span className="text-base md:text-lg ml-1">KTS</span>
        </span>
      </div>
      <span className="font-label-caps text-on-surface-variant tracking-widest mt-xs text-[10px] md:text-xs">
        {windDirection} WIND OPS
      </span>
    </>
  );
}

function SonarBackdrop(): JSX.Element {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="sonar-glow" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stopColor="rgba(0,244,254,0.35)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#sonar-glow)" />
      <g stroke="rgba(0,244,254,0.18)" fill="none" strokeWidth="1">
        <circle cx="640" cy="80" r="40" />
        <circle cx="640" cy="80" r="80" />
        <circle cx="640" cy="80" r="120" />
        <circle cx="640" cy="80" r="160" />
        <circle cx="640" cy="80" r="200" />
      </g>
      <g stroke="rgba(255,184,107,0.15)" fill="none" strokeWidth="0.7">
        <path d="M0,250 Q200,200 400,250 T800,230" />
        <path d="M0,300 Q200,250 400,300 T800,280" />
        <path d="M0,350 Q200,300 400,350 T800,330" />
      </g>
    </svg>
  );
}
