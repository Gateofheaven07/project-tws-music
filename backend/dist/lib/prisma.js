"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient({
    log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        ...(process.env.NODE_ENV === 'development'
            ? [{ emit: 'event', level: 'query' }]
            : []),
    ],
});
exports.prisma = prisma;
prisma.$on('error', (event) => {
    logger_1.logger.error('Prisma error', {
        message: event.message,
        target: event.target,
    });
});
prisma.$on('warn', (event) => {
    logger_1.logger.warn('Prisma warning', {
        message: event.message,
        target: event.target,
    });
});
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (event) => {
        logger_1.logger.info('Prisma query', {
            query: event.query,
            durationMs: event.duration,
        });
    });
}
exports.default = prisma;
