import { useEffect } from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingModules } from '../components/landing/LandingModules';
import { LandingTacticalFeed } from '../components/landing/LandingTacticalFeed';
import { LandingStats } from '../components/landing/LandingStats';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage(): JSX.Element {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="min-h-screen font-body-md text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      <LandingNav />
      <main className="relative">
        <LandingHero />
        <LandingModules />
        <LandingTacticalFeed />
        <LandingStats />
      </main>
      <LandingFooter />
    </div>
  );
}
