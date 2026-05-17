import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Catch, Trip } from '../../types';
import { formatCoordLine, jitterLngLat } from './logbookUtils';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';
const PLACEHOLDER_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDiDleREVWmHplMR8Mog9BnToh1NZCy4HMuf1Gcn7h4OnuW7K97Kr5gBdXftPNmf4kE7Rd5tPWX-zNh7fzs3JCOWVwqQDaC8dNQVI-mPyA1O8Nz8uO9ip6EQIT9TcBr0XBcQgx6-efCLG6FJ74uI_pY0sJFVfuUZHckz6EhSlN3ZyWZFHheyAk7IHOgF51QB1qWZBm96JyZnAOxGvinNVpFUwtBHau_CBx2un3ZHDcYSDt30jlAOUxOdM_AiIl7dTfJ9qb531l7f9e';

const SOURCE_ID = 'logbook-strikes';

export interface StrikeMapPanelProps {
  trip: Trip;
  catches: Catch[];
}

export function StrikeMapPanel({ trip, catches }: StrikeMapPanelProps): JSX.Element {
  const hasCoords = trip.latitude != null && trip.longitude != null;
  const cluster = catches.filter((c) => !c.notes?.match(/\b(lost|miss)\b/i)).length >= 3;

  if (!hasCoords) {
    return (
      <div className="space-y-md">
        <MapHeader cluster={false} />
        <div className="relative h-64 rounded bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
          <img src={PLACEHOLDER_MAP} alt="" className="w-full h-full object-cover opacity-60" />
          <p className="absolute bottom-4 left-4 font-data-sm text-[10px] bg-background/80 p-xs border border-outline-variant/30 text-on-surface-variant">
            No GPS for this deployment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <MapHeader cluster={cluster} />
      <MiniStrikeMap key={trip.id} trip={trip} catches={catches} />
    </div>
  );
}

function MapHeader({ cluster }: { cluster: boolean }): JSX.Element {
  return (
    <div className="flex justify-between items-center">
      <span className="font-label-caps text-[11px] text-on-surface-variant">GPS_STRIKE_LOCATIONS</span>
      {cluster && (
        <span className="font-data-sm text-[11px] text-secondary-container">STRIKE_CLUSTER_DETECTED</span>
      )}
    </div>
  );
}

function MiniStrikeMap({ trip, catches }: { trip: Trip; catches: Catch[] }): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const lat = trip.latitude!;
  const lon = trip.longitude!;

  const logged = catches.filter((c) => !c.notes?.match(/\b(lost|miss|strike\s*lost)\b/i));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [lon, lat],
      zoom: 11,
      attributionControl: false,
      interactive: true,
    });

    map.on('load', () => {
      const features = logged.map((c, i) => {
        const [jLon, jLat] = jitterLngLat(lat, lon, i, Math.max(logged.length, 1));
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [jLon, jLat] },
          properties: { id: c.id },
        };
      });

      if (features.length === 0) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lon, lat] },
          properties: { id: 'trip' },
        });
      }

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });
      map.addLayer({
        id: 'logbook-strikes-layer',
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff9f1c',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00f4fe',
          'circle-opacity': 0.85,
        },
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon, logged.length]);

  return (
    <div className="relative h-64 rounded bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      <pre className="absolute bottom-4 left-4 font-data-sm text-[10px] bg-background/80 p-xs border border-outline-variant/30 text-on-surface whitespace-pre-line pointer-events-none">
        {formatCoordLine(lat, lon)}
      </pre>
    </div>
  );
}
