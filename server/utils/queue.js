import { getRedisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';

const QUEUE_KEY = 'jobs:queue';
let isWorkerRunning = false;
const jobHandlers = new Map();

export const backgroundQueue = {
  // Register a handler for a job type
  registerHandler: (type, handler) => {
    jobHandlers.set(type, handler);
  },

  // Add a job to the queue
  addJob: async (type, data) => {
    try {
      const client = getRedisClient();
      const jobString = JSON.stringify({ type, data, createdAt: Date.now() });
      await client.rpush(QUEUE_KEY, jobString);
      logger.debug({ type }, 'Job added to background queue');
      return true;
    } catch (error) {
      logger.error({ error, type }, 'Failed to add job to queue');
      return false;
    }
  },

  // Start the background worker loop
  startWorker: async () => {
    if (isWorkerRunning) {
      return;
    }
    isWorkerRunning = true;
    logger.info('Background job worker started');

    (async () => {
      const client = getRedisClient();

      while (isWorkerRunning) {
        try {
          if (client.status && client.status !== 'ready') {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }

          const jobString = await client.lpop(QUEUE_KEY);
          if (!jobString) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }

          const job = JSON.parse(jobString);

          logger.debug({ type: job.type }, 'Processing background job');
          const handler = jobHandlers.get(job.type);

          if (handler) {
            await handler(job.data);
            logger.debug({ type: job.type }, 'Job processed successfully');
          } else {
            logger.warn({ type: job.type }, 'No handler registered for job type');
          }
        } catch (error) {
          logger.error({ error }, 'Error processing background job');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    })();
  },

  // Stop the worker loop
  stopWorker: () => {
    isWorkerRunning = false;
  },
};
