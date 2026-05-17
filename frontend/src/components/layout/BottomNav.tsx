import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { classNames } from '../../utils/formatters';

const TABS = [
  { to: '/dashboard', label: 'Feed', icon: 'radar' },
  { to: '/trips', label: 'Logbook', icon: 'menu_book' },
  { to: '/gallery', label: 'Sonar', icon: 'explore' },
  { to: '/profile', label: 'Gear', icon: 'inventory_2' },
  { to: '/weather', label: 'Wx', icon: 'airplay' },
];

export function BottomNav(): JSX.Element {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/30 grid grid-cols-5"
      aria-label="Mobile navigation"
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            classNames(
              'flex flex-col items-center justify-center py-sm gap-xs transition-colors',
              isActive
                ? 'text-secondary-container'
                : 'text-on-surface-variant opacity-70 hover:opacity-100',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                name={t.icon}
                filled={isActive}
                className={classNames(isActive ? 'text-shadow-cyan' : '')}
              />
              <span className="font-label-caps text-[10px] tracking-widest uppercase">
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
