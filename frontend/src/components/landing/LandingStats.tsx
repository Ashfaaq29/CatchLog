import { LandingStatItem } from './LandingStatItem';

const STATS = [
  { value: '99.9%', label: 'TIDAL ACCURACY', accent: 'primary' as const, animate: 'percent' as const },
  { value: '8ms', label: 'SONAR LATENCY', accent: 'cyan' as const, animate: 'ms' as const },
  { value: 'IP69K', label: 'SALTWATER DURABILITY', accent: 'primary' as const, animate: 'none' as const },
  { value: 'AES-256', label: 'ENCRYPTED TELEMETRY', accent: 'cyan' as const, animate: 'none' as const },
];

export function LandingStats(): JSX.Element {
  return (
    <section className="py-xl bg-surface border-y border-outline-variant/10">
      <div className="container mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-lg">
        {STATS.map((stat, index) => (
          <LandingStatItem key={stat.label} {...stat} delay={index * 80} />
        ))}
      </div>
    </section>
  );
}
