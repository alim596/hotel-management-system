import { Request, Response } from 'express';
import { pool } from '../index';
import { PaymentService } from '../services/paymentService';
import {
  PaymentStatus,
  BookingStatus,
  AuthenticatedRequest,
} from '../shared/types';

interface DBBooking {
  id: number;
  user_id: number;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string;
}

interface DBBookingWithUser extends DBBooking {
  email: string;
  first_name: string;
  last_name: string;
  stripe_customer_id?: string;
}

interface PaymentWebhookData {
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      status: string;
    };
  };
}

interface RefundRequest {
  amount?: number;
}

// Initialize payment for a booking
export const initializePayment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { bookingId } = req.params;

  try {
    // Get booking details
    const booking = await pool.query<DBBookingWithUser>(
      `SELECT b.*, u.email, u.first_name, u.last_name, u.stripe_customer_id
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, req.user?.userId],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingData = booking.rows[0];

    // Create or get Stripe customer
    let stripeCustomerId = bookingData.stripe_customer_id;
    if (!stripeCustomerId) {
      stripeCustomerId = await PaymentService.createCustomer(
        bookingData.email,
        `${bookingData.first_name} ${bookingData.last_name}`,
      );

      // Save Stripe customer ID
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [stripeCustomerId, req.user?.userId],
      );
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent(
      bookingData.total_price,
    );

    // Save payment intent ID to booking
    await pool.query(
      'UPDATE bookings SET stripe_payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, bookingId],
    );

    res.json({
      clientSecret: paymentIntent.clientSecret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Error in initializePayment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm payment webhook
export const confirmPayment = async (req: Request, res: Response) => {
  const { type, data } = req.body as PaymentWebhookData;

  try {
    if (type === 'payment_intent.succeeded') {
      const paymentIntentId = data.object.id;

      // Update booking status
      const booking = await pool.query<DBBooking>(
        'UPDATE bookings SET payment_status = $1, status = $2 WHERE stripe_payment_intent_id = $3 RETURNING *',
        [PaymentStatus.PAID, BookingStatus.CONFIRMED, paymentIntentId],
      );

      if (booking.rows.length > 0) {
        // TODO: Send booking confirmation email
        console.log('Payment confirmed for booking:', booking.rows[0].id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process refund for a booking
export const processRefund = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { bookingId } = req.params;
  const { amount } = req.body as RefundRequest;

  try {
    // Get booking details and verify permissions
    const booking = await pool.query<DBBooking & { manager_id: number }>(
      `SELECT b.*, h.manager_id 
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       WHERE b.id = $1`,
      [bookingId],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingData = booking.rows[0];
    const isOwner = bookingData.user_id === req.user?.userId;
    const isHotelManager = bookingData.manager_id === req.user?.userId;

    if (!isOwner && !isHotelManager) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to process refund' });
    }

    if (!bookingData.stripe_payment_intent_id) {
      return res
        .status(400)
        .json({ message: 'No payment found for this booking' });
    }

    // Process refund through Stripe
    const refundSuccess = await PaymentService.processRefund(
      bookingData.stripe_payment_intent_id,
      amount,
    );

    if (refundSuccess) {
      // Update booking payment status
      const refundStatus = amount
        ? PaymentStatus.PARTIALLY_REFUNDED
        : PaymentStatus.REFUNDED;
      await pool.query(
        'UPDATE bookings SET payment_status = $1 WHERE id = $2',
        [refundStatus, bookingId],
      );

      res.json({ message: 'Refund processed successfully' });
    } else {
      res.status(400).json({ message: 'Failed to process refund' });
    }
  } catch (error) {
    console.error('Error in processRefund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
