import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { LANDING_IMAGES } from './constants';
import { useSmoothAnchorScroll } from './useSmoothAnchorScroll';
import { classNames } from '../../utils/formatters';

type NavSection = 'tactical-feed' | 'offshore-modules' | null;

export function LandingNav(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>(null);
  const scrollTo = useSmoothAnchorScroll();

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 24);

      const feed = document.getElementById('tactical-feed');
      const modules = document.getElementById('offshore-modules');
      const y = window.scrollY + 100;

      if (feed && y >= feed.offsetTop) {
        setActiveSection('tactical-feed');
      } else if (modules && y >= modules.offsetTop) {
        setActiveSection('offshore-modules');
      } else {
        setActiveSection(null);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = (section: NavSection): string =>
    classNames(
      'font-label-caps text-label-caps py-2 px-3 rounded transition-all duration-200',
      activeSection === section
        ? 'landing-nav-link-active text-secondary-container font-bold'
        : 'text-on-surface-variant hover:bg-surface-bright/50 hover:text-secondary-container',
    );

  return (
    <nav
      className={classNames(
        'backdrop-blur-md text-primary font-label-caps text-headline-sm font-bold tracking-widest sticky top-0 border-b border-outline-variant/20 flex justify-between items-center w-full px-gutter h-16 z-[100] transition-all duration-300',
        scrolled ? 'landing-nav-scrolled' : 'bg-surface/60 shadow-[0_0_15px_rgba(0,244,254,0.1)]',
      )}
    >
      <div className="flex items-center gap-md">
        <Link
          to="/"
          className="text-primary font-bold tracking-tighter hover:text-primary-fixed-dim transition-colors"
        >
          ANGLER_OS
        </Link>
        <div className="hidden md:flex items-center ml-xl gap-lg">
          <a
            href="#/"
            onClick={(e) => scrollTo(e, 'tactical-feed')}
            className={navLinkClass('tactical-feed')}
          >
            Tactical Feed
          </a>
          <a
            href="#/"
            onClick={(e) => scrollTo(e, 'offshore-modules')}
            className={navLinkClass('offshore-modules')}
          >
            Logbook
          </a>
          <a
            href="#/"
            onClick={(e) => scrollTo(e, 'offshore-modules')}
            className={navLinkClass('offshore-modules')}
          >
            Offshore Chart
          </a>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <div className="relative hidden sm:block group">
          <input
            className="bg-surface-container/50 border border-outline-variant/30 text-data-sm font-data-sm rounded-lg px-md py-xs focus:ring-1 focus:ring-secondary-container focus:border-secondary-container outline-none w-64 placeholder:opacity-30 transition-all duration-200 group-hover:border-secondary-container/40"
            placeholder="SEARCH_SECTOR..."
            type="text"
            readOnly
            aria-label="Search sector"
          />
        </div>
        <Link
          to="/login"
          className="hidden sm:inline-flex font-label-caps text-label-caps text-on-surface-variant hover:text-secondary-container transition-colors py-xs px-sm"
        >
          LOG IN
        </Link>
        <Link
          to="/register"
          className="hidden sm:inline-flex bg-primary-container text-on-primary font-label-caps text-label-caps font-bold py-xs px-md rounded-lg active-glow-orange hover:translate-y-[-1px] hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] transition-all duration-200"
        >
          REGISTER
        </Link>
        <button
          type="button"
          className="text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-200"
          aria-label="Notifications"
        >
          <Icon name="notifications" />
        </button>
        <button
          type="button"
          className="text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-200"
          aria-label="Achievements"
        >
          <Icon name="military_tech" />
        </button>
        <Link
          to="/login"
          className="w-8 h-8 rounded-full border border-secondary-container/50 overflow-hidden flex-shrink-0 hover:border-secondary-container hover:shadow-[0_0_12px_rgba(0,244,254,0.35)] transition-all duration-200"
          aria-label="Log in"
        >
          <img
            alt="Pro Angler Profile"
            className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
            src={LANDING_IMAGES.profile}
          />
        </Link>
      </div>
    </nav>
  );
}
