import { Router } from 'express';
import * as mapController from '../controllers/map.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/sonar', asyncHandler(mapController.getSonarMap));
router.get('/geocode', asyncHandler(mapController.geocode));
router.get('/geocode/suggest', asyncHandler(mapController.geocodeSuggest));

export default router;
