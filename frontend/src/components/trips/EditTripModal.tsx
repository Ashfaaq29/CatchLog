import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { PlacePicker } from '../places/PlacePicker';
import { updateTrip, deleteTrip } from '../../services/trip.service';
import { listPlaces, createPlace, updatePlace } from '../../services/place.service';
import { isValidObjectId } from '../../utils/objectId';
import { extractErrorMessage } from '../../services/api';
import type { Place, Trip } from '../../types';

const schema = z.object({
  date: z.string().min(1, 'Required'),
  notes: z.string().trim().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export interface EditTripModalProps {
  open: boolean;
  trip: Trip | null;
  onClose: () => void;
  onUpdated: (trip: Trip) => void;
  onDeleted?: (id: string) => void;
}

export function EditTripModal({
  open,
  trip,
  onClose,
  onUpdated,
  onDeleted,
}: EditTripModalProps): JSX.Element | null {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!trip || !open) return;
    reset({
      date: new Date(trip.date).toISOString().slice(0, 10),
      notes: trip.notes ?? '',
    });
    void listPlaces().then((places) => {
      const match = trip.placeId ? places.find((p) => p.id === trip.placeId) : null;
      if (match) {
        setSelectedPlace(match);
      } else if (trip.latitude != null && trip.longitude != null) {
        setSelectedPlace({
          id: '__draft__',
          user: trip.user,
          name: trip.location,
          latitude: trip.latitude,
          longitude: trip.longitude,
          notes: '',
          tripCount: 0,
          catchCount: trip.catchCount ?? 0,
          lastFishedAt: trip.date,
          createdAt: trip.createdAt,
          updatedAt: trip.createdAt,
        });
      } else {
        setSelectedPlace(null);
      }
    });
  }, [trip, open, reset]);

  if (!trip) return null;

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!selectedPlace) {
      toast.error('SET A LOCATION ON THE MAP');
      return;
    }
    setSubmitting(true);
    try {
      const locationName = selectedPlace.name.trim() || trip.location;
      let placeId = isValidObjectId(selectedPlace.id) ? selectedPlace.id : undefined;

      if (!placeId) {
        const created = await createPlace({
          name: locationName,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          geocodeLabel: selectedPlace.geocodeLabel,
        });
        placeId = created.id;
      } else {
        await updatePlace(placeId, {
          name: locationName,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
        });
      }

      const updated = await updateTrip(trip.id, {
        date: new Date(values.date).toISOString(),
        notes: values.notes,
        placeId,
        location: locationName,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      });
      toast.success('MISSION UPDATED');
      onUpdated(updated);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'UPDATE FAILED'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      toast.success('MISSION DELETED');
      setDeleteConfirmOpen(false);
      onDeleted?.(trip.id);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'DELETE FAILED'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Mission"
      subtitle={`// ${trip.location.toUpperCase()}`}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onDeleted && (
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(true)} disabled={deleting}>
              Delete mission
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={submitting}
            iconLeft={<Icon name="save" />}
          >
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <PlacePicker
          selectedPlace={selectedPlace}
          onPlaceChange={setSelectedPlace}
          disabled={submitting}
          editingPlaceId={trip.placeId}
        />
        <Input
          label="Date of Deployment"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <TextArea label="Operator Notes" rows={4} error={errors.notes?.message} {...register('notes')} />
      </form>
    </Modal>

    <ConfirmModal
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={() => void handleDelete()}
      loading={deleting}
      subtitle="// CONFIRM PURGE"
      title="Delete mission"
      message="This will permanently delete this mission and every catch logged on it. This action cannot be undone."
      confirmLabel="Delete mission"
      cancelLabel="Abort"
    />
    </>
  );
}
