import express, { Router, RequestHandler } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../shared/types';

const router: Router = express.Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);

// Protected routes
router.use(authenticateToken as RequestHandler);
router.get(
  '/profile',
  getProfile as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);
router.put(
  '/profile',
  updateProfile as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);

export default router;
