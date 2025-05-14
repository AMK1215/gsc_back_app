import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { prismaClient } from '../index';

type Role = 'Owner' | 'Agent' | 'Sub_Agent' | 'Player';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: Role;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as { id: number; role: Role };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin (Owner, Agent, or Sub_Agent)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { role } = req.user;
  if (role === 'Player') {
    return res.status(403).json({ message: 'Access denied. Admin access required.' });
  }

  next();
};

// Middleware to check if user is Owner
export const isOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'Owner') {
    return res.status(403).json({ message: 'Access denied. Owner access required.' });
  }

  next();
};

// Middleware to check if user is Agent
export const isAgent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'Agent') {
    return res.status(403).json({ message: 'Access denied. Agent access required.' });
  }

  next();
};

// Middleware to check if user is Sub_Agent
export const isSubAgent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'Sub_Agent') {
    return res.status(403).json({ message: 'Access denied. Sub-Agent access required.' });
  }

  next();
}; 