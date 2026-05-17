import { Icon } from '../ui/Icon';
import type { WeatherSnapshot } from '../../types';
import { clarityVisibilityLabel, swellChopLabel } from './weatherUtils';

export interface WeatherTelemetryRowProps {
  weather: WeatherSnapshot;
  className?: string;
}

export function WeatherTelemetryRow({ weather, className }: WeatherTelemetryRowProps): JSX.Element {
  const { current, clarityPct } = weather;
  const visibilityNm = Math.round((clarityPct / 100) * 15 * 10) / 10;

  return (
    <section className={`col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter ${className ?? ''}`}>
      <TelemetryCard
        icon="waves"
        iconClass="text-secondary-container"
        label="BUOY_77A_HEIGHT"
        value={`${current.swellM.toFixed(1)}`}
        unit="M"
        sub={swellChopLabel(current.swellM)}
        subClass="text-secondary-container"
      />
      <TelemetryCard
        icon="thermostat"
        iconClass="text-primary"
        label="AIR_TEMP_INDEX"
        value={`${current.airTempC.toFixed(1)}`}
        unit="°C"
        sub="SURFACE_AIR"
        subClass="text-primary"
      />
      <TelemetryCard
        icon="visibility"
        iconClass="text-secondary-container"
        label="HORIZON_VISIBILITY"
        value={`${visibilityNm.toFixed(1)}`}
        unit="NM"
        sub={clarityVisibilityLabel(clarityPct)}
        subClass="text-secondary-container"
      />
    </section>
  );
}

function TelemetryCard({
  icon,
  iconClass,
  label,
  value,
  unit,
  sub,
  subClass,
}: {
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  unit: string;
  sub: string;
  subClass: string;
}): JSX.Element {
  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant/20 p-sm flex items-center gap-md rounded-lg">
      <div className="w-16 h-16 bg-surface-container-highest flex items-center justify-center shrink-0">
        <Icon name={icon} className={`${iconClass} text-3xl`} />
      </div>
      <div>
        <p className="font-label-caps text-[10px] text-on-surface-variant">{label}</p>
        <p className="font-data-lg text-on-surface">
          {value} <span className="text-xs">{unit}</span>
        </p>
        <p className={`font-label-caps text-[10px] ${subClass}`}>{sub}</p>
      </div>
    </div>
  );
}
