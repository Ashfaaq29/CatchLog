import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { classNames } from '../../utils/formatters';

export interface LandingRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: LandingRevealProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12, once: true });

  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  const directionClass =
    direction === 'left'
      ? 'landing-reveal-left'
      : direction === 'right'
        ? 'landing-reveal-right'
        : direction === 'none'
          ? 'landing-reveal-fade'
          : 'landing-reveal-up';

  return (
    <div
      ref={ref}
      className={classNames(
        'landing-reveal',
        directionClass,
        inView && 'landing-reveal-visible',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
