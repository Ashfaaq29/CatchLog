import { Router } from 'express';
import * as placeController from '../controllers/place.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createPlaceSchema, updatePlaceSchema } from '../utils/validators';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(placeController.listPlaces));
router.post('/', validate(createPlaceSchema), asyncHandler(placeController.createPlace));
router.patch('/:id', validate(updatePlaceSchema), asyncHandler(placeController.updatePlace));
router.delete('/:id', asyncHandler(placeController.deletePlace));

export default router;
