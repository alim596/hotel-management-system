import { Response } from 'express';
import { pool } from '../index';
import { AuthenticatedRequest, DBRoom, RoomType } from '../shared/types';
import { checkRoomAvailability } from '../utils/roomUtils';

interface HotelManagerRow {
  manager_id: number;
}

interface CreateRoomBody {
  hotelId: number;
  name: string;
  description: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

interface UpdateRoomBody {
  name: string;
  description: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

// Create room
export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  try {
    const {
      hotelId,
      name,
      description,
      type,
      capacity,
      pricePerNight,
      amenities,
      images,
    } = req.body as CreateRoomBody;

    // Verify user is the hotel manager
    const hotel = await pool.query<HotelManagerRow>(
      'SELECT manager_id FROM hotels WHERE id = $1',
      [hotelId],
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.rows[0].manager_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to add rooms to this hotel' });
    }

    const result = await pool.query<DBRoom>(
      `INSERT INTO rooms 
       (hotel_id, name, description, type, capacity, price_per_night, amenities, images, manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        hotelId,
        name,
        description,
        type,
        capacity,
        pricePerNight,
        amenities,
        images,
        req.user.id,
      ],
    );

    return res.status(201).json({
      message: 'Room created successfully',
      room: result.rows[0],
    });
  } catch (err: unknown) {
    console.error('Error in createRoom:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get rooms by hotel
export const getRoomsByHotel = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { hotelId } = req.params;

    const result = await pool.query<DBRoom>(
      'SELECT * FROM rooms WHERE hotel_id = $1',
      [hotelId],
    );

    return res.json(result.rows);
  } catch (err: unknown) {
    console.error('Error in getRoomsByHotel:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update room
export const updateRoom = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      capacity,
      pricePerNight,
      amenities,
      images,
    } = req.body as UpdateRoomBody;

    // Verify user is the hotel manager
    const room = await pool.query<HotelManagerRow>(
      'SELECT h.manager_id FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE r.id = $1',
      [id],
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.rows[0].manager_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this room' });
    }

    const result = await pool.query<DBRoom>(
      `UPDATE rooms 
       SET name = $1, description = $2, type = $3, capacity = $4,
           price_per_night = $5, amenities = $6, images = $7
       WHERE id = $8
       RETURNING *`,
      [name, description, type, capacity, pricePerNight, amenities, images, id],
    );

    return res.json({
      message: 'Room updated successfully',
      room: result.rows[0],
    });
  } catch (err: unknown) {
    console.error('Error in updateRoom:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete room
export const deleteRoom = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  try {
    const { id } = req.params;

    // Verify user is the hotel manager
    const room = await pool.query<HotelManagerRow>(
      'SELECT h.manager_id FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE r.id = $1',
      [id],
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.rows[0].manager_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this room' });
    }

    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);

    return res.json({ message: 'Room deleted successfully' });
  } catch (err: unknown) {
    console.error('Error in deleteRoom:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check room availability
export const checkRoomAvailabilityEndpoint = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (
      !checkIn ||
      !checkOut ||
      typeof checkIn !== 'string' ||
      typeof checkOut !== 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'Check-in and check-out dates are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const isAvailable = await checkRoomAvailability(
      parseInt(id),
      checkInDate,
      checkOutDate,
    );

    return res.json({
      isAvailable,
      message: isAvailable
        ? 'Room is available'
        : 'Room is not available for the selected dates',
    });
  } catch (err: unknown) {
    console.error('Error in checkRoomAvailability:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
