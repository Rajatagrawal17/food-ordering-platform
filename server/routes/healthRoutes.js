import { Router } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database is not connected');
    }

    await mongoose.connection.db.admin().ping();

    const redisClient = getRedisClient();
    const redisPing = await redisClient.ping();

    if (redisPing !== 'PONG') {
      throw new Error('Redis ping failed');
    }

    res.status(200).json({
      success: true,
      message: 'API is healthy',
      database: 'connected',
      redis: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: 'disconnected',
      error: error.message,
    });
  }
});

export default router;