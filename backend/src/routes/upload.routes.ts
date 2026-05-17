import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', requireAuth, upload.single('file'), asyncHandler(uploadController.uploadOne));

export default router;
