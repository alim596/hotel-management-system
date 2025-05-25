import { Request, Response } from 'express';
import { QueryResult, QueryResultRow } from 'pg';
import { pool } from '../index';
import { UserRole, BookingStatus, PaymentStatus } from '../shared/types';
import {
  AuthenticatedRequest,
  DBUser,
  DBBooking,
  DBHotel,
} from '../shared/types';

// Get system statistics
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // Get total users by role
    const userStats = await pool.query(
      `SELECT role, COUNT(*) as count
       FROM users
       GROUP BY role`,
    );

    // Get total hotels and average rating
    const hotelStats = await pool.query(
      `SELECT 
        COUNT(*) as total_hotels,
        AVG(average_rating)::numeric(2,1) as average_hotel_rating,
        COUNT(CASE WHEN average_rating >= 4 THEN 1 END) as highly_rated_hotels
       FROM hotels`,
    );

    // Get booking statistics
    const bookingStats = await pool.query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = $1 THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = $2 THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = $3 THEN 1 END) as completed_bookings,
        SUM(CASE WHEN payment_status = $4 THEN total_price ELSE 0 END) as total_revenue
       FROM bookings`,
      [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
        BookingStatus.COMPLETED,
        PaymentStatus.PAID,
      ],
    );

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT 
        b.id,
        b.status,
        b.payment_status,
        b.total_price,
        b.created_at,
        u.email as user_email,
        h.name as hotel_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       ORDER BY b.created_at DESC
       LIMIT 10`,
    );

    res.json({
      users: {
        byRole: userStats.rows,
        total: userStats.rows.reduce(
          (acc, curr) => acc + parseInt(curr.count),
          0,
        ),
      },
      hotels: {
        ...hotelStats.rows[0],
      },
      bookings: {
        ...bookingStats.rows[0],
      },
      recentActivity: recentActivity.rows,
    });
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface GetUsersQuery {
  page?: string;
  limit?: string;
  role?: UserRole;
  search?: string;
}

interface GetBookingsQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
}

interface DashboardStats extends QueryResultRow {
  total_users: string;
  total_hotels: string;
  total_bookings: string;
  total_revenue: string;
  recent_bookings: DBBooking[];
  users_by_role: Array<{ role: UserRole; count: string }>;
  bookings_by_status: Array<{ status: string; count: string }>;
}

interface QueryCount extends QueryResultRow {
  count: string;
}

interface QueryParams {
  values: (string | UserRole | number)[];
  paramCount: number;
}

interface BookingWithUser extends DBBooking, QueryResultRow {
  email: string;
  first_name: string;
  last_name: string;
}

interface QueryBuilder {
  query: string;
  params: QueryParams;
}

interface DBUserRow extends DBUser, QueryResultRow {}

function buildQuery(baseQuery: string, params: QueryParams): QueryBuilder {
  return {
    query: baseQuery,
    params,
  };
}

function buildCountQuery(queryBuilder: QueryBuilder): QueryBuilder {
  return {
    query: queryBuilder.query.replace('*', 'COUNT(*)'),
    params: { ...queryBuilder.params },
  };
}

function addPagination(
  queryBuilder: QueryBuilder,
  limit: number,
  offset: number,
): void {
  queryBuilder.query += ` ORDER BY created_at DESC LIMIT $${queryBuilder.params.paramCount} OFFSET $${
    queryBuilder.params.paramCount + 1
  }`;
  queryBuilder.params.values.push(limit, offset);
  queryBuilder.params.paramCount += 2;
}

async function executeQuery<T extends QueryResultRow>(
  query: string,
  values: (string | UserRole | number)[],
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(query, values);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Get users with pagination and filters
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10', role, search } = req.query as GetUsersQuery;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const queryBuilder = buildQuery('SELECT * FROM users WHERE 1=1', {
      values: [],
      paramCount: 1,
    });

    if (role) {
      queryBuilder.query += ` AND role = $${queryBuilder.params.paramCount}`;
      queryBuilder.params.values.push(role);
      queryBuilder.params.paramCount++;
    }

    if (search) {
      queryBuilder.query += ` AND (email ILIKE $${queryBuilder.params.paramCount} OR first_name ILIKE $${queryBuilder.params.paramCount} OR last_name ILIKE $${queryBuilder.params.paramCount})`;
      queryBuilder.params.values.push(`%${search}%`);
      queryBuilder.params.paramCount++;
    }

    // Get total count
    const countQueryBuilder = buildCountQuery(queryBuilder);
    const countResult = await executeQuery<QueryCount>(
      countQueryBuilder.query,
      countQueryBuilder.params.values,
    );

    if (!countResult.rows[0]) {
      throw new Error('Failed to get count from database');
    }

    const totalCount = Number(countResult.rows[0].count);

    // Get paginated results
    addPagination(queryBuilder, Number(limit), offset);

    const result = await executeQuery<DBUserRow>(
      queryBuilder.query,
      queryBuilder.params.values,
    );

    res.json({
      users: result.rows.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
      })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalUsers: totalCount,
      },
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result: QueryResult<DBUser> = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
      },
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get hotels with pagination
export const getHotels = async (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    // Get total count
    const countResult: QueryResult<QueryCount> = await pool.query(
      'SELECT COUNT(*) FROM hotels',
    );
    const totalCount = Number(countResult.rows[0].count);

    // Get paginated results
    const result: QueryResult<DBHotel> = await pool.query(
      'SELECT * FROM hotels ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [Number(limit), offset],
    );

    res.json({
      hotels: result.rows,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalHotels: totalCount,
      },
    });
  } catch (error) {
    console.error('Error in getHotels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bookings with pagination and filters
export const getBookings = async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    status,
    search,
  } = req.query as GetBookingsQuery;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let query = `
      SELECT b.*, u.email, u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params: QueryParams = {
      values: [],
      paramCount: 1,
    };

    if (status) {
      query += ` AND b.status = $${params.paramCount}`;
      params.values.push(status);
      params.paramCount++;
    }

    if (search) {
      query += ` AND (u.email ILIKE $${params.paramCount} OR u.first_name ILIKE $${params.paramCount} OR u.last_name ILIKE $${params.paramCount})`;
      params.values.push(`%${search}%`);
      params.paramCount++;
    }

    // Get total count
    const countQuery = query.replace(
      'b.*, u.email, u.first_name, u.last_name',
      'COUNT(*)',
    );
    const countResult: QueryResult<QueryCount> = await pool.query(
      countQuery,
      params.values,
    );
    const totalCount = Number(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY b.created_at DESC LIMIT $${params.paramCount} OFFSET $${
      params.paramCount + 1
    }`;
    params.values.push(Number(limit), offset);

    const result: QueryResult<BookingWithUser> = await pool.query(
      query,
      params.values,
    );

    res.json({
      bookings: result.rows.map((booking) => ({
        id: booking.id,
        userId: booking.user_id,
        userEmail: booking.email,
        userName: `${booking.first_name} ${booking.last_name}`,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        totalPrice: booking.total_price,
        status: booking.status,
        paymentStatus: booking.payment_status,
        createdAt: booking.created_at,
      })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalBookings: totalCount,
      },
    });
  } catch (error) {
    console.error('Error in getBookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const stats: QueryResult<DashboardStats> = await pool.query(`
      WITH stats AS (
        SELECT
          (SELECT COUNT(*)::text FROM users) as total_users,
          (SELECT COUNT(*)::text FROM hotels) as total_hotels,
          (SELECT COUNT(*)::text FROM bookings) as total_bookings,
          (SELECT COALESCE(SUM(total_price), 0)::text FROM bookings WHERE status = 'CONFIRMED') as total_revenue
      ),
      user_roles AS (
        SELECT role, COUNT(*)::text as count
        FROM users
        GROUP BY role
      ),
      booking_status AS (
        SELECT status, COUNT(*)::text as count
        FROM bookings
        GROUP BY status
      ),
      recent_bookings AS (
        SELECT b.*, u.email, u.first_name, u.last_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 5
      )
      SELECT
        stats.*,
        (SELECT json_agg(rb.*) FROM recent_bookings rb) as recent_bookings,
        (SELECT json_agg(json_build_object('role', ur.role, 'count', ur.count)) FROM user_roles ur) as users_by_role,
        (SELECT json_agg(json_build_object('status', bs.status, 'count', bs.count)) FROM booking_status bs) as bookings_by_status
    `);

    const dashboardStats = stats.rows[0];

    res.json({
      totalUsers: Number(dashboardStats.total_users),
      totalHotels: Number(dashboardStats.total_hotels),
      totalBookings: Number(dashboardStats.total_bookings),
      totalRevenue: Number(dashboardStats.total_revenue),
      recentBookings: dashboardStats.recent_bookings || [],
      usersByRole: dashboardStats.users_by_role || [],
      bookingsByStatus: dashboardStats.bookings_by_status || [],
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
