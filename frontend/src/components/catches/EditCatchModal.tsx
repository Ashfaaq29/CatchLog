import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { GlassPanel } from '../ui/GlassPanel';
import { updateCatch, deleteCatch } from '../../services/catch.service';
import { extractErrorMessage } from '../../services/api';
import type { Catch } from '../../types';

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

export interface EditCatchModalProps {
  open: boolean;
  catchItem: Catch | null;
  onClose: () => void;
  onUpdated: (item: Catch) => void;
  onDeleted?: (id: string) => void;
}

export function EditCatchModal({
  open,
  catchItem,
  onClose,
  onUpdated,
  onDeleted,
}: EditCatchModalProps): JSX.Element | null {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!catchItem || !open) return;
    reset({
      fishType: catchItem.fishType,
      weight: catchItem.weight,
      length: catchItem.length,
      notes: catchItem.notes ?? '',
    });
    setImageFile(null);
    setRemoveImage(false);
    setPreview(catchItem.imageUrl ?? null);
  }, [catchItem, open, reset]);

  useEffect(() => {
    if (!imageFile) {
      if (!removeImage && catchItem?.imageUrl) setPreview(catchItem.imageUrl);
      else if (!removeImage) setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, removeImage, catchItem?.imageUrl]);

  if (!catchItem) return null;

  const onSubmit = async (values: FormValues): Promise<void> => {
    setSubmitting(true);
    try {
      const updated = await updateCatch(catchItem.id, {
        fishType: values.fishType,
        weight: values.weight,
        length: values.length,
        notes: values.notes,
        removeImage,
        image: imageFile,
      });
      toast.success('CATCH RECORD UPDATED');
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
      await deleteCatch(catchItem.id);
      toast.success('CATCH DELETED');
      setDeleteConfirmOpen(false);
      onDeleted?.(catchItem.id);
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
      title="Edit Catch"
      subtitle="// TACTICAL FIELD UPDATE"
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onDeleted && (
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(true)} disabled={deleting}>
              Delete
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
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-md" noValidate>
        <div className="flex flex-col gap-md">
          <Input
            label="Fish Type"
            error={errors.fishType?.message}
            {...register('fishType')}
          />
          <div className="grid grid-cols-2 gap-md">
            <Input label="Weight (kg)" type="number" step="0.1" error={errors.weight?.message} {...register('weight')} />
            <Input label="Length (cm)" type="number" step="1" error={errors.length?.message} {...register('length')} />
          </div>
          <TextArea label="Notes" rows={4} error={errors.notes?.message} {...register('notes')} />
        </div>
        <div className="flex flex-col gap-sm">
          <span className="label-tactical">Photo</span>
          <GlassPanel
            bg="lowest"
            rounded="lg"
            padding="none"
            className="relative aspect-[4/3] overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-on-surface-variant">
                <Icon name="image_not_supported" className="text-4xl" />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  setImageFile(file);
                  setRemoveImage(false);
                }
              }}
            />
          </GlassPanel>
          <div className="flex gap-sm justify-end">
            {catchItem.imageUrl && !removeImage && (
              <button
                type="button"
                className="font-label-caps text-[11px] text-error"
                onClick={() => {
                  setRemoveImage(true);
                  setImageFile(null);
                  setPreview(null);
                }}
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>

    <ConfirmModal
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={() => void handleDelete()}
      loading={deleting}
      subtitle="// CONFIRM PURGE"
      title="Delete catch"
      message="This will permanently delete this catch record and its photo. This action cannot be undone."
      confirmLabel="Delete catch"
      cancelLabel="Abort"
    />
    </>
  );
}
