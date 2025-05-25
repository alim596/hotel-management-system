import express, { Router, RequestHandler } from 'express';
import {
  getUsers,
  updateUserRole,
  getBookings,
  getHotels,
  getDashboardStats,
} from '../controllers/adminController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { UserRole, AuthenticatedRequest } from '../shared/types';

const router: Router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken as RequestHandler);
router.use(authorizeRole(UserRole.ADMIN) as RequestHandler);

// User management
router.get(
  '/users',
  getUsers as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);
router.patch(
  '/users/:id/role',
  updateUserRole as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);

// Booking management
router.get(
  '/bookings',
  getBookings as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);

// Hotel management
router.get(
  '/hotels',
  getHotels as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);

// Dashboard
router.get(
  '/dashboard',
  getDashboardStats as RequestHandler<any, any, any, any, AuthenticatedRequest>,
);

export default router;
