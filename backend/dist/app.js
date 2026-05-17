"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SoundWave Backend Entry Point
require("dotenv/config");
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const response_1 = require("./utils/response");
const logger_1 = require("./lib/logger");
const prisma_1 = require("./lib/prisma");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const music_routes_1 = __importDefault(require("./routes/music.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception', { error });
});
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('Unhandled promise rejection', { reason });
});
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const optionalEnv = ['YOUTUBE_API_KEY'];
const missingRequiredEnv = requiredEnv.filter((key) => !process.env[key]);
const missingOptionalEnv = optionalEnv.filter((key) => !process.env[key]);
logger_1.logger.info('Backend booting', {
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
    logger_1.logger.error('Missing required environment variables', { missingRequiredEnv });
}
if (missingOptionalEnv.length > 0) {
    logger_1.logger.warn('Missing optional environment variables', { missingOptionalEnv });
}
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use((req, res, next) => {
    const requestId = req.get('x-vercel-id') || crypto_1.default.randomUUID();
    const startedAt = Date.now();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    logger_1.logger.info('HTTP request started', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        userAgent: req.get('user-agent'),
        ip: req.ip,
    });
    res.on('finish', () => {
        logger_1.logger.info('HTTP request finished', {
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
    res.json((0, response_1.createSuccessResponse)(200, 'SoundWave API is running'));
});
app.get('/api/health', async (req, res) => {
    const requestId = req.requestId;
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
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            health.checks.database = 'ok';
        }
        catch (error) {
            logger_1.logger.error('Health database check failed', { requestId, error });
            health.ok = false;
            health.checks.database = 'failed';
            const databaseError = (0, logger_1.serializeError)(error);
            return res.status(500).json((0, response_1.createErrorResponse)(500, 'Backend health check failed. Check Vercel Function logs with this requestId.', JSON.stringify({
                requestId,
                database: {
                    name: databaseError?.name,
                    message: databaseError?.message,
                    code: databaseError?.code,
                },
            })));
        }
    }
    return res.json((0, response_1.createSuccessResponse)(200, 'SoundWave backend health OK', health));
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/music', music_routes_1.default);
app.use('/api/playlists', playlist_routes_1.default);
app.use('/api/liked-songs', favorite_routes_1.default);
app.use('/api/history', history_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use((req, res) => {
    const requestId = req.requestId;
    logger_1.logger.warn('Route not found', {
        requestId,
        method: req.method,
        path: req.originalUrl,
    });
    res.status(404).json((0, response_1.createErrorResponse)(404, 'Route not found', `Request ID: ${requestId}`));
});
app.use((error, req, res, _next) => {
    const requestId = req.requestId;
    const statusCode = typeof error.status === 'number'
        ? error.status
        : 500;
    logger_1.logger.error('Unhandled request error', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        error,
    });
    res.status(statusCode).json((0, response_1.createErrorResponse)(statusCode, statusCode >= 500
        ? 'Internal server error. Check Vercel Function logs with this requestId.'
        : 'Request failed.', `Request ID: ${requestId}`));
});
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        logger_1.logger.info('Server is running', { port });
    });
}
else {
    logger_1.logger.info('Server initialized for Vercel serverless runtime');
}
exports.default = app;
