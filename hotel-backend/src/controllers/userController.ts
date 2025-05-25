import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../index';
import {
  UserRole,
  AuthenticatedRequest,
  DBUser,
  JWTPayload,
} from '../shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Register new user
export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body as RegisterRequest;

  try {
    // Check if user already exists
    const userExists = await pool.query<DBUser>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query<DBUser>(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, UserRole.GUEST],
    );

    const user = result.rows[0];
    const payload: JWTPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequest;

  try {
    const result = await pool.query<DBUser>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload: JWTPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query<DBUser>(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [req.user?.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { firstName, lastName, email, currentPassword, newPassword } =
    req.body as UpdateProfileRequest;

  try {
    const user = await pool.query<DBUser>('SELECT * FROM users WHERE id = $1', [
      req.user?.id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let updates: Record<string, any> = {};
    let params: any[] = [];
    let paramCount = 1;

    if (firstName) {
      updates.first_name = firstName;
      params.push(firstName);
    }

    if (lastName) {
      updates.last_name = lastName;
      params.push(lastName);
    }

    if (email) {
      updates.email = email;
      params.push(email);
    }

    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.rows[0].password,
      );

      if (!validPassword) {
        return res
          .status(401)
          .json({ message: 'Current password is incorrect' });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
      params.push(updates.password);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = $${paramCount++}`)
      .join(', ');

    params.push(req.user?.id);

    const result = await pool.query<DBUser>(
      `UPDATE users
       SET ${setClause}
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, role`,
      params,
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
      },
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
