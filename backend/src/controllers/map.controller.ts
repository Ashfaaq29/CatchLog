import type { Request, Response } from 'express';
import * as mapService from '../services/map.service';
import { AppError } from '../utils/AppError';

function requireUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function getSonarMap(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const payload = await mapService.getSonarMap(userId);
  res.json(payload);
}

export async function geocode(req: Request, res: Response): Promise<void> {
  requireUserId(req);
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const result = await mapService.geocodeSearch(q);
  res.json(result);
}

export async function geocodeSuggest(req: Request, res: Response): Promise<void> {
  requireUserId(req);
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const result = await mapService.geocodeSuggest(q);
  res.json(result);
}
