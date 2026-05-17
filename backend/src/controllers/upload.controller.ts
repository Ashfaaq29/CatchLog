import type { Request, Response } from 'express';
import * as uploadService from '../services/upload.service';
import { AppError } from '../utils/AppError';

export async function uploadOne(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError('No file uploaded (expected field "file")', 400, 'NO_FILE');
  }
  const result = await uploadService.uploadBuffer({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
    folder: 'uploads',
  });
  res.status(201).json(result);
}
