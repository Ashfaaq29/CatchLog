import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { GlassPanel } from '../ui/GlassPanel';
import { PlacePicker } from '../places/PlacePicker';
import { MissionPicker } from '../places/MissionPicker';
import { createForTrip } from '../../services/catch.service';
import { createTrip, listTrips } from '../../services/trip.service';
import { extractErrorMessage } from '../../services/api';
import type { Catch, Place, Trip } from '../../types';

const schema = z.object({
  fishType: z.string().trim().min(1, 'Required').max(80),
  weight: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 5000), 'Invalid weight'),
  length: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 1000), 'Invalid length'),
  notes: z.string().trim().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;
type Step = 'place' | 'mission' | 'catch';

export interface LogCatchModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (catchItem: Catch) => void;
  defaultTripId?: string;
  trips?: Trip[];
}

export function LogCatchModal({
  open,
  onClose,
  onCreated,
  defaultTripId,
  trips: tripsProp,
}: LogCatchModalProps): JSX.Element {
  const [step, setStep] = useState<Step>('place');
  const [trips, setTrips] = useState<Trip[]>(tripsProp ?? []);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(defaultTripId ?? null);
  const [creatingMission, setCreatingMission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fishType: '', weight: undefined, length: undefined, notes: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (tripsProp) {
      setTrips(tripsProp);
      return;
    }
    void listTrips().then(setTrips).catch(() => {});
  }, [open, tripsProp]);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!open) {
      setStep('place');
      setSelectedPlace(null);
      setSelectedTripId(defaultTripId ?? null);
      reset();
      setImageFile(null);
      return;
    }
    if (defaultTripId && trips.length > 0) {
      const trip = trips.find((t) => t.id === defaultTripId);
      if (trip) {
        setSelectedTripId(trip.id);
        setStep('catch');
      }
    }
  }, [open, defaultTripId, reset, trips]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('IMAGE EXCEEDS 10MB LIMIT');
      return;
    }
    setImageFile(file);
  };

  const continueFromPlace = (): void => {
    if (!selectedPlace) {
      toast.error('SELECT OR SAVE A PLACE FIRST');
      return;
    }
    setStep('mission');
  };

  const createNewMission = async (): Promise<void> => {
    if (!selectedPlace) return;
    setCreatingMission(true);
    try {
      const trip = await createTrip({
        location: selectedPlace.name,
        placeId: selectedPlace.id,
        date: new Date().toISOString(),
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      });
      setTrips((prev) => [trip, ...prev]);
      setSelectedTripId(trip.id);
      toast.success('NEW MISSION DEPLOYED');
      setStep('catch');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'MISSION CREATE FAILED'));
    } finally {
      setCreatingMission(false);
    }
  };

  const continueFromMission = (): void => {
    if (!selectedTripId) {
      toast.error('SELECT A MISSION OR CREATE A NEW ONE');
      return;
    }
    setStep('catch');
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!selectedTripId) {
      toast.error('NO MISSION SELECTED');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createForTrip(selectedTripId, {
        fishType: values.fishType,
        weight: values.weight,
        length: values.length,
        notes: values.notes,
        image: imageFile,
      });
      toast.success('CATCH LOGGED // RECORD CONFIRMED');
      reset();
      setImageFile(null);
      onCreated(result);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'CATCH LOG FAILED'));
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitle =
    step === 'place' ? 'Select sector' : step === 'mission' ? 'Select mission' : 'Log catch';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Catch"
      subtitle={`// ${stepTitle.toUpperCase()}`}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Abort
          </Button>
          {step === 'place' && (
            <Button variant="primary" onClick={continueFromPlace} disabled={!selectedPlace}>
              Continue
            </Button>
          )}
          {step === 'mission' && (
            <>
              <Button variant="ghost" onClick={() => setStep('place')}>
                Back
              </Button>
              <Button variant="primary" onClick={continueFromMission} disabled={!selectedTripId}>
                Continue
              </Button>
            </>
          )}
          {step === 'catch' && (
            <>
              <Button variant="ghost" onClick={() => setStep('mission')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit(onSubmit)}
                loading={submitting}
                iconLeft={<Icon name="set_meal" className="text-base" />}
              >
                Confirm Catch
              </Button>
            </>
          )}
        </>
      }
    >
      {step === 'place' && (
        <PlacePicker selectedPlace={selectedPlace} onPlaceChange={setSelectedPlace} />
      )}

      {step === 'mission' && selectedPlace && (
        <MissionPicker
          place={selectedPlace}
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={setSelectedTripId}
          onNewMission={() => void createNewMission()}
          creating={creatingMission}
        />
      )}

      {step === 'catch' && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-md" noValidate>
          <div className="flex flex-col gap-md">
            <Input
              label="Fish Type"
              placeholder="e.g. Striped Bass"
              iconLeft={<Icon name="phishing" className="text-base" />}
              error={errors.fishType?.message}
              {...register('fishType')}
            />
            <div className="grid grid-cols-2 gap-md">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="0"
                error={errors.weight?.message}
                {...register('weight')}
              />
              <Input
                label="Length (cm)"
                type="number"
                step="1"
                min="0"
                error={errors.length?.message}
                {...register('length')}
              />
            </div>
            <TextArea
              label="Notes"
              placeholder="Bait, technique, conditions…"
              rows={4}
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
          <div className="flex flex-col gap-sm">
            <span className="label-tactical">Capture Photo</span>
            <GlassPanel
              bg="lowest"
              emissive="cyan"
              rounded="lg"
              padding="none"
              className="relative aspect-[4/3] flex items-center justify-center overflow-hidden cursor-pointer hover:bg-surface-container/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-sm text-on-surface-variant">
                  <Icon name="add_a_photo" className="text-4xl" />
                  <span className="font-label-caps text-label-caps tracking-widest uppercase">
                    Tap to attach
                  </span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFile}
              />
            </GlassPanel>
            {imageFile && (
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="font-label-caps text-[11px] tracking-widest uppercase text-error hover:text-shadow-orange transition-all self-end"
              >
                Remove image
              </button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
