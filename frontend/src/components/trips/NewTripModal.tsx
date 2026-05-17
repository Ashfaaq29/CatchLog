import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { PlacePicker } from '../places/PlacePicker';
import { createTrip } from '../../services/trip.service';
import { extractErrorMessage } from '../../services/api';
import type { Place, Trip } from '../../types';

const schema = z.object({
  date: z.string().min(1, 'Required'),
  notes: z.string().trim().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export interface NewTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (trip: Trip) => void;
}

export function NewTripModal({ open, onClose, onCreated }: NewTripModalProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, notes: '' },
  });

  useEffect(() => {
    if (!open) {
      setSelectedPlace(null);
      reset({ date: today, notes: '' });
    }
  }, [open, reset, today]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!selectedPlace) {
      toast.error('SELECT OR SAVE A PLACE FIRST');
      return;
    }
    setSubmitting(true);
    try {
      const trip = await createTrip({
        location: selectedPlace.name,
        placeId: selectedPlace.id,
        date: new Date(values.date).toISOString(),
        notes: values.notes,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      });
      toast.success('DEPLOYMENT LOGGED // GPS LOCKED');
      reset({ date: today, notes: '' });
      setSelectedPlace(null);
      onCreated(trip);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'DEPLOYMENT LOG FAILED'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log New Deployment"
      subtitle="// NEW TRIP"
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Abort
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={submitting}
            disabled={!selectedPlace}
            iconLeft={<Icon name="add_location_alt" className="text-base" />}
          >
            Mark Waypoint
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <PlacePicker
          selectedPlace={selectedPlace}
          onPlaceChange={setSelectedPlace}
          disabled={submitting}
        />
        <Input
          label="Date of Deployment"
          type="date"
          iconLeft={<Icon name="calendar_today" className="text-base" />}
          error={errors.date?.message}
          {...register('date')}
        />
        <TextArea
          label="Operator Notes"
          placeholder="Wind direction, water clarity, lure tactics…"
          rows={4}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
}
