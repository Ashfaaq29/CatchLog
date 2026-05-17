import type { Request, Response } from 'express';
import * as catchService from '../services/catch.service';
import { AppError } from '../utils/AppError';
import { createCatchSchema, paginationSchema, updateCatchSchema } from '../utils/validators';

function requireUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function listForTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const items = await catchService.listCatchesForTrip(userId, req.params.tripId);
  res.json({ items });
}

export async function createForTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const parsed = createCatchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.issues);
  }
  const result = await catchService.createCatch({
    userId,
    tripId: req.params.tripId,
    input: parsed.data,
    file: req.file,
  });
  res.status(201).json(result);
}

export async function updateOne(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const parsed = updateCatchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.issues);
  }
  const result = await catchService.updateCatch({
    userId,
    catchId: req.params.id,
    input: parsed.data,
    file: req.file,
  });
  res.json(result);
}

export async function deleteOne(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  await catchService.deleteCatch(userId, req.params.id);
  res.status(204).send();
}

export async function gallery(req: Request, res: Response): Promise<void> {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError('Invalid pagination', 400, 'VALIDATION_ERROR', parsed.error.issues);
  }
  const result = await catchService.publicGalleryFeed(parsed.data);
  res.json(result);
}
