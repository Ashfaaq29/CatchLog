import { useCallback, useEffect, useState } from 'react';
import {
  readCachedDeviceCoords,
  requestDeviceCoords,
  type DeviceCoords,
} from '../utils/geolocation';

export interface UseGeolocationOptions {
  enabled?: boolean;
}

export function useGeolocation({ enabled = true }: UseGeolocationOptions = {}) {
  const [coords, setCoords] = useState<DeviceCoords | null>(() =>
    enabled ? readCachedDeviceCoords() : null,
  );
  const [loading, setLoading] = useState(enabled && !readCachedDeviceCoords());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<DeviceCoords | null> => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const position = await requestDeviceCoords();
      setCoords(position);
      return position;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Location unavailable';
      setError(message);
      setCoords(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    if (coords) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void refresh();
  }, [enabled, coords, refresh]);

  return { coords, loading, error, refresh };
}
