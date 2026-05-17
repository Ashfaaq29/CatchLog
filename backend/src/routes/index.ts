import { Router } from 'express';
import authRoutes from './auth.routes';
import tripRoutes from './trip.routes';
import catchRoutes from './catch.routes';
import uploadRoutes from './upload.routes';
import weatherRoutes from './weather.routes';
import mapRoutes from './map.routes';
import placeRoutes from './place.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/places', placeRoutes);
router.use('/catches', catchRoutes);
router.use('/upload', uploadRoutes);
router.use('/weather', weatherRoutes);
router.use('/map', mapRoutes);

export default router;
