import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Admin login (Owner, Agent, Sub_Agent)
router.post('/admin/login', asyncHandler(userController.adminLogin.bind(userController)));

// Admin logout
router.post('/admin/logout', authenticateToken as RequestHandler, asyncHandler(userController.adminLogout.bind(userController)));

// Player login
router.post('/player/login', asyncHandler(userController.playerLogin.bind(userController)));

export default router; 