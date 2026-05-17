import { Router } from 'express';
import * as catchController from '../controllers/catch.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { updateCatchSchema } from '../utils/validators';

const router = Router();

router.get('/', asyncHandler(catchController.gallery));

router.get('/:tripId', requireAuth, asyncHandler(catchController.listForTrip));

router.post(
  '/:tripId',
  requireAuth,
  upload.single('image'),
  asyncHandler(catchController.createForTrip),
);

router.patch(
  '/single/:id',
  requireAuth,
  upload.single('image'),
  validate(updateCatchSchema),
  asyncHandler(catchController.updateOne),
);

router.delete('/single/:id', requireAuth, asyncHandler(catchController.deleteOne));

export default router;
