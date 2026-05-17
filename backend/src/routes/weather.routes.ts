import { Router } from 'express';
import * as weatherController from '../controllers/weather.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { weatherQuerySchema } from '../utils/validators';

const router = Router();

router.use(requireAuth);

router.get('/', validate(weatherQuerySchema, 'query'), asyncHandler(weatherController.getWeather));

export default router;
