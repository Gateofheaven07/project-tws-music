// SoundWave Backend Entry Point
import 'dotenv/config';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createErrorResponse, createSuccessResponse } from './utils/response';
import { logger, serializeError } from './lib/logger';
import { prisma } from './lib/prisma';

// Import routes
import authRoutes from './routes/auth.routes';
import musicRoutes from './routes/music.routes';
import playlistRoutes from './routes/playlist.routes';
import favoriteRoutes from './routes/favorite.routes';
import historyRoutes from './routes/history.routes';
import profileRoutes from './routes/profile.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

const app = express();
const port = process.env.PORT || 5000;

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;
const optionalEnv = ['YOUTUBE_API_KEY'] as const;
const missingRequiredEnv = requiredEnv.filter((key) => !process.env[key]);
const missingOptionalEnv = optionalEnv.filter((key) => !process.env[key]);

logger.info('Backend booting', {
  nodeEnv: process.env.NODE_ENV,
  nodeVersion: process.version,
  vercel: process.env.VERCEL === '1',
  vercelRegion: process.env.VERCEL_REGION,
  cwd: process.cwd(),
  envPresent: {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
    JWT_REFRESH_SECRET: Boolean(process.env.JWT_REFRESH_SECRET),
    YOUTUBE_API_KEY: Boolean(process.env.YOUTUBE_API_KEY),
  },
});

if (missingRequiredEnv.length > 0) {
  logger.error('Missing required environment variables', { missingRequiredEnv });
}

if (missingOptionalEnv.length > 0) {
  logger.warn('Missing optional environment variables', { missingOptionalEnv });
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.get('x-vercel-id') || crypto.randomUUID();
  const startedAt = Date.now();

  (req as Request & { requestId?: string }).requestId = requestId;
  res.setHeader('x-request-id', requestId);

  logger.info('HTTP request started', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  res.on('finish', () => {
    logger.info('HTTP request finished', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

// Basic route
app.get('/', (req, res) => {
  res.json(createSuccessResponse(200, 'SoundWave API is running'));
});

app.get('/api/health', async (req: Request, res: Response) => {
  const requestId = (req as Request & { requestId?: string }).requestId;
  const includeDatabase = req.query.db === '1';

  const health = {
    ok: true,
    requestId,
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      vercel: process.env.VERCEL === '1',
      vercelRegion: process.env.VERCEL_REGION,
    },
    envPresent: {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      JWT_REFRESH_SECRET: Boolean(process.env.JWT_REFRESH_SECRET),
      YOUTUBE_API_KEY: Boolean(process.env.YOUTUBE_API_KEY),
    },
    checks: {
      database: includeDatabase ? 'pending' : 'skipped',
    },
  };

  if (includeDatabase) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'ok';
    } catch (error) {
      logger.error('Health database check failed', { requestId, error });
      health.ok = false;
      health.checks.database = 'failed';
      const databaseError = serializeError(error) as {
        name?: unknown;
        message?: unknown;
        code?: unknown;
      };

      return res.status(500).json(
        createErrorResponse(
          500,
          'Backend health check failed. Check Vercel Function logs with this requestId.',
          JSON.stringify({
            requestId,
            database: {
              name: databaseError?.name,
              message: databaseError?.message,
              code: databaseError?.code,
            },
          })
        )
      );
    }
  }

  return res.json(
    createSuccessResponse(200, 'SoundWave backend health OK', health)
  );
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/liked-songs', favoriteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use((req: Request, res: Response) => {
  const requestId = (req as Request & { requestId?: string }).requestId;

  logger.warn('Route not found', {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  res.status(404).json(
    createErrorResponse(404, 'Route not found', `Request ID: ${requestId}`)
  );
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req as Request & { requestId?: string }).requestId;
  const statusCode =
    typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 500;

  logger.error('Unhandled request error', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error,
  });

  res.status(statusCode).json(
    createErrorResponse(
      statusCode,
      statusCode >= 500
        ? 'Internal server error. Check Vercel Function logs with this requestId.'
        : 'Request failed.',
      `Request ID: ${requestId}`
    )
  );
});

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    logger.info('Server is running', { port });
  });
} else {
  logger.info('Server initialized for Vercel serverless runtime');
}

export default app;
