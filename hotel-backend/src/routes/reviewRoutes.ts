import express, { Router, RequestHandler } from 'express';
import {
  createReview,
  getHotelReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public routes
router.get('/hotel/:hotelId', getHotelReviews);

// Protected routes
router.use(authenticateToken as unknown as RequestHandler);

router.post('/', createReview as unknown as RequestHandler);
router.put('/:id', updateReview as unknown as RequestHandler);
router.delete('/:id', deleteReview as unknown as RequestHandler);

export default router;
