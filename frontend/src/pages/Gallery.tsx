import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { SonarSpinner } from '../components/ui/Spinner';
import { SonarMapView } from '../components/sonar/SonarMapView';
import { SonarMapOverlays } from '../components/sonar/SonarMapOverlays';
import { RadarOverlayPanel } from '../components/sonar/RadarOverlayPanel';
import { DepthScanPanel } from '../components/sonar/DepthScanPanel';
import { ThermalGradientPanel } from '../components/sonar/ThermalGradientPanel';
import { SonarMapStatusBar } from '../components/sonar/SonarMapStatusBar';
import { SonarLayerControls, type SonarLayerState } from '../components/sonar/SonarLayerControls';
import { getSonarMap, geocodeMapSearch } from '../services/map.service';
import { extractErrorMessage } from '../services/api';
import { useWeather } from '../hooks/useWeather';
import type { MapDeployment, SonarMapPayload } from '../types';

export function GalleryPage(): JSX.Element {
  const [mapData, setMapData] = useState<SonarMapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<{ lat: number; lon: number } | null>(null);
  const [flyTo, setFlyTo] = useState<{
    lat: number;
    lon: number;
    zoom?: number;
    at: number;
    deploymentId?: string;
  } | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [layers, setLayers] = useState<SonarLayerState>({
    deployments: true,
    myCatches: true,
    publicPings: true,
  });

  const loadMap = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getSonarMap();
      setMapData(data);
      setCursor({ lat: data.center.lat, lon: data.center.lon });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'SONAR MAP OFFLINE'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMap();
  }, [loadMap]);

  const { data: weather } = useWeather({
    lat: mapData?.center.lat,
    lon: mapData?.center.lon,
    location: mapData?.center.label,
    useDeviceLocation: false,
    enabled: !!mapData,
  });

  const cursorRafRef = useRef<number | null>(null);
  const handleCursorMove = useCallback((lat: number, lon: number) => {
    if (cursorRafRef.current !== null) return;
    cursorRafRef.current = window.requestAnimationFrame(() => {
      cursorRafRef.current = null;
      setCursor((prev) => {
        if (prev && Math.abs(prev.lat - lat) < 0.00005 && Math.abs(prev.lon - lon) < 0.00005) {
          return prev;
        }
        return { lat, lon };
      });
    });
  }, []);

  useEffect(
    () => () => {
      if (cursorRafRef.current !== null) {
        window.cancelAnimationFrame(cursorRafRef.current);
      }
    },
    [],
  );

  const handleStructureSelect = useCallback((structure: MapDeployment) => {
    setSelectedStructureId(structure.id);
    setFlyTo({
      lat: structure.lat,
      lon: structure.lon,
      zoom: 13,
      at: Date.now(),
      deploymentId: structure.id,
    });
    setCursor({ lat: structure.lat, lon: structure.lon });
  }, []);

  const handleSearch = async (): Promise<void> => {
    const q = search.trim();
    if (!q) return;
    try {
      const result = await geocodeMapSearch(q);
      setFlyTo({ lat: result.lat, lon: result.lon, zoom: 11, at: Date.now() });
      setSelectedStructureId(null);
      setCursor({ lat: result.lat, lon: result.lon });
      if (mapData) {
        setMapData({
          ...mapData,
          center: { lat: result.lat, lon: result.lon, label: result.label },
        });
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, 'COORDINATE NOT FOUND'));
    }
  };

  if (loading || !mapData) {
    return (
      <AppShell layout="immersive" topBar={{ searchPlaceholder: 'COORDINATE_SEARCH...' }}>
        <div className="absolute inset-0 flex items-center justify-center bg-surface-dim">
          <SonarSpinner label="INITIALIZING SONAR MAP" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      layout="immersive"
      sectorLabel={weather?.sectorLabel}
      topBar={{
        searchPlaceholder: 'COORDINATE_SEARCH...',
        searchValue: search,
        onSearchChange: setSearch,
        onSearchSubmit: () => void handleSearch(),
      }}
    >
      <div className="absolute inset-0 min-h-0">
        <SonarMapOverlays />
        <SonarMapView
          key={mapData.center.label}
          center={mapData.center}
          deployments={mapData.deployments}
          myCatches={mapData.myCatches}
          publicPings={mapData.publicPings}
          layers={layers}
          flyTo={flyTo}
          onCursorMove={handleCursorMove}
        />

        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <RadarOverlayPanel />
        </div>

        <aside className="absolute top-4 right-4 bottom-20 w-72 md:w-80 flex flex-col gap-md z-20 pointer-events-none max-h-[calc(100%-6rem)]">
          <div className="pointer-events-auto flex flex-col gap-md min-h-0 overflow-y-auto">
            <DepthScanPanel weather={weather} />
            <ThermalGradientPanel
              weather={weather}
              structures={mapData.deployments}
              selectedStructureId={selectedStructureId}
              onStructureSelect={handleStructureSelect}
            />
          </div>
        </aside>

        <div className="absolute bottom-4 left-4 right-4 h-16 flex items-center justify-between gap-md z-20 pointer-events-none">
          <div className="flex-1 min-w-0 h-full">
            <SonarMapStatusBar cursor={cursor} weather={weather} />
          </div>
          <SonarLayerControls layers={layers} onChange={setLayers} />
        </div>
      </div>
    </AppShell>
  );
}
