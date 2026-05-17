import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';
import { GlassPanel } from './GlassPanel';
import { classNames } from '../../utils/formatters';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const WIDTHS: Record<NonNullable<ModalProps['width']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-md sm:p-lg"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" />
      <GlassPanel
        bg="mid"
        emissive="cyan"
        rounded="xl"
        padding="none"
        className={classNames('relative w-full', WIDTHS[width])}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-outline-variant/30 px-lg py-md">
          <div className="flex flex-col gap-xs">
            {subtitle && <span className="label-tactical text-[10px] tracking-widest">{subtitle}</span>}
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-surface-bright/30 transition-all"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="px-lg py-md">{children}</div>
        {footer && (
          <footer className="border-t border-outline-variant/30 px-lg py-md flex justify-end gap-sm">
            {footer}
          </footer>
        )}
      </GlassPanel>
    </div>
  );
}
