import nodemailer from 'nodemailer';
import { BookingStatus, PaymentStatus } from '../shared/types';

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Booking confirmation email
  static async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      id: number;
      hotelName: string;
      roomName: string;
      checkIn: Date;
      checkOut: Date;
      totalPrice: number;
    },
  ) {
    const subject = `Booking Confirmation - ${bookingDetails.hotelName}`;
    const html = `
      <h1>Booking Confirmation</h1>
      <p>Thank you for booking with us!</p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Booking ID: ${bookingDetails.id}</li>
        <li>Hotel: ${bookingDetails.hotelName}</li>
        <li>Room: ${bookingDetails.roomName}</li>
        <li>Check-in: ${bookingDetails.checkIn.toLocaleDateString()}</li>
        <li>Check-out: ${bookingDetails.checkOut.toLocaleDateString()}</li>
        <li>Total Price: $${bookingDetails.totalPrice.toFixed(2)}</li>
      </ul>
      <p>We look forward to welcoming you!</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  // Payment confirmation email
  static async sendPaymentConfirmation(
    email: string,
    paymentDetails: {
      bookingId: number;
      amount: number;
      hotelName: string;
    },
  ) {
    const subject = 'Payment Confirmation';
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Your payment has been successfully processed!</p>
      <h2>Payment Details:</h2>
      <ul>
        <li>Booking ID: ${paymentDetails.bookingId}</li>
        <li>Hotel: ${paymentDetails.hotelName}</li>
        <li>Amount Paid: $${paymentDetails.amount.toFixed(2)}</li>
      </ul>
      <p>Thank you for your payment.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  // Booking status update email
  static async sendBookingStatusUpdate(
    email: string,
    bookingDetails: {
      id: number;
      hotelName: string;
      status: BookingStatus;
    },
  ) {
    const subject = `Booking Status Update - ${bookingDetails.hotelName}`;
    const html = `
      <h1>Booking Status Update</h1>
      <p>Your booking status has been updated.</p>
      <h2>Details:</h2>
      <ul>
        <li>Booking ID: ${bookingDetails.id}</li>
        <li>Hotel: ${bookingDetails.hotelName}</li>
        <li>New Status: ${bookingDetails.status}</li>
      </ul>
    `;

    await this.sendEmail(email, subject, html);
  }

  // Refund confirmation email
  static async sendRefundConfirmation(
    email: string,
    refundDetails: {
      bookingId: number;
      amount: number;
      hotelName: string;
      status: PaymentStatus;
    },
  ) {
    const subject = 'Refund Confirmation';
    const html = `
      <h1>Refund Confirmation</h1>
      <p>Your refund has been processed.</p>
      <h2>Refund Details:</h2>
      <ul>
        <li>Booking ID: ${refundDetails.bookingId}</li>
        <li>Hotel: ${refundDetails.hotelName}</li>
        <li>Refund Amount: $${refundDetails.amount.toFixed(2)}</li>
        <li>Status: ${refundDetails.status}</li>
      </ul>
      <p>The refund should appear in your account within 5-10 business days.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  // Booking reminder email (for upcoming stays)
  static async sendBookingReminder(
    email: string,
    bookingDetails: {
      id: number;
      hotelName: string;
      roomName: string;
      checkIn: Date;
      hotelAddress: string;
    },
  ) {
    const subject = `Upcoming Stay Reminder - ${bookingDetails.hotelName}`;
    const html = `
      <h1>Upcoming Stay Reminder</h1>
      <p>Your stay at ${bookingDetails.hotelName} is coming up soon!</p>
      <h2>Stay Details:</h2>
      <ul>
        <li>Booking ID: ${bookingDetails.id}</li>
        <li>Hotel: ${bookingDetails.hotelName}</li>
        <li>Room: ${bookingDetails.roomName}</li>
        <li>Check-in Date: ${bookingDetails.checkIn.toLocaleDateString()}</li>
        <li>Address: ${bookingDetails.hotelAddress}</li>
      </ul>
      <p>We look forward to welcoming you!</p>
      <p>If you need to modify your booking, please contact us as soon as possible.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  // Review reminder email (after checkout)
  static async sendReviewReminder(
    email: string,
    stayDetails: {
      bookingId: number;
      hotelName: string;
      checkOut: Date;
    },
  ) {
    const subject = `How was your stay at ${stayDetails.hotelName}?`;
    const html = `
      <h1>Share Your Experience</h1>
      <p>Thank you for staying at ${stayDetails.hotelName}!</p>
      <p>We hope you had a wonderful time. Would you mind taking a moment to share your experience?</p>
      <p>Your feedback helps us improve and assists other travelers in making informed decisions.</p>
      <a href="${process.env.FRONTEND_URL}/bookings/${stayDetails.bookingId}/review" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Write a Review
      </a>
      <p>Thank you for choosing our hotel!</p>
    `;

    await this.sendEmail(email, subject, html);
  }
}
