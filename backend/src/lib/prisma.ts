import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
    ...(process.env.NODE_ENV === 'development'
      ? ([{ emit: 'event', level: 'query' }] as const)
      : []),
  ],
});

prisma.$on('error', (event) => {
  logger.error('Prisma error', {
    message: event.message,
    target: event.target,
  });
});

prisma.$on('warn', (event) => {
  logger.warn('Prisma warning', {
    message: event.message,
    target: event.target,
  });
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    logger.info('Prisma query', {
      query: event.query,
      durationMs: event.duration,
    });
  });
}

export { prisma };
export default prisma;
