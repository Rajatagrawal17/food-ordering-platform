import { io } from 'socket.io-client';

let socket;
let activeToken;

export const connectSocket = (token) => {
  if (socket && activeToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  activeToken = token;

  socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000', {
    withCredentials: true,
    auth: token ? { token } : {},
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = undefined;
  activeToken = undefined;
};

export const onSocketEvent = (eventName, handler) => {
  if (!socket) {
    return () => undefined;
  }

  socket.on(eventName, handler);

  return () => socket.off(eventName, handler);
};

export const getSocket = () => socket;