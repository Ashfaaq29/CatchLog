import type { Request, Response } from 'express';
import * as tripService from '../services/trip.service';
import * as catchService from '../services/catch.service';
import { AppError } from '../utils/AppError';
import type { CreateTripInput, UpdateTripCoordsInput, UpdateTripInput } from '../utils/validators';

function requireUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function listTrips(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trips = await tripService.listTrips(userId);
  res.json({ items: trips });
}

export async function createTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trip = await tripService.createTrip(userId, req.body as CreateTripInput);
  res.status(201).json(trip);
}

export async function getTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const tripId = req.params.id;
  const trip = await tripService.getTrip(userId, tripId);
  const catches = await catchService.listCatchesForTrip(userId, tripId);
  res.json({ trip, catches });
}

export async function updateTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trip = await tripService.updateTrip(userId, req.params.id, req.body as UpdateTripInput);
  res.json(trip);
}

export async function updateTripCoords(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trip = await tripService.updateTripCoords(
    userId,
    req.params.id,
    req.body as UpdateTripCoordsInput,
  );
  res.json(trip);
}

export async function deleteTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  await tripService.deleteTrip(userId, req.params.id);
  res.status(204).send();
}

export async function getStats(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const stats = await tripService.getStats(userId);
  const recent = await catchService.recentForUser(userId, 5);
  res.json({ ...stats, recentCatches: recent });
}
