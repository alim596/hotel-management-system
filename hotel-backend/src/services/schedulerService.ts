import cron from 'node-cron';
import { pool } from '../index';
import { EmailService } from './emailService';
import { BookingStatus } from '../shared/types';

interface BookingReminderResult {
  id: number;
  email: string;
  hotel_name: string;
  hotel_address: string;
  room_name: string;
  check_in: Date;
}

interface ReviewReminderResult {
  id: number;
  email: string;
  hotel_name: string;
  check_out: Date;
}

interface BookingStatusResult {
  id: number;
  user_id: number;
}

interface BookingDetailsResult {
  id: number;
  email: string;
  hotel_name: string;
  status: BookingStatus;
}

export class SchedulerService {
  // Send booking reminders 24 hours before check-in
  static scheduleBookingReminders() {
    // Run every hour
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    cron.schedule('0 * * * *', async () => {
      try {
        const result = await pool.query<BookingReminderResult>(
          `SELECT b.id, u.email, h.name as hotel_name, h.address as hotel_address, r.name as room_name, b.check_in
           FROM bookings b
           JOIN users u ON b.user_id = u.id
           JOIN rooms r ON b.room_id = r.id
           JOIN hotels h ON r.hotel_id = h.id
           WHERE b.status = $1
           AND b.check_in > NOW()
           AND b.check_in <= NOW() + INTERVAL '25 hours'
           AND b.check_in > NOW() + INTERVAL '23 hours'`,
          [BookingStatus.CONFIRMED],
        );

        for (const booking of result.rows) {
          await EmailService.sendBookingReminder(booking.email, {
            id: booking.id,
            hotelName: booking.hotel_name,
            roomName: booking.room_name,
            checkIn: booking.check_in,
            hotelAddress: booking.hotel_address,
          });
        }
      } catch (error) {
        console.error('Error sending booking reminders:', error);
      }
    });
  }

  // Send review reminders 24 hours after check-out
  static scheduleReviewReminders() {
    // Run every hour
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    cron.schedule('30 * * * *', async () => {
      try {
        const result = await pool.query<ReviewReminderResult>(
          `SELECT b.id, u.email, h.name as hotel_name, b.check_out
           FROM bookings b
           JOIN users u ON b.user_id = u.id
           JOIN rooms r ON b.room_id = r.id
           JOIN hotels h ON r.hotel_id = h.id
           WHERE b.status = $1
           AND b.check_out < NOW() - INTERVAL '23 hours'
           AND b.check_out > NOW() - INTERVAL '25 hours'
           AND NOT EXISTS (
             SELECT 1 FROM reviews rv
             WHERE rv.hotel_id = h.id AND rv.user_id = u.id
           )`,
          [BookingStatus.COMPLETED],
        );

        for (const booking of result.rows) {
          await EmailService.sendReviewReminder(booking.email, {
            bookingId: booking.id,
            hotelName: booking.hotel_name,
            checkOut: booking.check_out,
          });
        }
      } catch (error) {
        console.error('Error sending review reminders:', error);
      }
    });
  }

  // Update booking statuses (e.g., mark as completed after check-out)
  static scheduleBookingStatusUpdates() {
    // Run every hour
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    cron.schedule('15 * * * *', async () => {
      try {
        // Mark bookings as completed after check-out
        const completedBookings = await pool.query<BookingStatusResult>(
          `UPDATE bookings
           SET status = $1
           WHERE status = $2
           AND check_out < NOW()
           RETURNING id, user_id`,
          [BookingStatus.COMPLETED, BookingStatus.CONFIRMED],
        );

        // Mark bookings as no-show if not checked in
        const noShowBookings = await pool.query<BookingStatusResult>(
          `UPDATE bookings
           SET status = $1
           WHERE status = $2
           AND check_in < NOW() - INTERVAL '24 hours'
           RETURNING id, user_id`,
          [BookingStatus.NO_SHOW, BookingStatus.CONFIRMED],
        );

        // Send notifications for status updates
        const allUpdatedBookings = [
          ...completedBookings.rows,
          ...noShowBookings.rows,
        ];

        for (const booking of allUpdatedBookings) {
          const bookingDetails = await pool.query<BookingDetailsResult>(
            `SELECT b.id, u.email, h.name as hotel_name, b.status
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             JOIN hotels h ON r.hotel_id = h.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = $1`,
            [booking.id],
          );

          if (bookingDetails.rows.length > 0) {
            await EmailService.sendBookingStatusUpdate(
              bookingDetails.rows[0].email,
              {
                id: bookingDetails.rows[0].id,
                hotelName: bookingDetails.rows[0].hotel_name,
                status: bookingDetails.rows[0].status,
              },
            );
          }
        }
      } catch (error) {
        console.error('Error updating booking statuses:', error);
      }
    });
  }

  // Initialize all schedulers
  static initializeSchedulers() {
    this.scheduleBookingReminders();
    this.scheduleReviewReminders();
    this.scheduleBookingStatusUpdates();
    console.log('Schedulers initialized successfully');
  }
}
