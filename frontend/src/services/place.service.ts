import { api } from './api';
import type { Place } from '../types';

export async function listPlaces(): Promise<Place[]> {
  const { data } = await api.get<{ items: Place[] }>('/places');
  return data.items;
}

export async function createPlace(input: {
  name: string;
  latitude: number;
  longitude: number;
  geocodeLabel?: string;
  notes?: string;
}): Promise<Place> {
  const { data } = await api.post<Place>('/places', input);
  return data;
}

export async function updatePlace(
  id: string,
  input: Partial<{
    name: string;
    latitude: number;
    longitude: number;
    geocodeLabel: string;
    notes: string;
  }>,
): Promise<Place> {
  const { data } = await api.patch<Place>(`/places/${id}`, input);
  return data;
}

export async function deletePlace(id: string): Promise<void> {
  await api.delete(`/places/${id}`);
}
