import { Request } from 'express';
import { prisma } from '../lib/prisma.js';

export async function logUserActivity(
  userId: string | null,
  action: string,
  req: Request,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (err) {
    console.error('[ActivityLog Error]: Failed to record user telemetry:', err);
  }
}
