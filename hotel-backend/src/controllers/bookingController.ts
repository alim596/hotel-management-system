import { Response } from 'express';
import { pool } from '../index';
import {
  AuthenticatedRequest,
  BookingStatus,
  UserRole,
  DBBooking,
} from '../shared/types';
import { checkRoomAvailability } from '../utils/roomUtils';

// Create booking
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { roomId, checkIn, checkOut } = req.body as {
      roomId: number;
      checkIn: string;
      checkOut: string;
    };

    // Convert string dates to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check if room is available
    const roomAvailable = await checkRoomAvailability(
      roomId,
      checkInDate,
      checkOutDate,
    );
    if (!roomAvailable) {
      return res
        .status(400)
        .json({ message: 'Room is not available for the selected dates' });
    }

    const result = await pool.query<DBBooking>(
      `INSERT INTO bookings (user_id, room_id, check_in, check_out, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, roomId, checkInDate, checkOutDate, BookingStatus.PENDING],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Error in createBooking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user's bookings
export const getUserBookings = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const result = await pool.query<DBBooking>(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );

    return res.json(result.rows);
  } catch (err: unknown) {
    console.error('Error in getUserBookings:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get hotel's bookings (for hotel managers)
export const getHotelBookings = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (userRole !== UserRole.MANAGER && userRole !== UserRole.HOTEL_MANAGER) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { hotelId } = req.params;

    const result = await pool.query<DBBooking>(
      `SELECT b.* FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE r.hotel_id = $1
       ORDER BY b.created_at DESC`,
      [hotelId],
    );

    return res.json(result.rows);
  } catch (err: unknown) {
    console.error('Error in getHotelBookings:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update booking status
export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (userRole !== UserRole.MANAGER && userRole !== UserRole.HOTEL_MANAGER) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const { status } = req.body as { status: BookingStatus };

    const result = await pool.query<DBBooking>(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Error in updateBookingStatus:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking
export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;

    const result = await pool.query<DBBooking>(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [BookingStatus.CANCELLED, id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Error in cancelBooking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
