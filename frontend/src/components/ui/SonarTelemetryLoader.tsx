import { classNames } from '../../utils/formatters';

export interface SonarTelemetryLoaderProps {
  label?: string;
  depth?: string;
  coordinates?: string;
  className?: string;
  /** Smaller radar and text */
  compact?: boolean;
  /** Strip outer card chrome when already inside a GlassPanel */
  embedded?: boolean;
}

export function SonarTelemetryLoader({
  label = 'Syncing Catch-Log',
  depth,
  coordinates,
  className,
  compact = false,
  embedded = false,
}: SonarTelemetryLoaderProps): JSX.Element {
  const showSubText = Boolean(depth || coordinates);

  return (
    <div
      className={classNames(
        'relative flex flex-col items-center overflow-hidden',
        !embedded &&
          'sonar-telemetry-card bg-[#1c1f24] border border-white/[0.03] rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.5)]',
        !embedded && (compact ? 'w-full max-w-[280px] p-lg' : 'w-[320px] p-[30px]'),
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={classNames(
          'sonar-telemetry-radar relative rounded-full border-2 border-secondary-container/10',
          'bg-[radial-gradient(circle,rgba(0,245,255,0.05)_0%,transparent_70%)] mb-lg',
          compact ? 'w-[140px] h-[140px] mb-md' : 'w-[180px] h-[180px] mb-[30px]',
        )}
      >
        <span className="sonar-telemetry-center-dot" />
        <span className="sonar-telemetry-sweep" />
        <span className="sonar-telemetry-ring sonar-telemetry-ring-1" />
        <span className="sonar-telemetry-ring sonar-telemetry-ring-2" />
        <span className="sonar-telemetry-ring sonar-telemetry-ring-3" />
        <span className="sonar-telemetry-blip sonar-telemetry-blip-1" />
        <span className="sonar-telemetry-blip sonar-telemetry-blip-2" />
        <span className="sonar-telemetry-blip sonar-telemetry-blip-3" />
      </div>

      <div className="text-center z-[2]">
        <p
          className={classNames(
            'sonar-telemetry-main-text text-secondary-container uppercase m-0',
            compact ? 'text-[12px] tracking-[0.2em]' : 'text-[14px] tracking-[0.3em]',
          )}
        >
          {label}
        </p>
        {showSubText ? (
          <div
            className={classNames(
              'sonar-telemetry-sub-text flex justify-center gap-md mt-sm text-white/30',
              compact ? 'text-[9px] gap-sm' : 'text-[10px] gap-[15px] mt-xs',
            )}
          >
            {depth ? <span>{depth}</span> : null}
            {coordinates ? (
              <span className="text-primary-container opacity-80">{coordinates}</span>
            ) : null}
          </div>
        ) : (
          <p
            className={classNames(
              'mt-xs text-white/25 font-label-caps text-label-caps tracking-widest animate-pulse',
              compact ? 'text-[9px]' : 'text-[10px]',
            )}
          >
            ACQUIRING SIGNAL
          </p>
        )}
      </div>
    </div>
  );
}
