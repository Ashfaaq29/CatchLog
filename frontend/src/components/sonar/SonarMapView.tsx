import { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource, type Map, type Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { MapCatchPin, MapDeployment } from '../../types';
import type { SonarLayerState } from './SonarLayerControls';
import { SonarMarkerPopup, type SonarPopupData } from './SonarMarkerPopup';
import { createRoot } from 'react-dom/client';
import { MAP_STYLE_FALLBACK, MAP_STYLE_PRIMARY, MAP_TOPO_TILES } from '../../utils/mapConfig';

const DEPLOYMENT_SOURCE = 'sonar-deployments';
const MY_CATCH_SOURCE = 'sonar-my-catches';
const PUBLIC_SOURCE = 'sonar-public-pings';

const DEPLOYMENT_LAYER = 'sonar-deployments-layer';
const MY_CATCH_LAYER = 'sonar-my-catches-layer';
const PUBLIC_LAYER = 'sonar-public-pings-layer';
const TOPO_LAYER = 'opentopo-layer';

function deploymentFeatures(deployments: MapDeployment[]): Feature<Point>[] {
  return deployments.map((d) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [d.lon, d.lat] },
    properties: { id: d.id, kind: 'deployment' },
  }));
}

function catchFeatures(catches: MapCatchPin[], kind: 'my' | 'public'): Feature<Point>[] {
  return catches.map((c) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
    properties: { id: c.id, kind },
  }));
}

function upsertGeoJsonSource(
  map: Map,
  sourceId: string,
  data: FeatureCollection<Point>,
): void {
  const existing = map.getSource(sourceId) as GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
    return;
  }
  map.addSource(sourceId, { type: 'geojson', data });
}

function addPointLayer(
  map: Map,
  layerId: string,
  sourceId: string,
  color: string,
  stroke: string,
  size: number,
): void {
  if (map.getLayer(layerId)) return;
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-radius': size,
      'circle-color': color,
      'circle-opacity': 0.9,
      'circle-stroke-width': 2,
      'circle-stroke-color': stroke,
      'circle-blur': 0.05,
    },
  });
}

function ensureTopoLayer(map: Map): void {
  if (map.getSource('opentopo')) return;

  map.addSource('opentopo', {
    type: 'raster',
    tiles: MAP_TOPO_TILES,
    tileSize: 256,
    attribution: '© OpenTopoMap (CC-BY-SA)',
    maxzoom: 17,
  });

  const beforeId = map.getLayer(DEPLOYMENT_LAYER) ? DEPLOYMENT_LAYER : undefined;
  map.addLayer(
    {
      id: TOPO_LAYER,
      type: 'raster',
      source: 'opentopo',
      paint: { 'raster-opacity': 0.42, 'raster-brightness-min': 0.15, 'raster-contrast': 0.25 },
    },
    beforeId,
  );
}

export interface SonarMapViewProps {
  center: { lat: number; lon: number };
  deployments: MapDeployment[];
  myCatches: MapCatchPin[];
  publicPings: MapCatchPin[];
  layers: SonarLayerState;
  flyTo: { lat: number; lon: number; zoom?: number; at: number; deploymentId?: string } | null;
  onCursorMove: (lat: number, lon: number) => void;
}

export function SonarMapView({
  center,
  deployments,
  myCatches,
  publicPings,
  layers,
  flyTo,
  onCursorMove,
}: SonarMapViewProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const didFitBoundsRef = useRef(false);
  const layersBoundRef = useRef(false);
  const usedFallbackStyleRef = useRef(false);
  const popupRef = useRef<Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const dataRef = useRef({ deployments, myCatches, publicPings, layers });
  dataRef.current = { deployments, myCatches, publicPings, layers };
  const onCursorMoveRef = useRef(onCursorMove);
  onCursorMoveRef.current = onCursorMove;
  const centerRef = useRef(center);
  centerRef.current = center;

  const showPopup = useCallback((lngLat: [number, number], data: SonarPopupData) => {
    const map = mapRef.current;
    if (!map) return;
    const el = document.createElement('div');
    const root = createRoot(el);
    root.render(<SonarMarkerPopup popup={data} />);
    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      offset: 14,
      className: 'sonar-popup',
      maxWidth: '280px',
    })
      .setLngLat(lngLat)
      .setDOMContent(el)
      .addTo(map);
  }, []);

  const syncSourcesAndLayers = useCallback((map: Map) => {
    const { deployments: deps, myCatches: mine, publicPings: pub, layers: lyr } = dataRef.current;

    upsertGeoJsonSource(map, DEPLOYMENT_SOURCE, {
      type: 'FeatureCollection',
      features: deploymentFeatures(deps),
    });
    upsertGeoJsonSource(map, MY_CATCH_SOURCE, {
      type: 'FeatureCollection',
      features: catchFeatures(mine, 'my'),
    });
    upsertGeoJsonSource(map, PUBLIC_SOURCE, {
      type: 'FeatureCollection',
      features: catchFeatures(pub, 'public'),
    });

    addPointLayer(map, DEPLOYMENT_LAYER, DEPLOYMENT_SOURCE, '#00f4fe', '#63f7ff', 11);
    addPointLayer(map, MY_CATCH_LAYER, MY_CATCH_SOURCE, '#ffc68b', '#ffb86b', 9);
    addPointLayer(map, PUBLIC_LAYER, PUBLIC_SOURCE, '#ff9f1c', '#ffc68b', 8);

    ensureTopoLayer(map);

    const vis = (on: boolean): 'visible' | 'none' => (on ? 'visible' : 'none');
    for (const [layer, on] of [
      [DEPLOYMENT_LAYER, lyr.deployments],
      [MY_CATCH_LAYER, lyr.myCatches],
      [PUBLIC_LAYER, lyr.publicPings],
      [TOPO_LAYER, true],
    ] as const) {
      if (map.getLayer(layer)) {
        map.setLayoutProperty(layer, 'visibility', vis(on));
      }
    }

    if (!didFitBoundsRef.current && deps.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const d of deps) bounds.extend([d.lon, d.lat]);
      for (const c of mine) bounds.extend([c.lon, c.lat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 0 });
      didFitBoundsRef.current = true;
    }
  }, []);

  const bindLayerClicks = useCallback(
    (map: Map) => {
      if (layersBoundRef.current) return;
      layersBoundRef.current = true;

      const bind = (layerId: string, resolver: (id: string) => SonarPopupData | null): void => {
        map.on('click', layerId, (e) => {
          const f = e.features?.[0];
          const id = f?.properties?.id as string | undefined;
          if (!id || !e.lngLat) return;
          const popup = resolver(id);
          if (popup) showPopup([e.lngLat.lng, e.lngLat.lat], popup);
        });
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      };

      bind(DEPLOYMENT_LAYER, (id) => {
        const d = dataRef.current.deployments.find((x) => x.id === id);
        return d ? { kind: 'deployment', data: d } : null;
      });
      bind(MY_CATCH_LAYER, (id) => {
        const c = dataRef.current.myCatches.find((x) => x.id === id);
        return c ? { kind: 'catch', data: c } : null;
      });
      bind(PUBLIC_LAYER, (id) => {
        const c = dataRef.current.publicPings.find((x) => x.id === id);
        return c ? { kind: 'catch', data: c, isPublic: true } : null;
      });
    },
    [showPopup],
  );

  const onMapReady = useCallback(
    (map: Map) => {
      map.resize();
      syncSourcesAndLayers(map);
      bindLayerClicks(map);
      setMapReady(true);
    },
    [bindLayerClicks, syncSourcesAndLayers],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const initial = centerRef.current;
    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE_PRIMARY,
      center: [initial.lon, initial.lat],
      zoom: 10,
      attributionControl: {},
      fadeDuration: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      onCursorMoveRef.current(e.lngLat.lat, e.lngLat.lng);
    });

    map.on('error', (e) => {
      if (usedFallbackStyleRef.current) return;
      const message = e.error?.message ?? '';
      if (message.includes('Failed to fetch') || message.includes('style')) {
        usedFallbackStyleRef.current = true;
        map.setStyle(MAP_STYLE_FALLBACK);
      }
    });

    map.once('load', () => {
      onMapReady(map);
      requestAnimationFrame(() => map.resize());
    });

    map.once('idle', () => {
      map.resize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      setMapReady(false);
      layersBoundRef.current = false;
      didFitBoundsRef.current = false;
      usedFallbackStyleRef.current = false;
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    syncSourcesAndLayers(map);
  }, [mapReady, deployments, myCatches, publicPings, layers, syncSourcesAndLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !flyTo) return;
    map.flyTo({
      center: [flyTo.lon, flyTo.lat],
      zoom: flyTo.zoom ?? 11,
      essential: true,
    });
    if (flyTo.deploymentId) {
      const d = dataRef.current.deployments.find((x) => x.id === flyTo.deploymentId);
      if (d) showPopup([d.lon, d.lat], { kind: 'deployment', data: d });
    }
  }, [flyTo, mapReady, showPopup]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[8] sonar-map-tiles w-full h-full min-h-[200px]"
    />
  );
}
