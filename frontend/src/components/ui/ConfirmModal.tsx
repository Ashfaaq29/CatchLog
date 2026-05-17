import { useEffect } from 'react';
import { Icon } from './Icon';
import { GlassPanel } from './GlassPanel';
import { Button } from './Button';
import { classNames } from '../../utils/formatters';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  subtitle = '// CONFIRM ACTION',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'danger',
}: ConfirmModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-md sm:p-lg"
      onClick={loading ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm" />
      <GlassPanel
        bg="mid"
        emissive={isDanger ? 'orange' : 'cyan'}
        rounded="xl"
        padding="none"
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-md border-b border-outline-variant/30 px-lg py-md">
          <div
            className={classNames(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
              isDanger
                ? 'bg-error/10 border-error/40 text-error'
                : 'bg-secondary-container/10 border-secondary-container/40 text-secondary-container',
            )}
          >
            <Icon name={isDanger ? 'warning' : 'help'} className="text-xl" />
          </div>
          <div className="flex flex-col gap-xs min-w-0">
            <span className="label-tactical text-[10px] tracking-widest">{subtitle}</span>
            <h2 id="confirm-modal-title" className="font-headline-sm text-headline-sm text-on-surface">
              {title}
            </h2>
          </div>
        </header>
        <div className="px-lg py-md">
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{message}</p>
        </div>
        <footer className="border-t border-outline-variant/30 px-lg py-md flex justify-end gap-sm">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            iconLeft={isDanger ? <Icon name="delete" className="text-base" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </footer>
      </GlassPanel>
    </div>
  );
}
