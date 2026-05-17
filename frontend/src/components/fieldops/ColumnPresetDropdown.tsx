import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { classNames } from '../../utils/formatters';
import {
  ALL_FORECAST_COLUMNS,
  COLUMN_LABELS,
  DEFAULT_FORECAST_COLUMNS,
  FORECAST_COLUMN_GROUPS,
  type ForecastColumnKey,
  saveForecastColumns,
} from './fieldForecastColumns';

const PRESETS: { label: string; keys: ForecastColumnKey[] }[] = [
  { label: 'Atmospherics', keys: FORECAST_COLUMN_GROUPS.atmospherics },
  { label: 'Tides', keys: FORECAST_COLUMN_GROUPS.tides },
  { label: 'Lunar', keys: FORECAST_COLUMN_GROUPS.lunar },
  { label: 'Solar', keys: FORECAST_COLUMN_GROUPS.solar },
  { label: 'Fish activity', keys: FORECAST_COLUMN_GROUPS.fish },
  { label: 'All metrics', keys: ALL_FORECAST_COLUMNS },
];

export interface ColumnPresetDropdownProps {
  columns: ForecastColumnKey[];
  onChange: (columns: ForecastColumnKey[]) => void;
}

export function ColumnPresetDropdown({
  columns,
  onChange,
}: ColumnPresetDropdownProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggleColumn = (key: ForecastColumnKey): void => {
    const next = columns.includes(key)
      ? columns.filter((k) => k !== key)
      : [...columns, key];
    const ordered = ALL_FORECAST_COLUMNS.filter((k) => next.includes(k));
    if (ordered.length === 0) return;
    onChange(ordered);
    saveForecastColumns(ordered);
  };

  const applyPreset = (keys: ForecastColumnKey[]): void => {
    onChange(keys);
    saveForecastColumns(keys);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          'flex items-center gap-xs px-sm py-xs rounded border border-outline-variant/40',
          'font-label-caps text-[10px] tracking-widest text-on-surface-variant',
          'hover:border-secondary-container/50 hover:text-secondary-container transition-colors',
        )}
      >
        <Icon name="tune" className="text-sm" />
        DATA VIEW
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-sm" />
      </button>
      {open && (
        <div
          className={classNames(
            'absolute right-0 top-full mt-xs z-50 min-w-[14rem]',
            'bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-lg p-sm',
          )}
        >
          <p className="font-label-caps text-[9px] text-on-surface-variant mb-xs tracking-widest">
            PRESETS
          </p>
          <div className="flex flex-wrap gap-xs mb-sm">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.keys)}
                className="px-xs py-0.5 rounded text-[9px] font-label-caps tracking-wider border border-outline-variant/30 hover:border-primary/50 text-on-surface-variant hover:text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="font-label-caps text-[9px] text-on-surface-variant mb-xs tracking-widest border-t border-outline-variant/20 pt-sm">
            COLUMNS
          </p>
          <div className="flex flex-col gap-xs max-h-48 overflow-y-auto">
            {ALL_FORECAST_COLUMNS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-sm cursor-pointer font-data-sm text-[11px] text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={columns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="accent-primary"
                />
                {COLUMN_LABELS[key]}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => applyPreset(DEFAULT_FORECAST_COLUMNS)}
            className="mt-sm w-full text-[9px] font-label-caps text-on-surface-variant hover:text-primary"
          >
            Reset default
          </button>
        </div>
      )}
    </div>
  );
}
