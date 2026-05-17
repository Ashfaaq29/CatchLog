import { Types } from 'mongoose';
import { Place, type PlaceDoc } from '../models/Place';
import { Trip } from '../models/Trip';
import { Catch } from '../models/Catch';
import { AppError } from '../utils/AppError';
import type { CreatePlaceInput, UpdatePlaceInput } from '../utils/validators';

export interface PlaceDTO {
  id: string;
  user: string;
  name: string;
  latitude: number;
  longitude: number;
  geocodeLabel?: string;
  notes: string;
  tripCount: number;
  catchCount: number;
  lastFishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function placeToDTO(
  place: PlaceDoc,
  stats?: { tripCount: number; catchCount: number; lastFishedAt: Date | null },
): PlaceDTO {
  return {
    id: place._id.toString(),
    user: place.user.toString(),
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    ...(place.geocodeLabel ? { geocodeLabel: place.geocodeLabel } : {}),
    notes: place.notes ?? '',
    tripCount: stats?.tripCount ?? 0,
    catchCount: stats?.catchCount ?? 0,
    lastFishedAt: stats?.lastFishedAt ?? null,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}

export async function loadOwnedPlace(userId: string, placeId: string): Promise<PlaceDoc> {
  if (!Types.ObjectId.isValid(placeId)) {
    throw AppError.notFound('Place not found');
  }
  const place = await Place.findById(placeId);
  if (!place) throw AppError.notFound('Place not found');
  if (place.user.toString() !== userId) {
    throw AppError.forbidden('You do not own this place');
  }
  return place;
}

async function statsForPlaces(
  userId: string,
  placeIds: Types.ObjectId[],
): Promise<Map<string, { tripCount: number; catchCount: number; lastFishedAt: Date | null }>> {
  const result = new Map<string, { tripCount: number; catchCount: number; lastFishedAt: Date | null }>();
  if (placeIds.length === 0) return result;

  const userObjectId = new Types.ObjectId(userId);
  const trips = await Trip.find({ user: userObjectId, place: { $in: placeIds } }).lean();
  const tripIds = trips.map((t) => t._id);
  const tripIdToPlace = new Map(trips.map((t) => [t._id.toString(), t.place!.toString()]));

  for (const pid of placeIds) {
    result.set(pid.toString(), { tripCount: 0, catchCount: 0, lastFishedAt: null });
  }

  for (const t of trips) {
    const pid = t.place!.toString();
    const s = result.get(pid)!;
    s.tripCount += 1;
    const d = t.date instanceof Date ? t.date : new Date(t.date);
    if (!s.lastFishedAt || d > s.lastFishedAt) s.lastFishedAt = d;
  }

  if (tripIds.length > 0) {
    const catchAgg = await Catch.aggregate<{
      _id: Types.ObjectId;
      count: number;
      lastAt: Date;
    }>([
      { $match: { trip: { $in: tripIds } } },
      { $group: { _id: '$trip', count: { $sum: 1 }, lastAt: { $max: '$createdAt' } } },
    ]);
    for (const row of catchAgg) {
      const pid = tripIdToPlace.get(row._id.toString());
      if (!pid) continue;
      const s = result.get(pid)!;
      s.catchCount += row.count;
      if (!s.lastFishedAt || row.lastAt > s.lastFishedAt) s.lastFishedAt = row.lastAt;
    }
  }

  return result;
}

export async function listPlaces(userId: string): Promise<PlaceDTO[]> {
  const userObjectId = new Types.ObjectId(userId);
  const places = await Place.find({ user: userObjectId }).sort({ name: 1 });
  const stats = await statsForPlaces(
    userId,
    places.map((p) => p._id),
  );
  return places.map((p) => placeToDTO(p, stats.get(p._id.toString())));
}

export async function createPlace(userId: string, input: CreatePlaceInput): Promise<PlaceDTO> {
  const place = await Place.create({
    user: new Types.ObjectId(userId),
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    geocodeLabel: input.geocodeLabel,
    notes: input.notes ?? '',
  });
  return placeToDTO(place, { tripCount: 0, catchCount: 0, lastFishedAt: null });
}

export async function updatePlace(
  userId: string,
  placeId: string,
  input: UpdatePlaceInput,
): Promise<PlaceDTO> {
  const place = await loadOwnedPlace(userId, placeId);
  if (input.name !== undefined) place.name = input.name;
  if (input.latitude !== undefined) place.latitude = input.latitude;
  if (input.longitude !== undefined) place.longitude = input.longitude;
  if (input.geocodeLabel !== undefined) place.geocodeLabel = input.geocodeLabel;
  if (input.notes !== undefined) place.notes = input.notes;
  await place.save();

  const stats = await statsForPlaces(userId, [place._id]);
  return placeToDTO(place, stats.get(place._id.toString()));
}

export async function deletePlace(userId: string, placeId: string): Promise<void> {
  const place = await loadOwnedPlace(userId, placeId);
  const linked = await Trip.countDocuments({ place: place._id });
  if (linked > 0) {
    throw AppError.conflict(
      `Cannot delete place: ${linked} mission(s) still linked. Reassign or delete them first.`,
    );
  }
  await place.deleteOne();
}
