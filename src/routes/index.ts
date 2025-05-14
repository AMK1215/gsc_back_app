import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import seamlessRoutes from './seamless.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/Seamless', seamlessRoutes);

export default router;
