import type { ForecastHour } from '../../types';
import {
  COLUMN_LABELS,
  forecastCellClassName,
  renderForecastCell,
  type ForecastColumnKey,
} from './fieldForecastColumns';

export interface FieldForecastTableProps {
  forecast: ForecastHour[];
  columns: ForecastColumnKey[];
}

export function FieldForecastTable({ forecast, columns }: FieldForecastTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full font-data-sm text-[12px] tracking-widest">
        <thead>
          <tr className="text-left text-on-surface-variant uppercase border-b border-outline-variant/30">
            {columns.map((key) => (
              <th key={key} className="py-sm pr-md whitespace-nowrap">
                {COLUMN_LABELS[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {forecast.map((row) => (
            <tr key={row.time} className="border-b border-outline-variant/15 last:border-0">
              {columns.map((key) => (
                <td key={key} className={`py-sm pr-md whitespace-nowrap ${forecastCellClassName(key, row)}`}>
                  {renderForecastCell(key, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
