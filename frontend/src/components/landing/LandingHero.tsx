import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { LANDING_IMAGES } from './constants';
import { useHeroParallax } from './useHeroParallax';

const HEADLINE_LINES = [
  { text: 'Elite', className: 'text-on-background', delay: '0.12s' },
  { text: 'Saltwater', className: 'text-primary', delay: '0.22s' },
  { text: 'Intelligence', className: 'text-primary', delay: '0.32s' },
  { text: 'For Pros', className: 'text-on-background', delay: '0.42s' },
] as const;

export function LandingHero(): JSX.Element {
  const { onMouseMove, onMouseLeave, offset } = useHeroParallax();

  return (
    <section
      className="relative min-h-[640px] lg:min-h-[720px] w-full overflow-hidden flex items-center"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-[-4%] will-change-transform"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <img
            alt="Marlin strike at sunset"
            className="landing-hero-bg w-full h-full object-cover object-center"
            src={LANDING_IMAGES.hero}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/75 to-surface/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-surface/30" />
        <div className="landing-hero-scan absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-secondary-container/20 to-transparent pointer-events-none" />
        <div className="landing-hero-bar absolute left-0 top-0 bottom-0 w-1 bg-secondary-container/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-gutter py-xl lg:py-2xl">
        <div className="max-w-2xl flex flex-col items-start text-left">
          <span className="landing-hero-enter landing-hero-enter-delay-1 inline-block bg-secondary-container/10 border border-secondary-container/30 text-secondary-container font-label-caps text-label-caps px-md py-xs tracking-[0.2em] mb-lg">
            <span className="inline-flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
              SYSTEM_ACTIVE // OFFSHORE_INTEL_STREAM
            </span>
          </span>

          <h1 className="font-headline-lg uppercase tracking-tighter leading-[0.95] mb-lg">
            {HEADLINE_LINES.map((line) => (
              <span
                key={line.text}
                className={`landing-hero-enter block text-[clamp(2.5rem,6vw,4.5rem)] ${line.className}`}
                style={{ animationDelay: line.delay }}
              >
                {line.text}
              </span>
            ))}
          </h1>

          <p className="landing-hero-enter landing-hero-enter-delay-4 font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-xl opacity-90">
            Deploy the ANGLER_OS tactical ecosystem for blue water operations. Real-time tidal
            charts, big game biometrics, and secure coordinate sharing.
          </p>

          <div className="landing-hero-enter landing-hero-enter-delay-5 flex flex-col sm:flex-row gap-md items-stretch sm:items-center w-full sm:w-auto mb-xl">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-sm bg-primary-container text-on-primary font-label-caps text-label-caps py-md px-xl rounded-lg font-bold active-glow-orange hover:translate-y-[-2px] hover:shadow-[0_0_28px_rgba(255,159,28,0.45)] transition-all duration-200"
            >
              <Icon
                name="login"
                className="text-xl transition-transform duration-200 group-hover:translate-x-0.5"
              />
              START MISSION LOG
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-sm border border-secondary-container/50 text-secondary-container font-label-caps text-label-caps py-md px-xl rounded-lg hover:bg-secondary-container/10 hover:border-secondary-container hover:shadow-[0_0_20px_rgba(0,244,254,0.2)] transition-all duration-200"
            >
              <Icon name="sync" className="landing-sync-icon text-xl" />
              SYNC CHART DATA
            </Link>
          </div>

          <div className="landing-hero-enter landing-hero-enter-delay-6 flex flex-col sm:flex-row gap-md sm:gap-xl font-label-caps text-label-caps">
            <p className="text-secondary-container">
              <span className="text-on-surface-variant/70">PRIORITY STAT</span>{' '}
              <span className="text-on-surface-variant/50">NETWORK:</span>{' '}
              <span className="font-bold inline-flex items-center gap-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
                ACTIVE
              </span>
            </p>
            <p>
              <span className="text-on-surface-variant/70">SIGNAL STRENGTH</span>{' '}
              <span className="text-primary font-bold">SAT_LINK: 100%</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
