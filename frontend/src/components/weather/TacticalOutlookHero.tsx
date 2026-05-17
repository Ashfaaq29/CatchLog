import type { ReactNode } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { SonarSpinner } from '../ui/Spinner';
import type { WeatherSnapshot } from '../../types';
import { alertLevel, conditionHeadline, pressureTrendArrow } from './weatherUtils';

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwN445-6BWoWNb6u1wqNnjIETv9Z1hVw_RimF0bwYEmvZuWSxKwTnXAQN76lpfRdgYowh7DAPLMJCAs9qtGC1hiKLOs7aj4lYfr01KD6ypbP310aHpOI97zehu3vkOkb81HZoYyRbXAD35LxxTffT828F-vbZOqWVFyBug7xcWkyJU1k9_4XNwBkKbub69kCdsto77-tU2ti8hLE2Yen1NHMyPK8LUS8h16Bo9SRHRhkNaThM_rtrIvxeCFkGAR3Hx4prwkJUXHEiJ';

export interface TacticalOutlookHeroProps {
  weather: WeatherSnapshot | null;
  loading?: boolean;
  className?: string;
}

export function TacticalOutlookHero({
  weather,
  loading,
  className,
}: TacticalOutlookHeroProps): JSX.Element {
  if (loading || !weather) {
    return (
      <GlassPanel
        bg="mid"
        padding="md"
        rounded="lg"
        className={`col-span-12 lg:col-span-8 h-[400px] flex items-center justify-center ${className ?? ''}`}
      >
        <SonarSpinner label="PULLING ATMOSPHERIC DATA" embedded compact />
      </GlassPanel>
    );
  }

  const { current, sectorLabel } = weather;
  const level = alertLevel(weather);
  const water = current.waterTempC ?? current.airTempC;
  const pressureBar = Math.min(100, Math.max(0, ((current.pressureHpa - 990) / 40) * 100));

  return (
    <section
      className={`col-span-12 lg:col-span-8 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/20 p-md relative overflow-hidden h-[400px] rounded-lg ${className ?? ''}`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover opacity-20 grayscale"
        />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-label-caps text-secondary-container tracking-tighter">
              TACTICAL_OUTLOOK_v4.2
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-xs">
              {conditionHeadline(current.condition)}
            </h1>
            <p className="font-label-caps text-[10px] text-on-surface-variant mt-xs">{sectorLabel}</p>
          </div>
          <div className="bg-secondary-container/10 border border-secondary-container/30 p-sm text-right">
            <p className="font-label-caps text-on-surface-variant text-[10px]">ALERT LEVEL</p>
            <p
              className={`font-data-lg ${
                level === 'ELEVATED'
                  ? 'text-primary'
                  : level === 'CAUTION'
                    ? 'text-primary-container'
                    : 'text-secondary-container'
              }`}
            >
              {level}
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-md">
          <MetricTile
            label="BAROMETRIC"
            value={`${current.pressureHpa}`}
            suffix={
              <span className="text-[10px] text-primary">{pressureTrendArrow(current.pressureHpa)}</span>
            }
            border="secondary"
          >
            <div className="h-1 w-full bg-surface-variant mt-sm overflow-hidden">
              <div
                className="h-full bg-secondary-container"
                style={{ width: `${pressureBar}%` }}
              />
            </div>
          </MetricTile>
          <MetricTile
            label="WIND_SHEAR"
            value={`${current.windKts}`}
            suffix={<span className="text-[10px]">KTS</span>}
            sub={`${current.windDirection} DIRECTION`}
            subTone="primary"
            border="primary"
          />
          <MetricTile
            label="HUMIDITY"
            value={`${current.cloudCoverPct}%`}
            sub="CLOUD_COVER"
            border="secondary"
          />
          <MetricTile
            label="TEMP_WATER"
            value={`${water.toFixed(1)}°C`}
            sub="SURFACE_THERM"
            border="primary"
          />
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  suffix,
  sub,
  subTone,
  border,
  children,
}: {
  label: string;
  value: string;
  suffix?: ReactNode;
  sub?: string;
  subTone?: 'primary' | 'muted';
  border: 'primary' | 'secondary';
  children?: ReactNode;
}): JSX.Element {
  const borderClass =
    border === 'primary' ? 'border-l-2 border-primary' : 'border-l-2 border-secondary-container';
  return (
    <div className={`bg-surface-container-highest/40 backdrop-blur-md p-md ${borderClass}`}>
      <p className="font-label-caps text-on-surface-variant text-[10px]">{label}</p>
      <p className="font-data-lg text-on-surface">
        {value} {suffix}
      </p>
      {sub && (
        <p
          className={`font-label-caps text-[10px] ${
            subTone === 'primary' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}
