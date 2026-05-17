import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getWeather, type WeatherQuery } from '../services/weather.service';
import { extractErrorMessage } from '../services/api';
import { useGeolocation } from './useGeolocation';
import type { WeatherSnapshot } from '../types';

export interface UseWeatherOptions extends WeatherQuery {
  enabled?: boolean;
  /** When true (default), uses browser GPS if no location/trip/coords are provided. */
  useDeviceLocation?: boolean;
}

export function useWeather(options: UseWeatherOptions = {}) {
  const {
    location,
    tripId,
    lat,
    lon,
    enabled = true,
    useDeviceLocation = true,
  } = options;

  const hasExplicitTarget =
    Boolean(location?.trim()) || Boolean(tripId) || (lat !== undefined && lon !== undefined);

  const shouldUseDevice = useDeviceLocation && !hasExplicitTarget;
  const geo = useGeolocation({ enabled: enabled && shouldUseDevice });

  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const effectiveLat = lat ?? geo.coords?.lat;
  const effectiveLon = lon ?? geo.coords?.lon;
  const geoPending =
    shouldUseDevice && !geo.coords && !geo.error;
  const geoBlocked = shouldUseDevice && !geo.coords && Boolean(geo.error);

  const refresh = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    if (geoPending) return;

    if (shouldUseDevice && effectiveLat === undefined) return;

    if (geoBlocked) {
      setError(geo.error);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snapshot = await getWeather({
        ...(location?.trim() ? { location: location.trim() } : {}),
        ...(tripId ? { tripId } : {}),
        ...(effectiveLat !== undefined && effectiveLon !== undefined
          ? { lat: effectiveLat, lon: effectiveLon }
          : {}),
      });
      setData(snapshot);
    } catch (err) {
      const message = extractErrorMessage(err, 'WEATHER UPLINK OFFLINE');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    geoPending,
    geoBlocked,
    geo.error,
    location,
    tripId,
    effectiveLat,
    effectiveLon,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading: loading || geoPending,
    error: error ?? (geoBlocked ? geo.error : null),
    refresh,
  };
}
