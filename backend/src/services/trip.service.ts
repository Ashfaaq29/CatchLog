import { Types } from 'mongoose';
import { Trip, type TripDoc } from '../models/Trip';
import { Catch } from '../models/Catch';
import { AppError } from '../utils/AppError';
import { deleteFromS3 } from './upload.service';
import { geocodeLocation } from './openmeteo.client';
import { loadOwnedPlace } from './place.service';
import type { CreateTripInput, UpdateTripCoordsInput, UpdateTripInput } from '../utils/validators';

export interface TripDTO {
  id: string;
  user: string;
  placeId?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  notes: string;
  catchCount?: number;
  createdAt: Date;
}

export function tripToDTO(trip: TripDoc, catchCount?: number): TripDTO {
  return {
    id: trip._id.toString(),
    user: trip.user.toString(),
    ...(trip.place ? { placeId: trip.place.toString() } : {}),
    location: trip.location,
    ...(trip.latitude != null ? { latitude: trip.latitude } : {}),
    ...(trip.longitude != null ? { longitude: trip.longitude } : {}),
    date: trip.date,
    notes: trip.notes ?? '',
    ...(catchCount !== undefined ? { catchCount } : {}),
    createdAt: trip.createdAt,
  };
}

export async function listTrips(userId: string): Promise<TripDTO[]> {
  const userObjectId = new Types.ObjectId(userId);
  const trips = await Trip.find({ user: userObjectId }).sort({ date: -1, createdAt: -1 });

  if (trips.length === 0) return [];

  const counts = await Catch.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { trip: { $in: trips.map((t) => t._id) } } },
    { $group: { _id: '$trip', count: { $sum: 1 } } },
  ]);
  const countByTrip = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return trips.map((t) => tripToDTO(t, countByTrip.get(t._id.toString()) ?? 0));
}

async function resolveTripCoordinates(
  location: string,
  explicit?: { latitude: number; longitude: number },
): Promise<{ latitude?: number; longitude?: number }> {
  if (explicit) {
    return { latitude: explicit.latitude, longitude: explicit.longitude };
  }
  try {
    const geo =
      (await geocodeLocation(location)) ??
      (await geocodeLocation(`${location}, Mauritius`));
    if (geo) {
      return { latitude: geo.latitude, longitude: geo.longitude };
    }
  } catch {
    // Geocoding is best-effort; trip creation must not fail.
  }
  return {};
}

export async function createTrip(userId: string, input: CreateTripInput): Promise<TripDTO> {
  let location = input.location;
  let latitude = input.latitude;
  let longitude = input.longitude;
  let placeRef: Types.ObjectId | undefined;

  if (input.placeId) {
    const place = await loadOwnedPlace(userId, input.placeId);
    placeRef = place._id;
    location = input.location.trim() ? input.location : place.name;
    latitude = place.latitude;
    longitude = place.longitude;
  } else {
    const explicit =
      input.latitude != null && input.longitude != null
        ? { latitude: input.latitude, longitude: input.longitude }
        : undefined;
    const resolved = await resolveTripCoordinates(input.location, explicit);
    latitude = resolved.latitude;
    longitude = resolved.longitude;
  }

  const trip = await Trip.create({
    user: new Types.ObjectId(userId),
    ...(placeRef ? { place: placeRef } : {}),
    location,
    ...(latitude != null && longitude != null ? { latitude, longitude } : {}),
    date: input.date,
    notes: input.notes ?? '',
  });
  return tripToDTO(trip, 0);
}

export async function updateTrip(
  userId: string,
  tripId: string,
  input: UpdateTripInput,
): Promise<TripDTO> {
  const trip = await loadOwnedTrip(userId, tripId);

  if (input.placeId !== undefined) {
    if (input.placeId === null) {
      trip.place = undefined;
    } else {
      const place = await loadOwnedPlace(userId, input.placeId);
      trip.place = place._id;
      if (input.location !== undefined) {
        trip.location = input.location;
        place.name = input.location;
      } else {
        trip.location = place.name;
      }
      const lat = input.latitude ?? place.latitude;
      const lon = input.longitude ?? place.longitude;
      trip.latitude = lat;
      trip.longitude = lon;
      place.latitude = lat;
      place.longitude = lon;
      await place.save();
    }
  } else {
    if (input.location !== undefined) trip.location = input.location;
    if (input.latitude !== undefined && input.longitude !== undefined) {
      trip.latitude = input.latitude;
      trip.longitude = input.longitude;
    }
  }

  if (input.date !== undefined) trip.date = input.date;
  if (input.notes !== undefined) trip.notes = input.notes;

  await trip.save();
  const catchCount = await Catch.countDocuments({ trip: trip._id });
  return tripToDTO(trip, catchCount);
}

export async function updateTripCoords(
  userId: string,
  tripId: string,
  input: UpdateTripCoordsInput,
): Promise<TripDTO> {
  const trip = await loadOwnedTrip(userId, tripId);
  trip.latitude = input.latitude;
  trip.longitude = input.longitude;
  await trip.save();
  const catchCount = await Catch.countDocuments({ trip: trip._id });
  return tripToDTO(trip, catchCount);
}

export async function loadOwnedTrip(userId: string, tripId: string): Promise<TripDoc> {
  if (!Types.ObjectId.isValid(tripId)) {
    throw AppError.notFound('Trip not found');
  }
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw AppError.notFound('Trip not found');
  }
  if (trip.user.toString() !== userId) {
    throw AppError.forbidden('You do not own this trip');
  }
  return trip;
}

export async function getTrip(userId: string, tripId: string): Promise<TripDTO> {
  const trip = await loadOwnedTrip(userId, tripId);
  const catchCount = await Catch.countDocuments({ trip: trip._id });
  return tripToDTO(trip, catchCount);
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  const trip = await loadOwnedTrip(userId, tripId);

  const catches = await Catch.find({ trip: trip._id });
  await Promise.all(
    catches.map((c) => (c.imageKey ? deleteFromS3(c.imageKey) : Promise.resolve())),
  );
  await Catch.deleteMany({ trip: trip._id });
  await trip.deleteOne();
}

export async function getStats(userId: string): Promise<{
  totalTrips: number;
  totalCatches: number;
  heaviestCatch: { weight: number; fishType: string; date: Date } | null;
  topLocation: { location: string; count: number } | null;
}> {
  const userObjectId = new Types.ObjectId(userId);
  const [totalTrips, totalCatches, heaviest, topLocationAgg] = await Promise.all([
    Trip.countDocuments({ user: userObjectId }),
    Catch.countDocuments({ user: userObjectId }),
    Catch.findOne({ user: userObjectId, weight: { $exists: true, $gt: 0 } })
      .sort({ weight: -1 })
      .lean(),
    Trip.aggregate<{ _id: string; count: number }>([
      { $match: { user: userObjectId } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  return {
    totalTrips,
    totalCatches,
    heaviestCatch:
      heaviest && heaviest.weight
        ? { weight: heaviest.weight, fishType: heaviest.fishType, date: heaviest.createdAt }
        : null,
    topLocation: topLocationAgg[0]
      ? { location: topLocationAgg[0]._id, count: topLocationAgg[0].count }
      : null,
  };
}
