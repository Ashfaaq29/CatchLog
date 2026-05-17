import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { classNames } from '../../utils/formatters';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Tactical Feed', icon: 'radar' },
  { to: '/trips', label: 'Logbook', icon: 'menu_book' },
  { to: '/gallery', label: 'Sonar Map', icon: 'explore' },
  { to: '/profile', label: 'Gear Locker', icon: 'inventory_2' },
  { to: '/weather', label: 'Weather Ops', icon: 'airplay' },
];

export function Sidebar({
  onLogCatch,
  sectorLabel = 'LOCAL',
}: {
  onLogCatch?: () => void;
  sectorLabel?: string;
}): JSX.Element {
  const navigate = useNavigate();

  const handleLogCatch = (): void => {
    if (onLogCatch) onLogCatch();
    else navigate('/trips');
  };

  return (
    <aside
      className="hidden md:flex h-screen fixed left-0 top-0 w-64 z-40 bg-surface-container/80 backdrop-blur-xl border-r border-outline-variant/30 shadow-[inset_-1px_0_0_0_rgba(255,184,107,0.1)] flex-col py-lg"
      aria-label="Primary navigation"
    >
      <div className="px-gutter mb-xl">
        <div className="flex items-center gap-sm mb-xs">
          <Icon name="radar" className="text-primary text-3xl" />
          <h1 className="font-label-caps text-lg tracking-widest text-primary">ANGLER_OS</h1>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm font-bold text-primary truncate">
            {sectorLabel}
          </span>
          <span className="font-label-caps text-[10px] text-secondary-container tracking-tighter">
            OPERATIONAL
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-xs px-xs">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-md py-3 px-4 transition-all duration-200',
                isActive
                  ? 'bg-secondary-container/10 text-secondary-container border-r-4 border-secondary-container shadow-[0_0_15px_rgba(0,244,254,0.2)] translate-x-1'
                  : 'text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-surface-bright/30',
              )
            }
            end
          >
            <Icon name={item.icon} />
            <span className="font-label-caps text-label-caps tracking-widest uppercase">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="px-gutter mt-auto flex flex-col gap-md">
        <Button variant="primary" block onClick={handleLogCatch}>
          Log Catch
        </Button>
        <div className="pt-md border-t border-outline-variant/20 flex flex-col gap-xs">
          <NavLink
            to="/profile"
            className="flex items-center gap-sm text-on-surface-variant text-[11px] font-label-caps hover:text-primary transition-colors"
          >
            <Icon name="settings" className="text-sm" />
            <span>Settings</span>
          </NavLink>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-sm text-on-surface-variant text-[11px] font-label-caps hover:text-primary transition-colors"
          >
            <Icon name="help" className="text-sm" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
