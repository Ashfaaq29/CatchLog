import type { Catch } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { DataChip } from '../ui/StatusPill';
import {
  formatLength,
  formatRelative,
  formatWeight,
  sectorTagFor,
} from '../../utils/formatters';

export interface CatchCardProps {
  item: Catch;
  onDelete?: (id: string) => void;
}

export function CatchCard({ item, onDelete }: CatchCardProps): JSX.Element {
  const sector = sectorTagFor(item.tripLocation ?? item.fishType);

  return (
    <GlassPanel
      bg="low"
      emissive={item.imageUrl ? 'orange' : 'none'}
      rounded="lg"
      padding="none"
      className="overflow-hidden flex flex-col group"
    >
      <div className="relative aspect-[4/3] bg-surface-container-lowest overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.fishType}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
            <Icon name="image_not_supported" className="text-4xl" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-xs">
          <DataChip className="bg-black/70 text-primary border-primary/50">{sector}</DataChip>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-black/70 border border-error/40 text-error hover:bg-error/20 transition-colors flex items-center justify-center"
            aria-label="Delete catch"
          >
            <Icon name="delete" className="text-sm" />
          </button>
        )}
      </div>
      <div className="p-md flex flex-col gap-sm">
        <div className="flex justify-between items-start gap-sm">
          <span className="font-label-caps text-label-caps tracking-widest uppercase text-primary truncate">
            {item.fishType}
          </span>
          <span className="font-data-sm text-[10px] tracking-widest text-on-surface-variant">
            {formatRelative(item.createdAt)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-sm font-data-sm text-[12px] tracking-widest">
          <div className="flex items-center gap-xs">
            <Icon name="scale" className="text-secondary-container text-base" />
            <span className="text-on-surface">{formatWeight(item.weight)}</span>
          </div>
          <div className="flex items-center gap-xs">
            <Icon name="straighten" className="text-secondary-container text-base" />
            <span className="text-on-surface">{formatLength(item.length)}</span>
          </div>
        </div>
        {item.notes && (
          <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">{item.notes}</p>
        )}
      </div>
    </GlassPanel>
  );
}
