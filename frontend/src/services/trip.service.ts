import { api } from './api';
import type { Trip, Catch, Stats } from '../types';

export async function listTrips(): Promise<Trip[]> {
  const { data } = await api.get<{ items: Trip[] }>('/trips');
  return data.items;
}

export async function createTrip(input: {
  location: string;
  date: string;
  notes?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Trip> {
  const { data } = await api.post<Trip>('/trips', input);
  return data;
}

export async function updateTrip(
  id: string,
  input: Partial<{
    location: string;
    date: string;
    notes: string;
    placeId: string | null;
    latitude: number;
    longitude: number;
  }>,
): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}`, input);
  return data;
}

export async function updateTripCoords(
  tripId: string,
  coords: { latitude: number; longitude: number },
): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${tripId}/coords`, coords);
  return data;
}

export async function getTrip(id: string): Promise<{ trip: Trip; catches: Catch[] }> {
  const { data } = await api.get<{ trip: Trip; catches: Catch[] }>(`/trips/${id}`);
  return data;
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(`/trips/${id}`);
}

export async function getStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/trips/stats');
  return data;
}
