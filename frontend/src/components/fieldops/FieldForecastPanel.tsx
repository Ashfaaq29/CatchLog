import { useState } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { DataChip } from '../ui/StatusPill';
import type { ForecastHour } from '../../types';
import { ColumnPresetDropdown } from './ColumnPresetDropdown';
import { FieldForecastTable } from './FieldForecastTable';
import { loadForecastColumns, type ForecastColumnKey } from './fieldForecastColumns';

export interface FieldForecastPanelProps {
  forecast: ForecastHour[];
  sectorLabel: string;
  title?: string;
}

export function FieldForecastPanel({
  forecast,
  sectorLabel,
  title = '6-HOUR FORECAST',
}: FieldForecastPanelProps): JSX.Element {
  const [columns, setColumns] = useState<ForecastColumnKey[]>(loadForecastColumns);

  return (
    <GlassPanel bg="mid" rounded="xl" padding="lg" className="flex flex-col gap-md">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
          <Icon name="schedule" className="text-secondary-container" />
          {title}
        </h2>
        <div className="flex items-center gap-sm">
          <DataChip>{sectorLabel}</DataChip>
          <ColumnPresetDropdown columns={columns} onChange={setColumns} />
        </div>
      </div>
      <FieldForecastTable forecast={forecast} columns={columns} />
    </GlassPanel>
  );
}
