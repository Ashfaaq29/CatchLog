import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Place } from '../../types';
import { listPlaces, deletePlace, updatePlace } from '../../services/place.service';
import { extractErrorMessage } from '../../services/api';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { SonarSpinner } from '../ui/Spinner';
import { PlacePicker } from './PlacePicker';

export interface PlacesManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function PlacesManagerModal({ open, onClose }: PlacesManagerModalProps): JSX.Element {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Place | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const items = await listPlaces();
      setPlaces(items);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'LOAD PLACES FAILED'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
    else setEditing(null);
  }, [open, load]);

  const confirmDeletePlace = async (): Promise<void> => {
    if (!placeToDelete) return;
    setDeleting(true);
    try {
      await deletePlace(placeToDelete.id);
      toast.success('SECTOR DELETED');
      setPlaces((prev) => prev.filter((p) => p.id !== placeToDelete.id));
      setPlaceToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'DELETE FAILED'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editing) return;
    try {
      const updated = await updatePlace(editing.id, {
        name: editing.name,
        latitude: editing.latitude,
        longitude: editing.longitude,
        geocodeLabel: editing.geocodeLabel,
        notes: editing.notes,
      });
      setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditing(null);
      toast.success('SECTOR UPDATED');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'UPDATE FAILED'));
    }
  };

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      title="Sector Registry"
      subtitle="// MANAGE PLACES"
      width="lg"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {editing ? (
        <div className="space-y-md">
          <PlacePicker
            selectedPlace={editing}
            onPlaceChange={setEditing}
            editingPlaceId={editing.id}
            disabled={false}
          />
          <div className="flex gap-sm justify-end">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleSaveEdit()}>
              Save sector
            </Button>
          </div>
        </div>
      ) : loading ? (
        <SonarSpinner label="LOADING SECTORS" />
      ) : places.length === 0 ? (
        <p className="font-data-sm text-on-surface-variant">No saved sectors yet.</p>
      ) : (
        <ul className="space-y-sm max-h-96 overflow-y-auto">
          {places.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-sm p-md rounded-lg border border-outline-variant/30 bg-surface-container-low/40"
            >
              <div className="min-w-0">
                <span className="font-label-caps text-primary text-xs block truncate">{p.name}</span>
                <span className="font-data-sm text-[10px] text-on-surface-variant">
                  {p.catchCount} catches · {p.tripCount} missions · {p.latitude.toFixed(4)},{' '}
                  {p.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex gap-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="p-1 text-on-surface-variant hover:text-secondary-container"
                  aria-label="Edit"
                >
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaceToDelete(p)}
                  className="p-1 text-on-surface-variant hover:text-error"
                  aria-label="Delete"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>

    <ConfirmModal
      open={placeToDelete != null}
      onClose={() => setPlaceToDelete(null)}
      onConfirm={() => void confirmDeletePlace()}
      loading={deleting}
      subtitle="// CONFIRM PURGE"
      title="Delete sector"
      message={
        placeToDelete
          ? `Delete "${placeToDelete.name}" from the sector registry? You must remove or reassign all linked missions first.`
          : ''
      }
      confirmLabel="Delete sector"
      cancelLabel="Abort"
    />
    </>
  );
}
