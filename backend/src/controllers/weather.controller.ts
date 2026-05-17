import type { Request, Response } from 'express';
import * as weatherService from '../services/weather.service';
import { AppError } from '../utils/AppError';
import type { WeatherQueryInput } from '../utils/validators';

function requireUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function getWeather(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const query = req.query as unknown as WeatherQueryInput;
  const snapshot = await weatherService.getWeather({
    location: query.location,
    lat: query.lat,
    lon: query.lon,
    tripId: query.tripId,
    userId,
  });
  res.json(snapshot);
}
