import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar, type TopBarProps } from './TopBar';
import { BottomNav } from './BottomNav';
import { classNames } from '../../utils/formatters';

export interface AppShellProps {
  children: ReactNode;
  onLogCatch?: () => void;
  sectorLabel?: string;
  layout?: 'default' | 'immersive';
  topBar?: TopBarProps;
}

export function AppShell({
  children,
  onLogCatch,
  sectorLabel,
  layout = 'default',
  topBar,
}: AppShellProps): JSX.Element {
  const immersive = layout === 'immersive';

  return (
    <div className="min-h-screen">
      <Sidebar onLogCatch={onLogCatch} sectorLabel={sectorLabel} />
      <main
        className={classNames(
          'md:ml-64 min-h-screen pb-20 md:pb-0',
          immersive && 'flex flex-col h-screen overflow-hidden',
        )}
      >
        {immersive ? (
          <>
            <TopBar
              {...topBar}
              immersive
              className="shrink-0 z-40 rounded-none sticky top-0"
            />
            <div className="flex-1 relative min-h-0 overflow-hidden">{children}</div>
          </>
        ) : (
          <div className="grid grid-cols-12 gap-gutter p-md md:p-gutter">
            <TopBar {...topBar} />
            {children}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
