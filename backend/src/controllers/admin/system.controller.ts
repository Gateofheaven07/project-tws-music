import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { HTTP_STATUS } from '../../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

/**
 * Health check lengkap buat admin: status database, environment variables, dan info runtime.
 */
export const getSystemHealth = async (_req: Request, res: Response) => {
  try {
    // Cek koneksi database
    let databaseStatus = 'ok';
    let dbLatencyMs = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      databaseStatus = 'failed';
    }

    // Cek environment variables yang penting
    const envStatus = {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      JWT_REFRESH_SECRET: Boolean(process.env.JWT_REFRESH_SECRET),
      YOUTUBE_API_KEY: Boolean(process.env.YOUTUBE_API_KEY),
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_CALLBACK_URL: Boolean(process.env.GOOGLE_CALLBACK_URL),
      CLIENT_URL: Boolean(process.env.CLIENT_URL),
    };

    const missingEnv = Object.entries(envStatus)
      .filter(([, present]) => !present)
      .map(([key]) => key);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'System health check berhasil.', {
        overall: databaseStatus === 'ok' && missingEnv.length === 0 ? 'healthy' : 'degraded',
        database: {
          status: databaseStatus,
          latencyMs: dbLatencyMs,
        },
        environment: {
          status: missingEnv.length === 0 ? 'complete' : 'incomplete',
          variables: envStatus,
          missing: missingEnv,
        },
        runtime: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: Math.floor(process.uptime()),
          memoryUsage: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          },
          isVercel: process.env.VERCEL === '1',
          vercelRegion: process.env.VERCEL_REGION || null,
        },
      })
    );
  } catch (error) {
    console.error('getSystemHealth error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal menjalankan health check.')
    );
  }
};
