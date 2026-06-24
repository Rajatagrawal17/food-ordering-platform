import express from 'express';
import http from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import compression from 'compression';
import { mongoSanitize, xssClean } from './middleware/sanitize.js';
import hpp from 'hpp';
import morgan from 'morgan';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from './config/redis.js';
import { connectDatabase } from './config/db.js';
import { validateEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { csrfProtection } from './middleware/csrf.js';
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { initializeSocket } from './socket/index.js';
import { initializeWorker } from './utils/worker.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { correlationIdMiddleware } from './middleware/correlation.js';
import { registerShutdownHandlers } from './utils/shutdown.js';

dotenv.config();
validateEnv();
configureCloudinary();

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const port = Number(process.env.PORT ?? 5000);

app.use(correlationIdMiddleware);
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      },
    },
  })
);
app.use(compression());
app.use(mongoSanitize);
app.use(xssClean);
app.use(hpp());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => getRedisClient().call(args[0], ...args.slice(1)),
  }),
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => getRedisClient().call(args[0], ...args.slice(1)),
  }),
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => getRedisClient().call(args[0], ...args.slice(1)),
  }),
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.join(__dirname, '../docs/openapi.yaml');
const openapiFile = fs.readFileSync(openapiPath, 'utf8');
const swaggerDocument = YAML.parse(openapiFile);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1', securityRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/foods', foodRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments/create-order', checkoutLimiter);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/profile', profileRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    initializeSocket(server, clientOrigin);
    initializeWorker();
    registerShutdownHandlers(server);

    server.listen(port, () => {
      logger.info({ port }, 'Server running');
    });
  } catch (error) {
    logger.error({ error }, 'Server failed to start');
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
