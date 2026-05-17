import { Types } from 'mongoose';
import { Trip } from '../models/Trip';
import { Catch } from '../models/Catch';
import { AppError } from '../utils/AppError';
import { geocodeLocation, geocodeSuggestions } from './openmeteo.client';

const DEFAULT_CENTER = {
  lat: -20.2,
  lon: 57.5,
  label: 'Mauritius Theatre',
};

export interface MapDeployment {
  id: string;
  location: string;
  lat: number;
  lon: number;
  date: Date;
  catchCount: number;
}

export interface MapCatchPin {
  id: string;
  fishType: string;
  weight?: number;
  imageUrl?: string;
  lat: number;
  lon: number;
  tripLocation: string;
  userName?: string;
  createdAt: Date;
}

export interface SonarMapPayload {
  center: { lat: number; lon: number; label: string };
  deployments: MapDeployment[];
  myCatches: MapCatchPin[];
  publicPings: MapCatchPin[];
}

interface TripCoords {
  location: string;
  latitude?: number;
  longitude?: number;
}

function tripCoords(trip: TripCoords | null | undefined): { lat: number; lon: number } | null {
  if (trip?.latitude != null && trip?.longitude != null) {
    return { lat: trip.latitude, lon: trip.longitude };
  }
  return null;
}

export async function getSonarMap(userId: string): Promise<SonarMapPayload> {
  const userObjectId = new Types.ObjectId(userId);

  const trips = await Trip.find({
    user: userObjectId,
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null },
  })
    .sort({ date: -1 })
    .lean();

  const tripIds = trips.map((t) => t._id);
  const counts =
    tripIds.length > 0
      ? await Catch.aggregate<{ _id: Types.ObjectId; count: number }>([
          { $match: { trip: { $in: tripIds } } },
          { $group: { _id: '$trip', count: { $sum: 1 } } },
        ])
      : [];
  const countByTrip = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const deployments: MapDeployment[] = trips
    .filter((t) => t.latitude != null && t.longitude != null)
    .map((t) => ({
      id: t._id.toString(),
      location: t.location,
      lat: t.latitude!,
      lon: t.longitude!,
      date: t.date,
      catchCount: countByTrip.get(t._id.toString()) ?? 0,
    }));

  const myCatchDocs = await Catch.find({ user: userObjectId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate<{ trip: TripCoords | null }>('trip', 'location latitude longitude')
    .lean();

  const myCatches: MapCatchPin[] = [];
  for (const c of myCatchDocs) {
    const coords = tripCoords(c.trip);
    if (!coords) continue;
    myCatches.push({
      id: c._id.toString(),
      fishType: c.fishType,
      weight: c.weight,
      imageUrl: c.imageUrl,
      lat: coords.lat,
      lon: coords.lon,
      tripLocation: c.trip?.location ?? 'Unknown',
      createdAt: c.createdAt,
    });
  }

  const publicDocs = await Catch.find({ imageUrl: { $exists: true, $ne: '' } })
    .sort({ createdAt: -1 })
    .limit(150)
    .populate<{ trip: TripCoords | null }>('trip', 'location latitude longitude')
    .populate<{ user: { name: string } | null }>('user', 'name')
    .lean();

  const myCatchIds = new Set(myCatches.map((c) => c.id));
  const publicPings: MapCatchPin[] = [];
  for (const c of publicDocs) {
    const coords = tripCoords(c.trip);
    if (!coords) continue;
    const id = c._id.toString();
    if (myCatchIds.has(id)) continue;
    publicPings.push({
      id,
      fishType: c.fishType,
      weight: c.weight,
      imageUrl: c.imageUrl,
      lat: coords.lat,
      lon: coords.lon,
      tripLocation: c.trip?.location ?? 'Unknown',
      userName: (c.user as { name?: string } | null)?.name,
      createdAt: c.createdAt,
    });
  }

  const latest = deployments[0];
  const center = latest
    ? { lat: latest.lat, lon: latest.lon, label: latest.location }
    : DEFAULT_CENTER;

  return { center, deployments, myCatches, publicPings };
}

export async function geocodeSearch(query: string): Promise<{ lat: number; lon: number; label: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw AppError.badRequest('Search query is required');
  }

  const latLonMatch = trimmed.match(/^(-?\d+\.?\d*)\s*[,;\s]\s*(-?\d+\.?\d*)$/);
  if (latLonMatch) {
    const lat = Number(latLonMatch[1]);
    const lon = Number(latLonMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon, label: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°` };
    }
  }

  const geo =
    (await geocodeLocation(trimmed)) ?? (await geocodeLocation(`${trimmed}, Mauritius`));
  if (!geo) {
    throw AppError.badRequest(`Could not find coordinates for "${trimmed}"`);
  }
  return { lat: geo.latitude, lon: geo.longitude, label: geo.name };
}

export async function geocodeSuggest(
  query: string,
): Promise<{ results: Array<{ lat: number; lon: number; label: string }> }> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw AppError.badRequest('Search query is required');
  }

  const latLonMatch = trimmed.match(/^(-?\d+\.?\d*)\s*[,;\s]\s*(-?\d+\.?\d*)$/);
  if (latLonMatch) {
    const lat = Number(latLonMatch[1]);
    const lon = Number(latLonMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return {
        results: [{ lat, lon, label: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°` }],
      };
    }
  }

  let results = await geocodeSuggestions(trimmed, 8);
  if (results.length === 0) {
    results = await geocodeSuggestions(`${trimmed}, Mauritius`, 8);
  }

  return {
    results: results.map((g) => ({
      lat: g.latitude,
      lon: g.longitude,
      label: g.name,
    })),
  };
}
