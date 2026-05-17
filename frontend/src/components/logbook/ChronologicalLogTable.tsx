import type { ChronologicalRow } from './logbookUtils';
import { Icon } from '../ui/Icon';

export interface ChronologicalLogTableProps {
  rows: ChronologicalRow[];
  onEdit?: (catchId: string) => void;
  onDelete?: (catchId: string) => void;
}

export function ChronologicalLogTable({
  rows,
  onEdit,
  onDelete,
}: ChronologicalLogTableProps): JSX.Element {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="mt-lg border-t border-outline-variant/20 pt-lg">
      <div className="font-label-caps text-[11px] text-on-surface-variant mb-md">
        CHRONOLOGICAL_LOG
      </div>
      {rows.length === 0 ? (
        <p className="font-data-sm text-[11px] text-on-surface-variant">No events logged for this mission.</p>
      ) : (
        <div className="space-y-xs">
          {rows.map((row) => (
            <div
              key={row.catchId}
              className="flex items-center gap-sm py-xs border-b border-outline-variant/10 font-data-sm text-[11px]"
            >
              {row.imageUrl ? (
                <img
                  src={row.imageUrl}
                  alt=""
                  className="w-8 h-8 shrink-0 rounded object-cover border border-outline-variant/30"
                />
              ) : (
                <span className="w-8 h-8 shrink-0 rounded bg-surface-container-low flex items-center justify-center">
                  <Icon name="phishing" className="text-xs text-on-surface-variant" />
                </span>
              )}
              <span className="text-on-surface-variant w-16 shrink-0">{row.time}</span>
              <span
                className={`flex-1 font-bold truncate ${row.isFailed ? 'text-primary' : 'text-on-surface'}`}
              >
                {row.species}
              </span>
              <span className="text-right w-16 shrink-0">{row.weight}</span>
              <span
                className={`text-right w-14 shrink-0 ${row.status === 'LOGGED' ? 'text-secondary-container' : 'text-error'}`}
              >
                {row.status}
              </span>
              {hasActions && (
                <div className="flex gap-xs shrink-0">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(row.catchId)}
                      className="p-1 text-on-surface-variant hover:text-secondary-container"
                      aria-label="Edit catch"
                    >
                      <Icon name="edit" className="text-sm" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(row.catchId)}
                      className="p-1 text-on-surface-variant hover:text-error"
                      aria-label="Delete catch"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
