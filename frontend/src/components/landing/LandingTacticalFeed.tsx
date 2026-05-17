import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { LANDING_IMAGES } from './constants';
import { LandingReveal } from './LandingReveal';
const FEED_ITEMS = [
  {
    image: LANDING_IMAGES.feedYellowfin,
    alt: 'Yellowfin Tuna Action',
    lat: '25.122',
    lon: '-77.421',
    operator: 'NIGHTHAWK_7',
    title: 'YELLOWFIN STRIKE // SECTOR 04',
    weight: '145',
    weightUnit: 'LBS',
    species: 'Yellowfin Tuna',
  },
  {
    image: LANDING_IMAGES.feedMarlin,
    alt: 'Blue Marlin Tag and Release',
    lat: '18.551',
    lon: '-64.702',
    operator: 'GHOST_FIN',
    title: 'BLUE MARLIN RELEASE // SECTOR 07',
    weight: 'EST. 400+',
    weightUnit: 'LBS',
    species: 'Blue Marlin',
  },
] as const;

function FeedCard({
  image,
  alt,
  lat,
  lon,
  operator,
  title,
  weight,
  weightUnit,
  species,
}: (typeof FEED_ITEMS)[number]): JSX.Element {
  return (
    <article className="landing-feed-card relative group overflow-hidden rounded-xl bg-surface-container border border-outline-variant/30">
      <img
        alt={alt}
        className="landing-feed-img w-full h-80 object-cover grayscale group-hover:grayscale-0"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-md left-md transition-transform duration-300 group-hover:translate-y-[-2px]">
        <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant/50 p-sm font-data-sm text-data-sm text-on-surface group-hover:border-secondary-container/40 transition-colors duration-300">
          <div className="flex items-center gap-xs text-secondary-container">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span>LIVE_DATALINK</span>
          </div>
          <div className="mt-xs">
            LAT: {lat} | LON: {lon}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-lg flex justify-between items-end transition-transform duration-300 group-hover:translate-y-[-4px]">
        <div>
          <h4 className="font-label-caps text-label-caps text-outline mb-xs">OPERATOR: {operator}</h4>
          <h3 className="font-headline-sm text-headline-sm text-on-background uppercase">{title}</h3>
        </div>
        <div className="flex flex-col items-end gap-xs">
          <div className="bg-primary/10 border border-primary/30 px-md py-xs rounded-sm group-hover:border-primary/50 transition-colors">
            <span className="font-data-lg text-data-lg text-primary">
              {weight} <span className="text-xs">{weightUnit}</span>
            </span>
          </div>
          <div className="bg-secondary-container/10 border border-secondary-container/30 px-md py-xs rounded-sm group-hover:border-secondary-container/50 transition-colors">
            <span className="font-data-lg text-data-lg text-secondary-container">{species}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LandingTacticalFeed(): JSX.Element {
  return (
    <section id="tactical-feed" className="py-xl bg-surface-container-lowest scroll-mt-20">
      <div className="container mx-auto px-gutter">
        <LandingReveal className="flex justify-between items-end mb-xl">
          <div>
            <span className="font-label-caps text-label-caps text-secondary-container tracking-widest">
              LIVE_OPERATIONS
            </span>
            <h2 className="font-headline-md text-headline-md text-on-background font-bold mt-xs uppercase">
              Tactical Feed
            </h2>
          </div>
          <Link
            to="/login"
            className="group text-primary font-label-caps text-label-caps flex items-center gap-xs hover:gap-md transition-all duration-300"
          >
            VIEW ALL SECTORS
            <Icon
              name="arrow_forward"
              className="text-base transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </LandingReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {FEED_ITEMS.map((item, index) => (
            <LandingReveal key={item.title} delay={index * 150} direction={index === 0 ? 'left' : 'right'}>
              <FeedCard {...item} />
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
