import { useEffect, useState } from 'react';
import { classNames } from '../../utils/formatters';

export interface FishingLoaderProps {
  label?: string;
  className?: string;
}

function CastingDots(): JSX.Element {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return <span className="inline-block w-5 text-left">{dots}</span>;
}

export function FishingLoader({ label = 'Casting', className }: FishingLoaderProps): JSX.Element {
  return (
    <div
      className={classNames(
        'fishing-loader-card bg-[#1c1f24] p-xl rounded-[32px] flex flex-col items-center',
        'shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 w-[240px]',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="fishing-loader-scene w-[150px] h-[100px] relative overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full" aria-hidden>
          <circle className="fishing-loader-ripple" cx="50" cy="45" r="5" />
          <g className="fishing-loader-bobber">
            <line className="fishing-loader-antenna" x1="50" y1="20" x2="50" y2="35" />
            <path className="fishing-loader-bobber-top" d="M40,35 Q50,25 60,35 L60,40 L40,40 Z" />
            <path className="fishing-loader-bobber-bottom" d="M40,40 L60,40 Q50,55 40,40 Z" />
          </g>
          <path
            className="fishing-loader-wave"
            d="M-40,45 Q-30,35 -20,45 T0,45 T20,45 T40,45 T60,45 T80,45 T100,45 T120,45 T140,45"
          />
        </svg>
      </div>
      <div className="fishing-loader-label mt-lg font-label-caps text-label-caps text-primary uppercase tracking-[0.2em]">
        {label}
        <CastingDots />
      </div>
    </div>
  );
}
