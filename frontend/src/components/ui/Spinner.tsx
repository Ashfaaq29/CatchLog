import { classNames } from '../../utils/formatters';
import { SonarTelemetryLoader } from './SonarTelemetryLoader';

export function Spinner({ className }: { className?: string }): JSX.Element {
  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <span className="inline-block w-6 h-6 border-2 border-secondary-container border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export interface SonarSpinnerProps {
  label?: string;
  depth?: string;
  coordinates?: string;
  compact?: boolean;
  embedded?: boolean;
  className?: string;
}

/** Card-style sonar loader for panels fetching API / DB telemetry. */
export function SonarSpinner({
  label = 'SCANNING',
  depth,
  coordinates,
  compact = false,
  embedded = false,
  className,
}: SonarSpinnerProps): JSX.Element {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center w-full',
        embedded ? 'py-md px-sm' : 'py-xl px-md',
        className,
      )}
    >
      <SonarTelemetryLoader
        label={label}
        depth={depth}
        coordinates={coordinates}
        compact={compact}
        embedded={embedded}
      />
    </div>
  );
}
