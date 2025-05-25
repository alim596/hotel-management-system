import express, { Router, RequestHandler } from 'express';
import {
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom,
  checkRoomAvailabilityEndpoint,
} from '../controllers/roomController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { UserRole } from '../shared/types';

const router: Router = express.Router();

// Public routes
router.get('/hotel/:hotelId', getRoomsByHotel as unknown as RequestHandler);
router.get(
  '/:id/availability',
  checkRoomAvailabilityEndpoint as unknown as RequestHandler,
);

// Protected routes - Hotel Manager only
router.use(authenticateToken as unknown as RequestHandler);
router.use(authorizeRole(UserRole.HOTEL_MANAGER) as unknown as RequestHandler);

router.post('/', createRoom as unknown as RequestHandler);
router.put('/:id', updateRoom as unknown as RequestHandler);
router.delete('/:id', deleteRoom as unknown as RequestHandler);

export default router;
