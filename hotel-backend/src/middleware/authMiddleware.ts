import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, JWTPayload, AuthenticatedRequest } from '../shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Verify JWT token
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      userId: decoded.id, // For backward compatibility
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Authorize by role
export const authorizeRole = (role: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (req.user.role !== role) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      next();
    } catch {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};
