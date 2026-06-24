import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';
import { getSocketServer } from '../socket/index.js';
import { backgroundQueue } from './queue.js';
import { logger } from '../config/logger.js';

export const gracefulShutdown = (server) => {
  return async () => {
    logger.info('Graceful shutdown initiated...');

    if (server) {
      server.close((err) => {
        if (err) {
          logger.error({ err }, 'Error closing HTTP server');
        } else {
          logger.info('HTTP server closed.');
        }
      });
    }

    const io = getSocketServer();
    if (io) {
      io.close(() => {
        logger.info('Socket.io server closed.');
      });
    }

    backgroundQueue.stopWorker();
    logger.info('Background job worker stopped.');

    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed.');
      }
    } catch (err) {
      logger.error({ err }, 'Error closing Redis connection');
    }

    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
    } catch (err) {
      logger.error({ err }, 'Error closing MongoDB connection');
    }

    logger.info('Shutdown complete. Exiting process.');
    process.exit(0);
  };
};

export const registerShutdownHandlers = (server) => {
  const handler = gracefulShutdown(server);
  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);
};
