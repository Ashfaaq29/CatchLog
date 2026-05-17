import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../utils/formatters';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-fixed-dim shadow-[0_0_15px_rgba(255,184,107,0.3)]',
  secondary:
    'border border-secondary-container/60 bg-secondary-container/5 text-secondary-container hover:bg-secondary-container/15 hover:shadow-[0_0_12px_rgba(0,244,254,0.25)]',
  ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/30',
  danger:
    'border border-error/40 bg-error/10 text-error hover:bg-error/20 hover:shadow-[0_0_12px_rgba(255,180,171,0.25)]',
};

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-sm py-xs text-[11px]',
  md: 'px-md py-sm text-label-caps',
  lg: 'px-lg py-3 text-label-caps',
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading,
  block,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={classNames(
        'font-label-caps font-bold uppercase tracking-widest rounded-lg transition-all duration-150',
        'inline-flex items-center justify-center gap-sm',
        'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        block ? 'w-full' : '',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}
