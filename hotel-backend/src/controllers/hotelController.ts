import { Request, Response } from 'express';
import { pool } from '../index';
import { UserRole, AuthenticatedRequest } from '../shared/types';

interface CreateHotelRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  amenities: string[];
  images: string[];
}

type UpdateHotelRequest = Partial<CreateHotelRequest>;

interface DBHotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  amenities: string[];
  images: string[];
  manager_id: number;
  average_rating: number;
  created_at: Date;
  updated_at: Date;
}

interface DBRoom {
  id: number;
  hotel_id: number;
  name: string;
  description: string;
  type: string;
  capacity: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  created_at: Date;
  updated_at: Date;
}

interface DBReview {
  id: number;
  user_id: number;
  hotel_id: number;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

interface GetHotelsQuery {
  city?: string;
  country?: string;
  minStarRating?: number;
  maxStarRating?: number;
  amenities?: string | string[];
}

// Create a new hotel
export const createHotel = async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    address,
    city,
    country,
    starRating,
    amenities,
    images,
  } = req.body as CreateHotelRequest;

  try {
    // Verify user is a hotel manager
    if (req.user?.role !== UserRole.HOTEL_MANAGER) {
      return res
        .status(403)
        .json({ message: 'Only hotel managers can create hotels' });
    }

    const result = await pool.query<DBHotel>(
      `INSERT INTO hotels 
       (name, description, address, city, country, star_rating, amenities, images, manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        name,
        description,
        address,
        city,
        country,
        starRating,
        amenities,
        images,
        req.user.userId,
      ],
    );

    res.status(201).json({
      message: 'Hotel created successfully',
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error('Error in createHotel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all hotels with optional filters
export const getHotels = async (req: Request, res: Response) => {
  try {
    const { city, country, minStarRating, maxStarRating, amenities } =
      req.query as GetHotelsQuery;

    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params: (string | number | string[])[] = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
      paramCount++;
    }

    if (country) {
      query += ` AND LOWER(country) LIKE LOWER($${paramCount})`;
      params.push(`%${country}%`);
      paramCount++;
    }

    if (minStarRating) {
      query += ` AND star_rating >= $${paramCount}`;
      params.push(Number(minStarRating));
      paramCount++;
    }

    if (maxStarRating) {
      query += ` AND star_rating <= $${paramCount}`;
      params.push(Number(maxStarRating));
      paramCount++;
    }

    if (amenities) {
      query += ` AND amenities && $${paramCount}`;
      params.push(Array.isArray(amenities) ? amenities : [amenities]);
      paramCount++;
    }

    const result = await pool.query<DBHotel>(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getHotels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query<
      DBHotel & { rooms: DBRoom[]; reviews: DBReview[] }
    >(
      `SELECT h.*, 
              array_agg(DISTINCT r.*) as rooms,
              array_agg(DISTINCT rv.*) as reviews
       FROM hotels h
       LEFT JOIN rooms r ON r.hotel_id = h.id
       LEFT JOIN reviews rv ON rv.hotel_id = h.id
       WHERE h.id = $1
       GROUP BY h.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getHotelById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update hotel
export const updateHotel = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  const { id } = req.params;
  const {
    name,
    description,
    address,
    city,
    country,
    starRating,
    amenities,
    images,
  } = req.body as UpdateHotelRequest;

  try {
    // Verify user is the hotel manager
    const hotel = await pool.query<DBHotel>(
      'SELECT manager_id FROM hotels WHERE id = $1',
      [id],
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.rows[0].manager_id !== req.user?.userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this hotel' });
    }

    const result = await pool.query<DBHotel>(
      `UPDATE hotels 
       SET name = $1, description = $2, address = $3, city = $4, 
           country = $5, star_rating = $6, amenities = $7, images = $8
       WHERE id = $9 AND manager_id = $10
       RETURNING *`,
      [
        name,
        description,
        address,
        city,
        country,
        starRating,
        amenities,
        images,
        id,
        req.user.userId,
      ],
    );

    res.json({
      message: 'Hotel updated successfully',
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error('Error in updateHotel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete hotel
export const deleteHotel = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  const { id } = req.params;

  try {
    // Verify user is the hotel manager
    const hotel = await pool.query<DBHotel>(
      'SELECT manager_id FROM hotels WHERE id = $1',
      [id],
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.rows[0].manager_id !== req.user?.userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this hotel' });
    }

    await pool.query('DELETE FROM hotels WHERE id = $1 AND manager_id = $2', [
      id,
      req.user.userId,
    ]);

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error in deleteHotel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get hotel statistics
export const getHotelStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }
  const { id } = req.params;

  try {
    // Verify user is the hotel manager
    const hotel = await pool.query<DBHotel>(
      'SELECT manager_id FROM hotels WHERE id = $1',
      [id],
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.rows[0].manager_id !== req.user?.userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to view hotel statistics' });
    }

    interface HotelStats {
      total_rooms: string;
      total_bookings: string;
      average_rating: number;
      total_reviews: string;
      total_revenue: string;
    }

    const stats = await pool.query<HotelStats>(
      `SELECT 
        COUNT(DISTINCT r.id) as total_rooms,
        COUNT(DISTINCT b.id) as total_bookings,
        AVG(rv.rating)::numeric(2,1) as average_rating,
        COUNT(DISTINCT rv.id) as total_reviews,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END) as total_revenue
       FROM hotels h
       LEFT JOIN rooms r ON r.hotel_id = h.id
       LEFT JOIN bookings b ON b.room_id = r.id
       LEFT JOIN reviews rv ON rv.hotel_id = h.id
       WHERE h.id = $1
       GROUP BY h.id`,
      [id],
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error in getHotelStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
