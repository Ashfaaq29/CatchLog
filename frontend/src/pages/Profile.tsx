import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { StatusPill, DataChip } from '../components/ui/StatusPill';
import { SonarSpinner } from '../components/ui/Spinner';
import { useAuthStore } from '../context/authStore';
import { getStats } from '../services/trip.service';
import { extractErrorMessage } from '../services/api';
import { formatLongDate } from '../utils/formatters';
import type { Stats } from '../types';

export function ProfilePage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const data = await getStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        toast.error(extractErrorMessage(err, 'STATS UPLINK FAILED'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = (): void => {
    logout();
    toast.success('UPLINK TERMINATED');
    navigate('/login');
  };

  const callsign = (user?.name ?? 'OPERATOR').toUpperCase().replace(/\s+/g, '_');
  const initials =
    (user?.name ?? 'OP')
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join('') || 'OP';
  const memberSince = user?.createdAt ? formatLongDate(user.createdAt) : '—';

  return (
    <AppShell>
      <section className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
        <GlassPanel emissive="orange" bg="mid" rounded="xl" padding="lg" className="flex flex-col gap-md">
          <span className="label-tactical">// GEAR LOCKER</span>
          <div className="flex items-center gap-md">
            <div className="w-20 h-20 rounded-lg border-2 border-primary/50 bg-surface-container-lowest flex items-center justify-center shadow-[0_0_15px_rgba(255,184,107,0.3)]">
              <span className="font-headline-md text-headline-md text-primary">{initials}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <h1 className="font-headline-md text-headline-md text-on-surface">
                OPERATOR_{callsign}
              </h1>
              <span className="font-data-sm text-[12px] text-on-surface-variant tracking-widest">
                {user?.email ?? '—'}
              </span>
              <div className="flex items-center gap-sm pt-xs">
                <StatusPill tone="cyan">ACTIVE DUTY</StatusPill>
                <DataChip>SECTOR_01</DataChip>
              </div>
            </div>
          </div>
          <div className="border-t border-outline-variant/20 pt-md grid grid-cols-2 gap-md">
            <Cell label="Enrolled" value={memberSince.toUpperCase()} />
            <Cell label="Clearance" value="OPERATOR" />
            <Cell label="Theatre" value="GLOBAL" />
            <Cell label="Last Sync" value={new Date().toLocaleTimeString().toUpperCase()} />
          </div>
          <Button
            variant="danger"
            block
            onClick={handleLogout}
            iconLeft={<Icon name="logout" className="text-base" />}
          >
            Terminate Uplink
          </Button>
        </GlassPanel>
      </section>

      <section className="col-span-12 lg:col-span-7 flex flex-col gap-gutter">
        {loading ? (
          <GlassPanel bg="mid" rounded="xl" padding="lg">
            <SonarSpinner label="LOADING CAREER STATS" embedded compact />
          </GlassPanel>
        ) : (
          <>
            <GlassPanel bg="mid" rounded="xl" padding="lg" className="flex flex-col gap-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                <Icon name="military_tech" className="text-secondary-container" />
                Career Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                <BigStat
                  label="TOTAL TRIPS"
                  value={`${stats?.totalTrips ?? 0}`}
                  icon="directions_boat"
                  tone="orange"
                />
                <BigStat
                  label="CATCHES LOGGED"
                  value={`${stats?.totalCatches ?? 0}`}
                  icon="set_meal"
                  tone="cyan"
                />
                <BigStat
                  label="HEAVIEST KG"
                  value={
                    stats?.heaviestCatch ? stats.heaviestCatch.weight.toFixed(1) : '—'
                  }
                  icon="scale"
                  tone="orange"
                />
              </div>
              {stats?.heaviestCatch && (
                <div className="border-t border-outline-variant/20 pt-md flex items-center gap-md">
                  <Icon name="emoji_events" filled className="text-primary text-2xl" />
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
                      Personal Best
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      {stats.heaviestCatch.fishType} • {stats.heaviestCatch.weight.toFixed(1)} KG
                    </span>
                    <span className="font-data-sm text-[11px] text-on-surface-variant tracking-widest">
                      {formatLongDate(stats.heaviestCatch.date).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </GlassPanel>

            <GlassPanel bg="mid" rounded="xl" padding="lg" className="flex flex-col gap-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                <Icon name="inventory_2" className="text-primary" />
                Gear Locker
              </h2>
              <ul className="divide-y divide-outline-variant/20">
                <GearRow icon="phishing" label="Primary Rod" value="MEDIUM_FAST_7FT" />
                <GearRow icon="rotate_right" label="Reel" value="SPINNING_3000" />
                <GearRow icon="line_weight" label="Line" value="20LB_BRAID + 12LB_FLUORO" />
                <GearRow icon="bolt" label="Lure" value="DEEP_DIVER_SHAD" />
                <GearRow icon="explore" label="Top Sector" value={stats?.topLocation?.location?.toUpperCase() ?? '—'} />
              </ul>
              <p className="font-data-sm text-[11px] text-on-surface-variant tracking-widest">
                // MOCK_DATA — gear loadout will sync from inventory in next firmware.
              </p>
            </GlassPanel>
          </>
        )}
      </section>
    </AppShell>
  );
}

function Cell({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <span className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant">
        {label}
      </span>
      <span className="font-data-sm text-[12px] tracking-widest text-on-surface">{value}</span>
    </div>
  );
}

function BigStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: 'cyan' | 'orange';
}): JSX.Element {
  const valueClass = tone === 'cyan' ? 'text-secondary-container' : 'text-primary';
  const iconClass = tone === 'cyan' ? 'text-secondary-container' : 'text-primary';
  const emissive = tone === 'cyan' ? 'cyan' : 'orange';
  return (
    <GlassPanel emissive={emissive} bg="lowest" rounded="lg" padding="md" className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant">
          {label}
        </span>
        <Icon name={icon} className={`${iconClass} text-base`} />
      </div>
      <span className={`font-data-lg text-3xl ${valueClass}`}>{value}</span>
    </GlassPanel>
  );
}

function GearRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <li className="py-sm flex items-center justify-between gap-md">
      <div className="flex items-center gap-sm min-w-0">
        <Icon name={icon} className="text-secondary-container text-base shrink-0" />
        <span className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase">
          {label}
        </span>
      </div>
      <span className="font-data-sm text-[12px] tracking-widest text-on-surface uppercase truncate">
        {value}
      </span>
    </li>
  );
}
