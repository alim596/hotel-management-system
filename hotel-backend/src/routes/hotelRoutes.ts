import express, { Router, Request, Response, RequestHandler } from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats,
} from '../controllers/hotelController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../shared/types';

const router: Router = express.Router();

// Public routes
router.get('/', getHotels as RequestHandler);
router.get('/:id', getHotelById as RequestHandler);

// Protected routes - Hotel Manager and Admin only
router.use(authenticateToken);
router.use(authorizeRole(UserRole.HOTEL_MANAGER));

router.post('/', createHotel as RequestHandler);

router.put('/:id', updateHotel as RequestHandler);

router.delete('/:id', deleteHotel as RequestHandler);

router.get('/:id/stats', getHotelStats as RequestHandler);

export default router;
