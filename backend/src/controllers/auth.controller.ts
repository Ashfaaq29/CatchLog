import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/AppError';
import type { LoginInput, RegisterInput } from '../utils/validators';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginInput);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ user });
}
