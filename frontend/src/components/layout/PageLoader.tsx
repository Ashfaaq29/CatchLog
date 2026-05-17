import { FishingLoader } from '../ui/FishingLoader';

export interface PageLoaderProps {
  label?: string;
}

/** Full-viewport overlay for route transitions and lazy chunk loads. */
export function PageLoader({ label = 'Casting' }: PageLoaderProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface"
      aria-busy="true"
    >
      <FishingLoader label={label} />
    </div>
  );
}
