import { Router } from 'express';


const authRoutes: Router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
//authRoutes.post('/signup', errorHandler(signup));

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
//authRoutes.post('/login', errorHandler(login));

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
//authRoutes.get('/me', [authMiddleware], errorHandler(me));

export default authRoutes;

