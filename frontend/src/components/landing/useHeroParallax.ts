import { useCallback, useEffect, useState } from 'react';

export function useHeroParallax(enabled = true): {
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  offset: { x: number; y: number };
} {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [motionOk, setMotionOk] = useState(enabled);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setMotionOk(enabled && !mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [enabled]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!motionOk) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      setOffset({ x, y });
    },
    [motionOk],
  );

  const onMouseLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return { onMouseMove, onMouseLeave, offset };
}
