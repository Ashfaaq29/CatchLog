import { useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { requestDeviceCoords } from '../../utils/geolocation';

export interface DeploymentGpsFieldsProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  disabled?: boolean;
}

export function DeploymentGpsFields({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  disabled,
}: DeploymentGpsFieldsProps): JSX.Element {
  const [locating, setLocating] = useState(false);
  const hasCoords = latitude.trim() !== '' && longitude.trim() !== '';

  const useDeviceGps = async (): Promise<void> => {
    setLocating(true);
    try {
      const { lat, lon } = await requestDeviceCoords();
      onLatitudeChange(lat.toFixed(6));
      onLongitudeChange(lon.toFixed(6));
      toast.success('GPS LOCK ACQUIRED');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'GPS UNAVAILABLE');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="flex flex-col gap-sm border border-outline-variant/30 rounded-lg p-md bg-surface-container-low/40">
      <div className="flex items-center justify-between gap-sm">
        <span className="label-tactical text-on-surface-variant">GPS Coordinates</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={locating}
          disabled={disabled}
          onClick={() => void useDeviceGps()}
          iconLeft={<Icon name="my_location" className="text-base" />}
        >
          Use device GPS
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <Input
          label="Latitude"
          placeholder="-20.348400"
          type="number"
          step="any"
          min="-90"
          max="90"
          value={latitude}
          onChange={(e) => onLatitudeChange(e.target.value)}
          disabled={disabled}
        />
        <Input
          label="Longitude"
          placeholder="57.552200"
          type="number"
          step="any"
          min="-180"
          max="180"
          value={longitude}
          onChange={(e) => onLongitudeChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {hasCoords ? (
        <p className="font-data-sm text-[10px] text-secondary-container tracking-widest">
          LOCKED // {latitude}, {longitude}
        </p>
      ) : (
        <p className="font-data-sm text-[10px] text-on-surface-variant">
          Optional. Required for strike map and barometric telemetry. Name-only trips rely on
          geocoding, which may fail for local spots.
        </p>
      )}
    </div>
  );
}
