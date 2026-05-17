import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { StatusPill } from '../ui/StatusPill';
import { SonarSpinner } from '../ui/Spinner';
import type { WeatherSnapshot } from '../../types';

const SHEAR_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmAJZxua1v8dpqubP3vYNXfor5rUbCgEcY9dy6qTsYxH3WT0ITKAfl_fYKZwPZJHQwpkhRx7rMsMusu7xOmG_fqthH0nhhSigX70Z7HeTlfyTzD05FiM6otVLQX2DU1aZz6pwFwvoB2c63ziD-EN5QIa7rEMxdYf2av_uagBv5GaMa8NDr8EGZNiZIzu6CTkIi8cJmJjmxT_nl87SLMDK7IE0WycxiD8TGcsDPY8g5fzmcRRsXSkjZOlH7UVRcaoLm5nAK8uCJO73k';

export interface AtmosphericShearPanelProps {
  weather: WeatherSnapshot | null;
  loading?: boolean;
  className?: string;
}

export function AtmosphericShearPanel({
  weather,
  loading,
  className,
}: AtmosphericShearPanelProps): JSX.Element {
  if (loading || !weather) {
    return (
      <GlassPanel
        bg="mid"
        padding="md"
        rounded="lg"
        className={`col-span-12 md:col-span-6 h-[400px] flex items-center justify-center ${className ?? ''}`}
      >
        <SonarSpinner label="LOADING SHEAR MAP" embedded compact />
      </GlassPanel>
    );
  }

  const { current } = weather;

  return (
    <section
      className={`col-span-12 md:col-span-6 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/20 p-md h-[400px] flex flex-col rounded-lg ${className ?? ''}`}
    >
      <div className="flex justify-between items-center mb-md shrink-0">
        <div className="flex items-center gap-sm">
          <Icon name="map" className="text-secondary-container text-xl" />
          <span className="font-label-caps text-on-surface uppercase tracking-widest">
            Atmospheric_Shear
          </span>
        </div>
        <div className="flex gap-xs">
          <StatusPill tone="cyan">LIVE</StatusPill>
          <span className="px-xs py-[2px] bg-surface-variant text-on-surface text-[9px] font-label-caps rounded-sm">
            HD
          </span>
        </div>
      </div>

      <div className="flex-1 bg-surface-container-lowest relative rounded-lg overflow-hidden border border-outline-variant/20 min-h-0">
        <img src={SHEAR_MAP} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border-r border-b border-outline" />
          ))}
        </div>
        <div className="absolute bottom-3 left-3 bg-surface-container-high/90 backdrop-blur px-sm py-xs rounded border border-outline-variant/30">
          <p className="font-label-caps text-[9px] text-on-surface-variant">WIND_SHEAR</p>
          <p className="font-data-sm text-secondary-container">
            {current.windKts} KTS · {current.windDirection}
          </p>
        </div>
      </div>
    </section>
  );
}
