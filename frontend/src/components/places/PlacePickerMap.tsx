import { useEffect, useRef } from 'react';
import maplibregl, { type Map, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE_PRIMARY } from '../../utils/mapConfig';
export interface PlacePickerMapProps {
  latitude: number;
  longitude: number;
  onCoordsChange: (lat: number, lon: number) => void;
  className?: string;
}

export function PlacePickerMap({
  latitude,
  longitude,
  onCoordsChange,
  className = 'h-48 w-full rounded-lg overflow-hidden border border-outline-variant/40',
}: PlacePickerMapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onCoordsChangeRef = useRef(onCoordsChange);

  useEffect(() => {
    onCoordsChangeRef.current = onCoordsChange;
  }, [onCoordsChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_PRIMARY,
      center: [longitude, latitude],
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const marker = new maplibregl.Marker({ color: '#ffb86b', draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      onCoordsChangeRef.current(lngLat.lat, lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const current = marker.getLngLat();
    if (Math.abs(current.lat - latitude) < 1e-6 && Math.abs(current.lng - longitude) < 1e-6) {
      return;
    }

    marker.setLngLat([longitude, latitude]);
    map.flyTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 11), duration: 600 });
  }, [latitude, longitude]);

  return <div ref={containerRef} className={className} />;
}
