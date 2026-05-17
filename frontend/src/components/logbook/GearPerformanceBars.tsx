import type { GearPerformanceRow } from './logbookUtils';

export interface GearPerformanceBarsProps {
  rows: GearPerformanceRow[];
}

export function GearPerformanceBars({ rows }: GearPerformanceBarsProps): JSX.Element {
  return (
    <div className="space-y-md">
      <span className="font-label-caps text-[11px] text-on-surface-variant">GEAR_PERFORMANCE</span>
      {rows.length === 0 ? (
        <p className="font-data-sm text-[10px] text-on-surface-variant">No catch data for gear breakdown.</p>
      ) : (
        <div className="space-y-sm">
          {rows.map((row) => (
            <GearRow key={row.label} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function GearRow({ row }: { row: GearPerformanceRow }): JSX.Element {
  const barClass =
    row.tone === 'cyan'
      ? 'bg-secondary-container'
      : row.tone === 'tertiary'
        ? 'bg-tertiary'
        : 'bg-primary';
  const textClass =
    row.tone === 'cyan'
      ? 'text-secondary-container'
      : row.tone === 'tertiary'
        ? 'text-tertiary'
        : 'text-primary';

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex justify-between text-[10px] font-label-caps">
        <span>{row.label}</span>
        <span className={textClass}>{row.pct}%</span>
      </div>
      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div className={`h-full ${barClass}`} style={{ width: `${row.pct}%` }} />
      </div>
    </div>
  );
}
