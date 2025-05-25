import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, AuthenticatedRequest, JWTPayload } from '../shared/types';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Invalid token format' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
    ) as JWTPayload;
    (req as unknown as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    const error = err as Error;
    res.status(403).json({ message: 'Invalid token', error: error.message });
  }
};

export const authorizeRole =
  (role: UserRole) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as unknown as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (authReq.user.role !== role) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    next();
  };
