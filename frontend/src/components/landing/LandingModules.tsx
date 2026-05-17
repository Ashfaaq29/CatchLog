import { Icon } from '../ui/Icon';
import { LandingReveal } from './LandingReveal';

const MODULES = [
  {
    mod: 'MOD_01',
    icon: 'sailing',
    title: 'Offshore Logbook',
    description:
      'Log precision entry for tidal charts, salinity levels, and sea surface temperature anomalies at the point of hookup.',
    tags: ['TIDE_SYNC', 'SALINITY'],
    highlight: false,
  },
  {
    mod: 'MOD_02',
    icon: 'set_meal',
    title: 'Big Game Tracking',
    description:
      'Tactical analysis for Billfish and Tuna. Log weight, release tags, and species health metrics with monospaced precision.',
    tags: ['BILLFISH_ID', 'ACTIVE'],
    highlight: true,
  },
  {
    mod: 'MOD_03',
    icon: 'hub',
    title: 'Blue Water Network',
    description:
      'Encrypted coordinate sharing within your offshore fleet. Monitor temperature breaks without exposing your secret waypoints.',
    tags: ['SECURE_COORD', 'P2P_MESH'],
    highlight: false,
  },
] as const;

export function LandingModules(): JSX.Element {
  return (
    <section id="offshore-modules" className="py-xl bg-surface relative scroll-mt-20">
      <div className="container mx-auto px-gutter">
        <LandingReveal className="flex items-center gap-md mb-xl">
          <div className="h-[1px] flex-1 bg-outline-variant/30 landing-line-grow origin-right" />
          <h2 className="font-headline-md text-headline-md text-primary font-bold uppercase tracking-widest px-md">
            Offshore Modules
          </h2>
          <div
            className="h-[1px] flex-1 bg-outline-variant/30 landing-line-grow origin-left"
            style={{ animationDelay: '0.15s' }}
          />
        </LandingReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {MODULES.map((mod, index) => (
            <LandingReveal key={mod.mod} delay={index * 120} direction="up">
              <article
                className={`landing-module-card landing-glass-panel p-lg rounded-xl flex flex-col gap-md inner-glow-cyan h-full cursor-default ${
                  mod.highlight ? 'border-secondary-container/20' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <Icon
                    name={mod.icon}
                    filled
                    className="landing-module-icon text-secondary-container text-4xl"
                  />
                  <span className="font-data-sm text-data-sm text-outline">{mod.mod}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-background mt-md">{mod.title}</h3>
                <p className="text-on-surface-variant font-body-md opacity-70">{mod.description}</p>
                <div className="mt-auto pt-lg">
                  <div className="flex gap-xs flex-wrap">
                    {mod.tags.map((tag) => (
                      <span
                        key={tag}
                        className={
                          tag === 'ACTIVE'
                            ? 'bg-secondary-container/20 text-secondary-container text-data-sm px-sm py-xs border border-secondary-container/30 rounded-xs'
                            : 'bg-surface-bright/50 text-data-sm px-sm py-xs border border-outline-variant/30 rounded-xs transition-colors duration-200 group-hover:border-secondary-container/30'
                        }
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
