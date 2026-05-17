import { Icon } from '../ui/Icon';
import { classNames } from '../../utils/formatters';

export interface SonarLayerState {
  deployments: boolean;
  myCatches: boolean;
  publicPings: boolean;
}

export interface SonarLayerControlsProps {
  layers: SonarLayerState;
  onChange: (layers: SonarLayerState) => void;
}

export function SonarLayerControls({ layers, onChange }: SonarLayerControlsProps): JSX.Element {
  const toggle = (key: keyof SonarLayerState): void => {
    onChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className="flex gap-sm pointer-events-auto">
      <LayerButton
        icon="layers"
        active={layers.deployments && layers.myCatches && layers.publicPings}
        title="All layers"
        onClick={() =>
          onChange({
            deployments: true,
            myCatches: true,
            publicPings: true,
          })
        }
      />
      <LayerButton
        icon="pin_drop"
        active={layers.deployments}
        title="My deployments"
        onClick={() => toggle('deployments')}
      />
      <LayerButton
        icon="settings_overscan"
        active={layers.publicPings}
        title="Public pings"
        onClick={() => toggle('publicPings')}
      />
    </div>
  );
}

function LayerButton({
  icon,
  active,
  title,
  onClick,
}: {
  icon: string;
  active: boolean;
  title: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={classNames(
        'h-12 w-12 glass-panel rounded flex items-center justify-center transition-all',
        active
          ? 'bg-secondary-container/20 text-secondary-container border-secondary-container/50'
          : 'bg-surface-container-high/80 text-on-surface-variant hover:bg-secondary-container/10',
      )}
    >
      <Icon name={icon} />
    </button>
  );
}
