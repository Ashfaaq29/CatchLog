import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useInView';
import { LandingReveal } from './LandingReveal';

export interface LandingStatItemProps {
  value: string;
  label: string;
  accent: 'primary' | 'cyan';
  delay?: number;
  animate?: 'percent' | 'ms' | 'none';
}

export function LandingStatItem({
  value,
  label,
  accent,
  delay = 0,
  animate = 'none',
}: LandingStatItemProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5, once: true });

  const percentDisplay = useCountUp(99.9, {
    active: inView && animate === 'percent',
    decimals: 1,
    suffix: '%',
  });
  const msDisplay = useCountUp(8, {
    active: inView && animate === 'ms',
    decimals: 0,
    suffix: 'ms',
  });

  const display =
    animate === 'percent' ? percentDisplay : animate === 'ms' ? msDisplay : value;

  return (
    <LandingReveal delay={delay} direction="up">
      <div ref={ref} className="flex flex-col items-center text-center group">
        <span
          className={`font-data-lg text-[32px] font-bold transition-transform duration-300 group-hover:scale-110 ${
            accent === 'cyan' ? 'text-secondary-container' : 'text-primary'
          }`}
        >
          {display}
        </span>
        <span className="font-label-caps text-label-caps text-outline mt-xs group-hover:text-on-surface-variant transition-colors">
          {label}
        </span>
      </div>
    </LandingReveal>
  );
}
