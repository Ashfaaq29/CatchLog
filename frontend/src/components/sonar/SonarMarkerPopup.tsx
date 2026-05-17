import type { MapCatchPin, MapDeployment } from '../../types';
import { formatWeight } from '../../utils/formatters';

export type SonarPopupData =
  | { kind: 'deployment'; data: MapDeployment }
  | { kind: 'catch'; data: MapCatchPin; isPublic?: boolean };

export interface SonarMarkerPopupProps {
  popup: SonarPopupData;
}

export function SonarMarkerPopup({ popup }: SonarMarkerPopupProps): JSX.Element {
  if (popup.kind === 'deployment') {
    const d = popup.data;
    return (
      <div className="glass-panel sonar-inner-glow bg-surface-container-low/95 rounded p-md w-48 shadow-xl border border-outline-variant/40">
        <span className="font-label-caps text-primary text-[10px] block mb-xs">
          DEPLOYMENT // {d.id.slice(-6).toUpperCase()}
        </span>
        <h3 className="font-headline-sm text-sm text-on-surface mb-xs">{d.location}</h3>
        <div className="flex justify-between font-data-sm text-[11px] text-on-surface-variant">
          <span>CATCHES</span>
          <span className="text-secondary-container">{d.catchCount}</span>
        </div>
      </div>
    );
  }

  const c = popup.data;
  return (
    <div className="glass-panel sonar-inner-glow bg-surface-container-low/95 rounded p-md w-52 shadow-xl border border-outline-variant/40">
      <span className="font-label-caps text-primary text-[10px] block mb-xs">
        OBJECT_ID: C-{c.id.slice(-6).toUpperCase()}
      </span>
      <h3 className="font-headline-sm text-sm text-on-surface mb-xs">{c.fishType}</h3>
      {c.imageUrl && (
        <img src={c.imageUrl} alt={c.fishType} className="w-full h-20 object-cover rounded mb-xs" />
      )}
            <div className="flex justify-between font-data-sm text-[11px] text-on-surface-variant">
        <span>WEIGHT</span>
        <span className="text-primary">{formatWeight(c.weight)}</span>
      </div>
      <div className="flex justify-between font-data-sm text-[11px] text-on-surface-variant mt-xs">
        <span>SECTOR</span>
        <span className="text-secondary-container truncate max-w-[8rem]">{c.tripLocation}</span>
      </div>
      {popup.isPublic && c.userName && (
        <div className="flex justify-between font-data-sm text-[11px] text-on-surface-variant mt-xs">
          <span>OPERATOR</span>
          <span>{c.userName}</span>
        </div>
      )}
    </div>
  );
}
