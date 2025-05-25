import express, { Router, RequestHandler } from 'express';
import {
  createBooking,
  getUserBookings,
  getHotelBookings,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { UserRole } from '../shared/types';

const router: Router = express.Router();

// Protected routes
router.use(authenticateToken as unknown as RequestHandler);

// User routes
router.get('/', getUserBookings as unknown as RequestHandler);
router.post('/', createBooking as unknown as RequestHandler);
router.post('/:id/cancel', cancelBooking as unknown as RequestHandler);

// Hotel Manager routes
router.use(authorizeRole(UserRole.HOTEL_MANAGER) as unknown as RequestHandler);
router.get('/hotel/:hotelId', getHotelBookings as unknown as RequestHandler);
router.put('/:id/status', updateBookingStatus as unknown as RequestHandler);

export default router;
