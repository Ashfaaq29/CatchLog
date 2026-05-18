import { useCallback } from 'react';

export function useSmoothAnchorScroll(): (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void {
  return useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
}
