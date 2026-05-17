import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../utils/formatters';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  emissive?: 'cyan' | 'orange' | 'none';
  bg?: 'low' | 'mid' | 'high' | 'lowest';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  rounded?: 'lg' | 'xl' | '2xl';
  children?: ReactNode;
}

const BG_MAP: Record<NonNullable<GlassPanelProps['bg']>, string> = {
  lowest: 'bg-surface-container-lowest/60',
  low: 'bg-surface-container-low/60',
  mid: 'bg-surface-container/60',
  high: 'bg-surface-container-high/30',
};

const PAD_MAP: Record<NonNullable<GlassPanelProps['padding']>, string> = {
  none: '',
  sm: 'p-sm',
  md: 'p-md',
  lg: 'p-lg',
};

const RADIUS_MAP: Record<NonNullable<GlassPanelProps['rounded']>, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export function GlassPanel({
  emissive = 'none',
  bg = 'mid',
  padding = 'md',
  rounded = 'xl',
  className,
  children,
  ...rest
}: GlassPanelProps): JSX.Element {
  const emissiveClass =
    emissive === 'cyan'
      ? 'emissive-border-cyan'
      : emissive === 'orange'
        ? 'emissive-border-orange'
        : '';
  return (
    <div
      className={classNames(
        'glass-panel',
        emissiveClass,
        BG_MAP[bg],
        PAD_MAP[padding],
        RADIUS_MAP[rounded],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
