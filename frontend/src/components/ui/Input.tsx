import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { classNames } from '../../utils/formatters';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  iconLeft?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, iconLeft, id, className, ...rest },
  ref,
) {
  const inputId = id ?? `input-${rest.name ?? Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={inputId} className="label-tactical">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames('input-tactical', iconLeft ? 'pl-10' : '', error ? 'border-error focus:border-error' : '', className)}
          {...rest}
        />
      </div>
      {error ? (
        <span className="text-[11px] font-label-caps tracking-wider text-error uppercase">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11px] font-label-caps tracking-wider text-on-surface-variant uppercase opacity-70">
          {hint}
        </span>
      ) : null}
    </div>
  );
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, id, className, ...rest },
  ref,
) {
  const inputId = id ?? `ta-${rest.name ?? Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={inputId} className="label-tactical">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={3}
        className={classNames('input-tactical resize-none', error ? 'border-error focus:border-error' : '', className)}
        {...rest}
      />
      {error && (
        <span className="text-[11px] font-label-caps tracking-wider text-error uppercase">
          {error}
        </span>
      )}
    </div>
  );
});
