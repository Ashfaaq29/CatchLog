import { Types } from 'mongoose';
import { Catch, type CatchDoc } from '../models/Catch';
import { Trip } from '../models/Trip';
import { AppError } from '../utils/AppError';
import { deleteObject, uploadBuffer } from './upload.service';
import { loadOwnedTrip } from './trip.service';
import type { CreateCatchInput, PaginationInput, UpdateCatchInput } from '../utils/validators';

export interface CatchDTO {
  id: string;
  trip: string;
  user: string;
  fishType: string;
  weight?: number;
  length?: number;
  imageUrl?: string;
  notes: string;
  createdAt: Date;
  tripLocation?: string;
  userName?: string;
}

export function catchToDTO(c: CatchDoc, extras?: { tripLocation?: string; userName?: string }): CatchDTO {
  return {
    id: c._id.toString(),
    trip: c.trip.toString(),
    user: c.user.toString(),
    fishType: c.fishType,
    weight: c.weight,
    length: c.length,
    imageUrl: c.imageUrl,
    notes: c.notes ?? '',
    createdAt: c.createdAt,
    ...(extras ?? {}),
  };
}

export async function listCatchesForTrip(userId: string, tripId: string): Promise<CatchDTO[]> {
  await loadOwnedTrip(userId, tripId);
  const catches = await Catch.find({ trip: new Types.ObjectId(tripId) }).sort({ createdAt: -1 });
  return catches.map((c) => catchToDTO(c));
}

export interface CreateCatchOptions {
  userId: string;
  tripId: string;
  input: CreateCatchInput;
  file?: Express.Multer.File;
}

export async function createCatch(opts: CreateCatchOptions): Promise<CatchDTO> {
  const trip = await loadOwnedTrip(opts.userId, opts.tripId);

  let imageUrl: string | undefined;
  let imageKey: string | undefined;
  if (opts.file) {
    const uploaded = await uploadBuffer({
      buffer: opts.file.buffer,
      mimeType: opts.file.mimetype,
      originalName: opts.file.originalname,
      folder: `catches/${trip._id.toString()}`,
    });
    imageUrl = uploaded.url;
    imageKey = uploaded.key;
  }

  const created = await Catch.create({
    trip: trip._id,
    user: trip.user,
    fishType: opts.input.fishType,
    weight: opts.input.weight,
    length: opts.input.length,
    notes: opts.input.notes ?? '',
    imageUrl,
    imageKey,
  });

  return catchToDTO(created);
}

export interface UpdateCatchOptions {
  userId: string;
  catchId: string;
  input: UpdateCatchInput;
  file?: Express.Multer.File;
}

export async function updateCatch(opts: UpdateCatchOptions): Promise<CatchDTO> {
  if (!Types.ObjectId.isValid(opts.catchId)) {
    throw AppError.notFound('Catch not found');
  }
  const c = await Catch.findById(opts.catchId);
  if (!c) throw AppError.notFound('Catch not found');
  if (c.user.toString() !== opts.userId) throw AppError.forbidden('You do not own this catch');

  const { input, file } = opts;
  if (input.fishType !== undefined) c.fishType = input.fishType;
  if (input.weight !== undefined) c.weight = input.weight ?? undefined;
  if (input.length !== undefined) c.length = input.length ?? undefined;
  if (input.notes !== undefined) c.notes = input.notes;

  if (input.removeImage && c.imageKey) {
    await deleteObject(c.imageKey);
    c.imageUrl = undefined;
    c.imageKey = undefined;
  }

  if (file) {
    if (c.imageKey) await deleteObject(c.imageKey);
    const uploaded = await uploadBuffer({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      folder: `catches/${c.trip.toString()}`,
    });
    c.imageUrl = uploaded.url;
    c.imageKey = uploaded.key;
  }

  await c.save();

  const trip = await Trip.findById(c.trip).select('location').lean();
  return catchToDTO(c, { tripLocation: trip?.location });
}

export async function deleteCatch(userId: string, catchId: string): Promise<void> {
  if (!Types.ObjectId.isValid(catchId)) {
    throw AppError.notFound('Catch not found');
  }
  const c = await Catch.findById(catchId);
  if (!c) throw AppError.notFound('Catch not found');
  if (c.user.toString() !== userId) throw AppError.forbidden('You do not own this catch');
  if (c.imageKey) await deleteObject(c.imageKey);
  await c.deleteOne();
}

export async function publicGalleryFeed(
  pagination: PaginationInput,
): Promise<{ items: CatchDTO[]; page: number; limit: number; total: number; hasMore: boolean }> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Catch.find({ imageUrl: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ trip: { location: string } }>('trip', 'location')
      .populate<{ user: { name: string } }>('user', 'name'),
    Catch.countDocuments({ imageUrl: { $exists: true, $ne: '' } }),
  ]);

  const items = docs.map((d) => {
    const tripLocation = (d.trip as unknown as { location?: string } | null)?.location;
    const userName = (d.user as unknown as { name?: string } | null)?.name;
    return catchToDTO(d as unknown as CatchDoc, { tripLocation, userName });
  });

  return {
    items,
    page,
    limit,
    total,
    hasMore: skip + docs.length < total,
  };
}

export async function recentForUser(userId: string, limit = 5): Promise<CatchDTO[]> {
  const docs = await Catch.find({ user: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate<{ trip: { location: string } }>('trip', 'location');
  return docs.map((d) => {
    const tripLocation = (d.trip as unknown as { location?: string } | null)?.location;
    return catchToDTO(d as unknown as CatchDoc, { tripLocation });
  });
}

// Ensure Trip model registration is referenced for populate.
void Trip;
