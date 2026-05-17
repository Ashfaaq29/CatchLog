const STORAGE_KEY = 'catchlog.deviceCoords';
const MAX_AGE_MS = 30 * 60 * 1000;

export interface DeviceCoords {
  lat: number;
  lon: number;
}

interface StoredCoords extends DeviceCoords {
  savedAt: number;
}

export function readCachedDeviceCoords(): DeviceCoords | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCoords;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { lat: parsed.lat, lon: parsed.lon };
  } catch {
    return null;
  }
}

export function writeCachedDeviceCoords(coords: DeviceCoords): void {
  try {
    const payload: StoredCoords = { ...coords, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable
  }
}

export function requestDeviceCoords(): Promise<DeviceCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const cached = readCachedDeviceCoords();
    if (cached) {
      resolve(cached);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        writeCachedDeviceCoords(coords);
        resolve(coords);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enable location access in your browser to load local weather.'
            : 'Could not determine your location. Check device location settings and try again.';
        reject(new Error(message));
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: MAX_AGE_MS },
    );
  });
}
