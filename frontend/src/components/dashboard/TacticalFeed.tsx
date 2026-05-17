import { Link } from 'react-router-dom';
import type { Catch, Trip } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';
import { Icon } from '../ui/Icon';
import { DataChip } from '../ui/StatusPill';
import { classNames, formatRelative, sectorTagFor } from '../../utils/formatters';

export interface TacticalFeedProps {
  catches: Catch[];
  trips: Trip[];
  operatorName: string;
  onEditCatch?: (item: Catch) => void;
  onEditTrip?: (trip: Trip) => void;
}

interface FeedItem {
  id: string;
  kind: 'catch' | 'trip';
  operator: string;
  message: string;
  imageUrl?: string;
  sector: string;
  timestamp: string;
  tone: 'cyan' | 'orange' | 'neutral';
  tripId?: string;
  catchItem?: Catch;
  tripItem?: Trip;
}

function buildItems(catches: Catch[], trips: Trip[], operator: string): FeedItem[] {
  const op = operator.toUpperCase().replace(/\s+/g, '_') || 'OPERATOR';
  const catchItems: FeedItem[] = catches.map((c) => ({
    id: `catch-${c.id}`,
    kind: 'catch' as const,
    operator: `OPERATOR_${op}`,
    message: `Confirmed ${c.fishType}${c.weight ? ` at ${c.weight}KG` : ''}${
      c.tripLocation ? ` // ${c.tripLocation.toUpperCase()}` : ''
    }`,
    imageUrl: c.imageUrl,
    sector: sectorTagFor(c.tripLocation ?? c.fishType ?? c.id),
    timestamp: c.createdAt,
    tone: 'orange' as const,
    tripId: c.trip,
    catchItem: c,
  }));
  const tripItems: FeedItem[] = trips.map((t) => ({
    id: `trip-${t.id}`,
    kind: 'trip' as const,
    operator: `OPERATOR_${op}`,
    message: `New deployment marked: '${t.location}'.${t.notes ? ` ${t.notes}` : ''}`,
    sector: sectorTagFor(t.location),
    timestamp: t.createdAt,
    tone: 'cyan' as const,
    tripId: t.id,
    tripItem: t,
  }));
  return [...catchItems, ...tripItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);
}

export function TacticalFeed({
  catches,
  trips,
  operatorName,
  onEditCatch,
  onEditTrip,
}: TacticalFeedProps): JSX.Element {
  const items = buildItems(catches, trips, operatorName);

  return (
    <GlassPanel bg="mid" rounded="xl" padding="md" className="flex flex-col h-full min-h-[24rem]">
      <div className="flex items-center gap-sm border-b border-outline-variant/30 pb-md mb-md">
        <Icon name="sensors" className="text-secondary-container" />
        <h3 className="font-label-caps text-headline-sm text-on-surface tracking-widest">
          TACTICAL_FEED
        </h3>
      </div>
      <div className="space-y-md overflow-y-auto pr-xs flex-1">
        {items.length === 0 && (
          <div className="text-on-surface-variant font-body-md text-sm py-md">
            No activity yet. Log a trip or catch to see live broadcasts.
          </div>
        )}
        {items.map((item) => (
          <FeedRow
            key={item.id}
            item={item}
            onEditCatch={onEditCatch}
            onEditTrip={onEditTrip}
          />
        ))}
      </div>
    </GlassPanel>
  );
}

function FeedRow({
  item,
  onEditCatch,
  onEditTrip,
}: {
  item: FeedItem;
  onEditCatch?: (item: Catch) => void;
  onEditTrip?: (trip: Trip) => void;
}): JSX.Element {
  const borderTone =
    item.tone === 'orange'
      ? 'border-primary'
      : item.tone === 'cyan'
        ? 'border-secondary-container'
        : 'border-outline-variant';
  const labelTone =
    item.tone === 'orange'
      ? 'text-primary'
      : item.tone === 'cyan'
        ? 'text-secondary-container'
        : 'text-on-surface-variant';

  const canEdit =
    (item.kind === 'catch' && item.catchItem && onEditCatch) ||
    (item.kind === 'trip' && item.tripItem && onEditTrip);

  const handleEdit = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (item.kind === 'catch' && item.catchItem && onEditCatch) onEditCatch(item.catchItem);
    if (item.kind === 'trip' && item.tripItem && onEditTrip) onEditTrip(item.tripItem);
  };

  const inner = (
    <>
      <div className="flex justify-between items-start mb-xs gap-sm">
        <span className={classNames('font-label-caps text-xs tracking-widest', labelTone)}>
          {item.operator}
        </span>
        <div className="flex items-center gap-xs shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="p-1 text-on-surface-variant hover:text-secondary-container"
              aria-label="Edit"
            >
              <Icon name="edit" className="text-sm" />
            </button>
          )}
          <span className="font-data-sm text-[10px] text-on-surface-variant tracking-widest">
            {formatRelative(item.timestamp)}
          </span>
        </div>
      </div>
      <p className="font-body-md text-sm text-on-surface mb-md">{item.message}</p>
      {item.imageUrl ? (
        <div className="w-full h-32 rounded overflow-hidden relative border border-outline-variant/30">
          <img
            src={item.imageUrl}
            alt="Catch"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 flex gap-xs">
            <span className="px-xs py-0.5 bg-black/80 font-data-sm text-[9px] text-primary border border-primary/40 rounded">
              {item.sector}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex gap-sm">
          <DataChip>#{item.kind === 'trip' ? 'WAYPOINT' : 'CATCH'}</DataChip>
          <DataChip>{item.sector}</DataChip>
        </div>
      )}
    </>
  );

  const baseRow = `border-l-2 ${borderTone} bg-surface-bright/15 p-md rounded-r-lg block`;

  if (item.tripId) {
    return (
      <Link
        to={`/trips?trip=${item.tripId}`}
        className={classNames(baseRow, 'hover:bg-surface-bright/25 transition-colors')}
      >
        {inner}
      </Link>
    );
  }
  return <div className={baseRow}>{inner}</div>;
}
