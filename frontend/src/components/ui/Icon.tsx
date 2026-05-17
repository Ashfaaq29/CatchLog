import { classNames } from '../../utils/formatters';

export interface IconProps {
  name: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  className?: string;
  ariaHidden?: boolean;
}

export function Icon({
  name,
  filled = false,
  weight = 400,
  className,
  ariaHidden = true,
}: IconProps): JSX.Element {
  return (
    <span
      aria-hidden={ariaHidden}
      className={classNames('material-symbols-outlined', className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}
