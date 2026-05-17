import { lazy, Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Place } from '../../types';
import { listPlaces, createPlace } from '../../services/place.service';
import { extractErrorMessage } from '../../services/api';
import { PlaceSearchInput } from './PlaceSearchInput';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import { requestDeviceCoords } from '../../utils/geolocation';
import { isValidObjectId } from '../../utils/objectId';

const PlacePickerMap = lazy(() =>
  import('./PlacePickerMap').then((m) => ({ default: m.PlacePickerMap })),
);

const DEFAULT_LAT = -20.2;
const DEFAULT_LON = 57.5;

export interface PlacePickerProps {
  selectedPlace: Place | null;
  onPlaceChange: (place: Place | null) => void;
  disabled?: boolean;
  /** When editing an existing place, pass its id to skip "save as new" */
  editingPlaceId?: string;
}

export function PlacePicker({
  selectedPlace,
  onPlaceChange,
  disabled,
  editingPlaceId,
}: PlacePickerProps): JSX.Element {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [name, setName] = useState(selectedPlace?.name ?? '');
  const [lat, setLat] = useState(selectedPlace?.latitude ?? DEFAULT_LAT);
  const [lon, setLon] = useState(selectedPlace?.longitude ?? DEFAULT_LON);
  const [geocodeLabel, setGeocodeLabel] = useState(selectedPlace?.geocodeLabel ?? '');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'saved' | 'new'>('saved');

  useEffect(() => {
    let cancelled = false;
    void listPlaces()
      .then((items) => {
        if (!cancelled) setPlaces(items);
      })
      .catch(() => {
        if (!cancelled) toast.error('FAILED TO LOAD SAVED PLACES');
      })
      .finally(() => {
        if (!cancelled) setLoadingPlaces(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      setName(selectedPlace.name);
      setLat(selectedPlace.latitude);
      setLon(selectedPlace.longitude);
      setGeocodeLabel(selectedPlace.geocodeLabel ?? '');
      if (!isValidObjectId(selectedPlace.id)) {
        setMode('new');
      }
    }
  }, [selectedPlace]);

  const selectSaved = (place: Place): void => {
    onPlaceChange(place);
    setName(place.name);
    setLat(place.latitude);
    setLon(place.longitude);
    setGeocodeLabel(place.geocodeLabel ?? '');
    setMode('saved');
  };

  const saveNewPlace = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('ENTER A PLACE NAME');
      return;
    }
    setSaving(true);
    try {
      const place = await createPlace({
        name: trimmed,
        latitude: lat,
        longitude: lon,
        geocodeLabel: geocodeLabel || undefined,
      });
      setPlaces((prev) => [place, ...prev.filter((p) => p.id !== place.id)]);
      onPlaceChange(place);
      toast.success('PLACE SAVED TO SECTOR REGISTRY');
      setMode('saved');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'SAVE PLACE FAILED'));
    } finally {
      setSaving(false);
    }
  };

  const useDeviceGps = async (): Promise<void> => {
    try {
      const { lat: deviceLat, lon: deviceLon } = await requestDeviceCoords();
      setLat(deviceLat);
      setLon(deviceLon);
      toast.success('GPS LOCK ACQUIRED');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'GPS UNAVAILABLE');
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="flex gap-sm">
        <Button
          type="button"
          variant={mode === 'saved' ? 'primary' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => setMode('saved')}
        >
          Saved places
        </Button>
        <Button
          type="button"
          variant={mode === 'new' ? 'primary' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => {
            setMode('new');
            onPlaceChange(null);
          }}
        >
          New place
        </Button>
      </div>

      {mode === 'saved' && (
        <div className="max-h-32 overflow-y-auto space-y-xs rounded-lg border border-outline-variant/30 p-sm">
          {loadingPlaces ? (
            <SonarSpinner label="LOADING PLACES" embedded compact />
          ) : places.length === 0 ? (
            <p className="font-data-sm text-[11px] text-on-surface-variant p-sm">
              No saved places yet. Switch to New place to pin your first sector.
            </p>
          ) : (
            places.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => selectSaved(p)}
                className={`w-full text-left px-sm py-xs rounded font-data-sm text-[11px] transition-colors ${
                  selectedPlace?.id === p.id
                    ? 'bg-primary/20 border border-primary/50 text-primary'
                    : 'hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="font-bold block truncate">{p.name}</span>
                <span className="text-on-surface-variant text-[10px]">
                  {p.catchCount} catches · {p.tripCount} missions
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {(mode === 'new' || selectedPlace) && (
        <>
          <PlaceSearchInput
            disabled={disabled}
            onSelect={(r) => {
              setLat(r.lat);
              setLon(r.lon);
              setGeocodeLabel(r.label);
              if (!name.trim()) setName(r.label.split(',')[0] ?? r.label);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => void useDeviceGps()}
            iconLeft={<Icon name="my_location" />}
          >
            Use device GPS
          </Button>
          <Suspense
            fallback={
              <div className="h-48 flex items-center justify-center rounded-lg bg-surface-container-low">
                <SonarSpinner label="LOADING MAP" embedded compact />
              </div>
            }
          >
            <PlacePickerMap
              latitude={lat}
              longitude={lon}
              onCoordsChange={(a, b) => {
                setLat(a);
                setLon(b);
                if (selectedPlace) {
                  onPlaceChange({
                    ...selectedPlace,
                    latitude: a,
                    longitude: b,
                    name: name.trim() || selectedPlace.name,
                  });
                }
              }}
            />
          </Suspense>
          <p className="font-data-sm text-[10px] text-on-surface-variant -mt-sm">
            Drag the pin to the exact spot you fish.
          </p>
          <Input
            label="Place name"
            placeholder="e.g. Bains des Dames — north rocks"
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (selectedPlace) {
                onPlaceChange({ ...selectedPlace, name: v, latitude: lat, longitude: lon });
              }
            }}
            disabled={disabled}
          />
          {mode === 'new' &&
            (!editingPlaceId || !isValidObjectId(selectedPlace?.id ?? '')) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={saving}
              disabled={disabled}
              onClick={() => void saveNewPlace()}
              iconLeft={<Icon name="save" />}
            >
              Save to sector registry
            </Button>
          )}
        </>
      )}
    </div>
  );
}
