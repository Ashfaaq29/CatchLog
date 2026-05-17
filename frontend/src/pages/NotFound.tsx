import { Link } from 'react-router-dom';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-md">
      <GlassPanel
        emissive="orange"
        bg="mid"
        rounded="xl"
        padding="lg"
        className="max-w-lg w-full flex flex-col gap-md text-center"
      >
        <div className="flex flex-col items-center gap-sm">
          <Icon name="signal_disconnected" className="text-primary text-5xl" />
          <StatusPill tone="orange">SECTOR UNKNOWN</StatusPill>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">404 // OUT_OF_RANGE</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          The coordinates you submitted are not on any chart we maintain.
        </p>
        <Link
          to="/dashboard"
          className="font-label-caps text-label-caps text-secondary-container uppercase tracking-widest border border-secondary-container/40 rounded-lg py-sm hover:bg-secondary-container/10 transition-all"
        >
          Return to Tactical Feed →
        </Link>
      </GlassPanel>
    </div>
  );
}
