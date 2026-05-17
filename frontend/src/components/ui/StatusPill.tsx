import type { ReactNode } from 'react';
import { classNames } from '../../utils/formatters';

type Tone = 'cyan' | 'orange' | 'neutral' | 'error';

const TONES: Record<Tone, string> = {
  cyan:
    'border-secondary-container bg-secondary-container/10 text-secondary-container',
  orange: 'border-primary bg-primary/10 text-primary',
  neutral: 'border-outline-variant bg-surface-container/40 text-on-surface-variant',
  error: 'border-error/40 bg-error/10 text-error',
};

export interface StatusPillProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function StatusPill({ children, tone = 'cyan', className }: StatusPillProps): JSX.Element {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-xs border px-xs py-1 font-label-caps text-[10px] tracking-widest uppercase rounded-sm',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DataChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-xs py-1 border border-outline-variant bg-surface-container rounded font-label-caps text-[9px] tracking-widest uppercase text-on-surface-variant',
        className,
      )}
    >
      {children}
    </span>
  );
}
