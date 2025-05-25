import { Request, Response } from 'express';
import { pool } from '../index';
import { UserRole, AuthenticatedRequest } from '../shared/types';

interface CreateReviewRequest {
  hotelId: number;
  rating: number;
  comment: string;
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

interface DBReviewWithUser extends DBReview {
  first_name: string;
  last_name: string;
}

interface GetReviewsQuery {
  page?: string;
  limit?: string;
}

// Create a review
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { hotelId, rating, comment } = req.body as CreateReviewRequest;

  try {
    // Check if user has stayed at the hotel
    const bookingCheck = await pool.query<{ id: number }>(
      `SELECT b.id 
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE r.hotel_id = $1 
       AND b.user_id = $2 
       AND b.status = 'completed'
       AND b.check_out < NOW()`,
      [hotelId, req.user?.userId],
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({
        message: 'You can only review hotels where you have completed a stay',
      });
    }

    // Check if user has already reviewed this hotel
    const existingReview = await pool.query<{ id: number }>(
      'SELECT id FROM reviews WHERE hotel_id = $1 AND user_id = $2',
      [hotelId, req.user?.userId],
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this hotel' });
    }

    const result = await pool.query<DBReview>(
      `INSERT INTO reviews (user_id, hotel_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user?.userId, hotelId, rating, comment],
    );

    // Update hotel's average rating
    await pool.query(
      `UPDATE hotels 
       SET average_rating = (
         SELECT AVG(rating)::numeric(2,1) 
         FROM reviews 
         WHERE hotel_id = $1
       )
       WHERE id = $1`,
      [hotelId],
    );

    res.status(201).json({
      message: 'Review created successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews for a hotel
export const getHotelReviews = async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { page = '1', limit = '10' } = req.query as GetReviewsQuery;

  try {
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query<DBReviewWithUser>(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.hotel_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [hotelId, Number(limit), offset],
    );

    // Get total count for pagination
    const countResult = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM reviews WHERE hotel_id = $1',
      [hotelId],
    );

    const totalReviews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalReviews / Number(limit));

    res.json({
      reviews: result.rows,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalReviews,
        hasMore: Number(page) < totalPages,
      },
    });
  } catch (error) {
    console.error('Error in getHotelReviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update review
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const { rating, comment } = req.body as CreateReviewRequest;

  try {
    // Check if review exists and user owns it
    const review = await pool.query<DBReview>(
      'SELECT * FROM reviews WHERE id = $1',
      [id],
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.rows[0].user_id !== req.user?.userId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this review' });
    }

    const result = await pool.query<DBReview>(
      `UPDATE reviews 
       SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id],
    );

    // Update hotel's average rating
    await pool.query(
      `UPDATE hotels 
       SET average_rating = (
         SELECT AVG(rating)::numeric(2,1) 
         FROM reviews 
         WHERE hotel_id = $1
       )
       WHERE id = $1`,
      [review.rows[0].hotel_id],
    );

    res.json({
      message: 'Review updated successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete review
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;

  try {
    // Check if review exists and user has permission to delete it
    const review = await pool.query<DBReview & { manager_id: number }>(
      `SELECT r.*, h.manager_id 
       FROM reviews r
       JOIN hotels h ON r.hotel_id = h.id
       WHERE r.id = $1`,
      [id],
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviewData = review.rows[0];
    const isOwner = reviewData.user_id === req.user?.userId;
    const isHotelManager = reviewData.manager_id === req.user?.userId;
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isOwner && !isHotelManager && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this review' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    // Update hotel's average rating
    await pool.query(
      `UPDATE hotels 
       SET average_rating = (
         SELECT AVG(rating)::numeric(2,1) 
         FROM reviews 
         WHERE hotel_id = $1
       )
       WHERE id = $1`,
      [reviewData.hotel_id],
    );

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
