import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createTripSchema, updateTripCoordsSchema, updateTripSchema } from '../utils/validators';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(tripController.listTrips));
router.post('/', validate(createTripSchema), asyncHandler(tripController.createTrip));
router.get('/stats', asyncHandler(tripController.getStats));
router.get('/:id', asyncHandler(tripController.getTrip));
router.patch('/:id', validate(updateTripSchema), asyncHandler(tripController.updateTrip));
router.patch(
  '/:id/coords',
  validate(updateTripCoordsSchema),
  asyncHandler(tripController.updateTripCoords),
);
router.delete('/:id', asyncHandler(tripController.deleteTrip));

export default router;
