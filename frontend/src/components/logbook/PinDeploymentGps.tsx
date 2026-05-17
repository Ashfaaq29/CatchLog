import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Trip } from '../../types';
import { updateTripCoords } from '../../services/trip.service';
import { extractErrorMessage } from '../../services/api';
import { DeploymentGpsFields } from '../trips/DeploymentGpsFields';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface PinDeploymentGpsProps {
  trip: Trip;
  onUpdated: (trip: Trip) => void;
}

export function PinDeploymentGps({ trip, onUpdated }: PinDeploymentGpsProps): JSX.Element {
  const [latitude, setLatitude] = useState(
    trip.latitude != null ? String(trip.latitude) : '',
  );
  const [longitude, setLongitude] = useState(
    trip.longitude != null ? String(trip.longitude) : '',
  );
  const [saving, setSaving] = useState(false);

  const save = async (): Promise<void> => {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      toast.error('ENTER VALID LATITUDE AND LONGITUDE');
      return;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error('COORDINATES OUT OF RANGE');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTripCoords(trip.id, { latitude: lat, longitude: lon });
      toast.success('DEPLOYMENT GPS PINNED');
      onUpdated(updated);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'GPS PIN FAILED'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-md space-y-md">
      <div className="flex items-start gap-sm">
        <Icon name="location_off" className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-label-caps text-primary text-[11px]">NO GPS FOR THIS DEPLOYMENT</p>
          <p className="font-data-sm text-[11px] text-on-surface-variant mt-xs">
            Pin coordinates to enable the strike map and barometric chart for this mission.
          </p>
        </div>
      </div>
      <DeploymentGpsFields
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
        disabled={saving}
      />
      <Button
        variant="primary"
        size="sm"
        loading={saving}
        onClick={() => void save()}
        iconLeft={<Icon name="pin_drop" />}
      >
        Pin deployment GPS
      </Button>
    </div>
  );
}
