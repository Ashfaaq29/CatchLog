import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { classNames } from '../../utils/formatters';

export interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: string;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function FloatingActionButton({
  onClick,
  icon = 'add',
  label = 'Add',
  className,
  children,
}: FloatingActionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={classNames(
        'fixed bottom-20 md:bottom-lg right-lg w-14 h-14 md:w-16 md:h-16 rounded-full',
        'bg-primary text-on-primary glow-orange',
        'flex items-center justify-center active:scale-90 transition-transform duration-150 z-30',
        className,
      )}
    >
      {children ?? <Icon name={icon} weight={700} className="text-3xl" />}
    </button>
  );
}
