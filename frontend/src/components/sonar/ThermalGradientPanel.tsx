import type { MapDeployment } from '../../types';
import type { WeatherSnapshot } from '../../types';
import { StructureMarkersList } from './StructureMarkersList';

export interface ThermalGradientPanelProps {
  weather: WeatherSnapshot | null;
  structures: MapDeployment[];
  selectedStructureId?: string | null;
  onStructureSelect?: (structure: MapDeployment) => void;
}

export function ThermalGradientPanel({
  weather,
  structures,
  selectedStructureId,
  onStructureSelect,
}: ThermalGradientPanelProps): JSX.Element {
  const surface = weather?.current.waterTempC ?? weather?.current.airTempC ?? 21.4;
  const thermocline = Math.round((surface - 4.6) * 10) / 10;
  const bottom = Math.round((surface - 9.3) * 10) / 10;

  return (
    <div className="glass-panel sonar-inner-glow bg-surface-container-low/60 rounded-lg p-md flex-1 overflow-hidden min-h-0 flex flex-col">
      <div className="flex justify-between items-center mb-md border-b border-outline-variant/30 pb-xs">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant">THERMAL_GRADIENT</h3>
      </div>
      <div className="space-y-md">
        <TempRow label="SURFACE" value={surface} tone="orange" width="90%" />
        <TempRow label="THERMOCLINE (12m)" value={thermocline} tone="cyan" width="70%" />
        <TempRow label={`BOTTOM (${Math.round(surface * 2)}m)`} value={bottom} tone="tertiary" width="45%" />
      </div>
      <div className="mt-xl pt-md border-t border-outline-variant/20 flex-1 min-h-0 overflow-y-auto">
        <h4 className="font-label-caps text-[10px] text-on-surface-variant mb-sm uppercase">
          Structure Markers
        </h4>
        <StructureMarkersList
          structures={structures}
          selectedId={selectedStructureId}
          onSelect={onStructureSelect}
        />
      </div>
    </div>
  );
}

function TempRow({
  label,
  value,
  tone,
  width,
}: {
  label: string;
  value: number;
  tone: 'orange' | 'cyan' | 'tertiary';
  width: string;
}): JSX.Element {
  const valueClass =
    tone === 'orange' ? 'text-primary' : tone === 'cyan' ? 'text-secondary-container' : 'text-tertiary-container';
  const barClass =
    tone === 'orange'
      ? 'bg-primary shadow-[0_0_10px_rgba(255,198,139,0.4)]'
      : tone === 'cyan'
        ? 'bg-secondary-container shadow-[0_0_10px_rgba(0,244,254,0.4)]'
        : 'bg-tertiary-container shadow-[0_0_10px_rgba(0,195,253,0.4)]';

  return (
    <div className="space-y-xs">
      <div className="flex justify-between font-label-caps text-[11px] text-on-surface">
        <span>{label}</span>
        <span className={valueClass}>{value.toFixed(1)}°C</span>
      </div>
      <div className="h-2 w-full bg-surface-container-highest rounded-xs overflow-hidden">
        <div className={`h-full ${barClass}`} style={{ width }} />
      </div>
    </div>
  );
}
