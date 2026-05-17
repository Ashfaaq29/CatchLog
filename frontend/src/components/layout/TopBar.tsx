import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { useAuthStore } from '../../context/authStore';
import { classNames } from '../../utils/formatters';

export interface TopBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  immersive?: boolean;
  className?: string;
}

export function TopBar({
  searchPlaceholder = 'COMMAND_INPUT...',
  searchValue: controlledValue,
  onSearchChange,
  onSearchSubmit,
  immersive = false,
  className,
}: TopBarProps): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [internalQuery, setInternalQuery] = useState('');
  const query = controlledValue ?? internalQuery;

  const initials = (user?.name ?? 'OP')
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('') || 'OP';

  const setQuery = (v: string): void => {
    if (onSearchChange) onSearchChange(v);
    else setInternalQuery(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && onSearchSubmit) onSearchSubmit();
  };

  return (
    <header
      className={classNames(
        'col-span-12 h-16 flex justify-between items-center bg-surface/60 backdrop-blur-md border-b border-outline-variant/20 shadow-[0_0_15px_rgba(0,244,254,0.1)] px-md z-30',
        !immersive && 'sticky top-0 rounded-lg',
        className,
      )}
    >
      <div className="flex items-center gap-md">
        <div className="bg-surface-container-low rounded-lg px-md h-10 border border-outline-variant/30 flex items-center gap-sm">
          <Icon name="search" className="text-secondary-container text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none focus:ring-0 focus:outline-none font-data-sm text-data-sm text-on-surface-variant w-40 sm:w-56 placeholder:text-on-surface-variant/40"
            placeholder={searchPlaceholder}
            type="text"
            aria-label="Coordinate search"
          />
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button
          type="button"
          className="p-xs hover:bg-surface-bright/50 transition-all rounded"
          aria-label="Notifications"
        >
          <Icon name="notifications" className="text-on-surface-variant" />
        </button>
        <button
          type="button"
          className="p-xs hover:bg-surface-bright/50 transition-all rounded"
          aria-label="Achievements"
          onClick={() => navigate('/profile')}
        >
          <Icon name="military_tech" className="text-secondary-container" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full border border-primary/50 overflow-hidden flex items-center justify-center bg-surface-container hover:border-primary transition-colors"
          aria-label="Profile"
        >
          <span className="font-label-caps text-primary text-[11px] tracking-wider">
            {initials}
          </span>
        </button>
      </div>
    </header>
  );
}
