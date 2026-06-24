import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';

let io;

const joinRooms = (socket, user) => {
  socket.join(`user:${user._id.toString()}`);

  if (user.role === 'admin') {
    socket.join('admins');
  }
};

export const initializeSocket = (server, clientOrigin) => {
  io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next();
      }

      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.user) {
      joinRooms(socket, socket.data.user);
    }
  });

  return io;
};

const emitToRoom = (room, event, payload) => {
  if (!io) {
    return;
  }

  io.to(room).emit(event, payload);
};

const EVENT_MAP = {
  placed: 'order:placed',
  confirmed: 'order:confirmed',
  preparing: 'order:preparing',
  out_for_delivery: 'order:out-for-delivery',
  delivered: 'order:delivered',
  cancelled: 'order:cancelled',
};

export const emitOrderCreated = (userId, order) => {
  const eventName = EVENT_MAP[order.orderStatus] ?? 'order:placed';
  emitToRoom(`user:${userId}`, eventName, order);
  emitToRoom('admins', `admin:${eventName}`, order);
  emitToRoom(`user:${userId}`, 'order:created', order);
  emitToRoom('admins', 'admin:order:created', order);
};

export const emitOrderStatusUpdated = (userId, order) => {
  const eventName = EVENT_MAP[order.orderStatus];
  if (eventName) {
    emitToRoom(`user:${userId}`, eventName, order);
    emitToRoom('admins', `admin:${eventName}`, order);
  }
  emitToRoom(`user:${userId}`, 'order:status', order);
  emitToRoom('admins', 'admin:order:status', order);
};

export const emitNotification = (userId, notification) => {
  emitToRoom(`user:${userId}`, 'notification', notification);
};

export const emitDashboardUpdate = (payload) => {
  emitToRoom('admins', 'admin:dashboard', payload);
};

export const emitPaymentEvent = (userId, payload) => {
  emitToRoom(`user:${userId}`, 'payment:event', payload);
};

export const getSocketServer = () => io;