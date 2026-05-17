import type { Request, Response } from 'express';
import * as placeService from '../services/place.service';
import { AppError } from '../utils/AppError';
import type { CreatePlaceInput, UpdatePlaceInput } from '../utils/validators';

function requireUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function listPlaces(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const items = await placeService.listPlaces(userId);
  res.json({ items });
}

export async function createPlace(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const place = await placeService.createPlace(userId, req.body as CreatePlaceInput);
  res.status(201).json(place);
}

export async function updatePlace(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const place = await placeService.updatePlace(userId, req.params.id, req.body as UpdatePlaceInput);
  res.json(place);
}

export async function deletePlace(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  await placeService.deletePlace(userId, req.params.id);
  res.status(204).send();
}
