import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, JwtUserPayload } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    isBanned: boolean;
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No valid bearer token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwtToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isBanned: true, banReason: true, banExpiresAt: true }
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User account not found.',
    });
    return;
  }

  // Check ban status
  if (user.isBanned) {
    const isPermanent = !user.banExpiresAt;
    const isStillBanned = isPermanent || new Date(user.banExpiresAt!) > new Date();

    if (isStillBanned) {
      res.status(403).json({
        success: false,
        message: `Account suspended. Reason: ${user.banReason || 'Policy violation'}. Contact support if you believe this is in error.`,
        isBanned: true,
      });
      return;
    }
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
  };

  next();
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: insufficient administrative clearance.',
      });
      return;
    }

    next();
  };
}
