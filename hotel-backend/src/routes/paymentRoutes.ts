import express, { Router, RequestHandler } from 'express';
import {
  initializePayment,
  confirmPayment,
  processRefund,
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Protected routes
router.use(authenticateToken as unknown as RequestHandler);

router.post(
  '/bookings/:bookingId/pay',
  initializePayment as unknown as RequestHandler,
);
router.post(
  '/bookings/:bookingId/refund',
  processRefund as unknown as RequestHandler,
);

// Webhook route (no authentication required as it's called by Stripe)
router.post('/webhook', confirmPayment);

export default router;
