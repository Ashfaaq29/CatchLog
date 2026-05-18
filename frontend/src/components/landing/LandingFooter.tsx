import { Icon } from '../ui/Icon';
import { LandingReveal } from './LandingReveal';
import { useSmoothAnchorScroll } from './useSmoothAnchorScroll';

const FOOTER_LINKS = {
  operations: [
    { label: 'Tactical Feed', href: '#tactical-feed', id: 'tactical-feed' },
    { label: 'Offshore Chart', href: '#offshore-modules', id: 'offshore-modules' },
    { label: 'Tidal Forecast', href: '#offshore-modules', id: 'offshore-modules' },
  ],
  resources: [
    { label: 'Manuals', href: '#' },
    { label: 'Fleet Support', href: '#' },
    { label: 'API Datalink', href: '#' },
  ],
  legal: [
    { label: 'Privacy Prot.', href: '#' },
    { label: 'Terms of Op.', href: '#' },
  ],
};

export function LandingFooter(): JSX.Element {
  const scrollTo = useSmoothAnchorScroll();

  return (
    <footer className="bg-surface-container-lowest py-xl border-t border-outline-variant/20">
      <div className="container mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-start gap-xl">
          <LandingReveal direction="left">
            <div className="max-w-sm">
              <span className="text-primary font-label-caps text-headline-sm font-bold tracking-widest">
                ANGLER_OS
              </span>
              <p className="mt-md text-on-surface-variant font-body-md opacity-60">
                The definitive operating system for elite saltwater fishing operations. Precision
                tools for high-stakes offshore environments.
              </p>
            </div>
          </LandingReveal>
          <LandingReveal delay={100} className="grid grid-cols-2 sm:grid-cols-3 gap-xl">
            <div className="flex flex-col gap-md">
              <span className="font-label-caps text-label-caps text-primary font-bold">OPERATIONS</span>
              {FOOTER_LINKS.operations.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={link.id ? (e) => scrollTo(e, link.id!) : undefined}
                  className="text-on-surface-variant hover:text-secondary-container hover:translate-x-1 transition-all font-body-md text-sm inline-block"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-md">
              <span className="font-label-caps text-label-caps text-primary font-bold">RESOURCES</span>
              {FOOTER_LINKS.resources.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-on-surface-variant hover:text-secondary-container hover:translate-x-1 transition-all font-body-md text-sm inline-block"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-md">
              <span className="font-label-caps text-label-caps text-primary font-bold">LEGAL</span>
              {FOOTER_LINKS.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-on-surface-variant hover:text-secondary-container hover:translate-x-1 transition-all font-body-md text-sm inline-block"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </LandingReveal>
        </div>
        <LandingReveal delay={200}>
          <div className="mt-xl pt-lg border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
            <span className="font-data-sm text-data-sm text-outline opacity-40">
              © 2024 ANGLER_OS // OFFSHORE DIVISION // ALL RIGHTS RESERVED
            </span>
            <div className="flex gap-lg">
              {(['rss_feed', 'terminal', 'public'] as const).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={icon}
                  className="text-outline hover:text-secondary-container hover:scale-110 transition-all duration-200 cursor-pointer"
                >
                  <Icon name={icon} />
                </button>
              ))}
            </div>
          </div>
        </LandingReveal>
      </div>
    </footer>
  );
}
