import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, isAdmin, isOwner, isAgent } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/admin/login', userController.adminLogin as RequestHandler);
router.post('/player/login', userController.playerLogin as RequestHandler);

// Protected routes
router.use(authenticateToken as RequestHandler);

// Profile routes (for authenticated users)
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));

// Admin routes
router.use(isAdmin as RequestHandler);

// User management routes
router.post('/users', userController.createUser as RequestHandler);
router.get('/users', asyncHandler(userController.getUsers.bind(userController)));
router.put('/users/:id', userController.updateUser as RequestHandler);
router.delete('/users/:id', userController.deleteUser as RequestHandler);

export default router; 