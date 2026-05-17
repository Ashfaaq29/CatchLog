import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import type { WeatherSnapshot } from '../../types';
import { bestFishActivity, formatMoonPhase, formatTideCycle } from './weatherUtils';

export interface StrikeProbabilityPanelProps {
  weather: WeatherSnapshot | null;
  loading?: boolean;
  className?: string;
}

export function StrikeProbabilityPanel({
  weather,
  loading,
  className,
}: StrikeProbabilityPanelProps): JSX.Element {
  if (loading || !weather) {
    return (
      <GlassPanel
        bg="mid"
        padding="md"
        rounded="lg"
        className={`col-span-12 lg:col-span-4 h-[400px] flex items-center justify-center ${className ?? ''}`}
      >
        <SonarSpinner label="CALCULATING STRIKE ODDS" embedded compact />
      </GlassPanel>
    );
  }

  const { score } = bestFishActivity(weather.forecast);
  const first = weather.forecast[0];
  const moonPhase = first?.moonPhase ?? '—';
  const tideLabel = first
    ? formatTideCycle(first.tideM, first.tideTrend)
    : 'NO TIDE DATA';
  const solunarPeak = first?.time ? `${first.time} WINDOW` : '—';
  const optimalLabel = score >= 70 ? 'OPTIMAL' : score >= 45 ? 'MODERATE' : 'LOW';

  return (
    <section
      className={`col-span-12 lg:col-span-4 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/20 p-md flex flex-col justify-between h-[400px] rounded-lg ${className ?? ''}`}
    >
      <div>
        <div className="flex items-center gap-sm mb-lg">
          <Icon name="target" className="text-primary text-xl" />
          <span className="font-label-caps text-on-surface uppercase tracking-widest">
            Strike Probability
          </span>
        </div>
        <div className="relative h-48 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-surface-variant border-t-primary shadow-[0_0_20px_rgba(255,198,139,0.2)] flex flex-col items-center justify-center">
              <span className="font-headline-lg text-primary">{score}%</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{optimalLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-sm">
        <InfoRow label="MOON PHASE" value={formatMoonPhase(moonPhase)} />
        <InfoRow label="TIDE CYCLE" value={tideLabel} />
        <InfoRow label="SOLUNAR PEAK" value={solunarPeak} highlight />
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}): JSX.Element {
  return (
    <div className="flex justify-between items-center bg-surface-container-high p-sm rounded border border-outline-variant/10 gap-sm">
      <span className="font-label-caps text-[10px] opacity-70 shrink-0">{label}</span>
      <span
        className={`font-data-sm text-right truncate ${highlight ? 'text-primary' : 'text-on-surface'}`}
      >
        {value}
      </span>
    </div>
  );
}
