import { api } from './api';
import type { Catch, GalleryResponse } from '../types';

export async function listForTrip(tripId: string): Promise<Catch[]> {
  const { data } = await api.get<{ items: Catch[] }>(`/catches/${tripId}`);
  return data.items;
}

export async function createForTrip(
  tripId: string,
  input: {
    fishType: string;
    weight?: number;
    length?: number;
    notes?: string;
    image?: File | null;
  },
): Promise<Catch> {
  const fd = new FormData();
  fd.append('fishType', input.fishType);
  if (input.weight !== undefined && !Number.isNaN(input.weight))
    fd.append('weight', String(input.weight));
  if (input.length !== undefined && !Number.isNaN(input.length))
    fd.append('length', String(input.length));
  if (input.notes) fd.append('notes', input.notes);
  if (input.image) fd.append('image', input.image);

  const { data } = await api.post<Catch>(`/catches/${tripId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateCatch(
  id: string,
  input: {
    fishType?: string;
    weight?: number | null;
    length?: number | null;
    notes?: string;
    removeImage?: boolean;
    image?: File | null;
  },
): Promise<Catch> {
  const fd = new FormData();
  if (input.fishType !== undefined) fd.append('fishType', input.fishType);
  if (input.weight !== undefined) fd.append('weight', input.weight === null ? '' : String(input.weight));
  if (input.length !== undefined) fd.append('length', input.length === null ? '' : String(input.length));
  if (input.notes !== undefined) fd.append('notes', input.notes);
  if (input.removeImage) fd.append('removeImage', 'true');
  if (input.image) fd.append('image', input.image);

  const { data } = await api.patch<Catch>(`/catches/single/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteCatch(id: string): Promise<void> {
  await api.delete(`/catches/single/${id}`);
}

export async function gallery(page = 1, limit = 12): Promise<GalleryResponse> {
  const { data } = await api.get<GalleryResponse>('/catches', { params: { page, limit } });
  return data;
}
