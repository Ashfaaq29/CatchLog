import { useEffect, useState } from 'react';

export interface UseCountUpOptions {
  active: boolean;
  duration?: number;
  decimals?: number;
  suffix?: string;
}

export function useCountUp(
  target: number,
  { active, duration = 1400, decimals = 0, suffix = '' }: UseCountUpOptions,
): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return `${value.toFixed(decimals)}${suffix}`;
}
