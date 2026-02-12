// backend/src/lib/socket.js

import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { createLogger } from '#config/logger.js';
import { socketAuthMiddleware } from '#middleware/socket.auth.middleware.js';

const log = createLogger(import.meta.url);
const app = express();

const server = http.createServer(app);

// io = socket server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
    credentials: true,
  },
});

// Apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// This is for storing online users:
// In-memory presence: Map<userId, Set<socketId>>
const userSocketMap = new Map();

// 1. Detect when someone goes online
io.on('connection', (socket) => {
  const firstName = socket.user.firstName;
  const lastName = socket.user.lastName;
  log.info(`${firstName} ${lastName} connected`);

  const userId = socket.userId;
  const sockets = userSocketMap.get(userId) ?? new Set();
  sockets.add(socket.id);
  userSocketMap.set(userId, sockets);

  // 2. Use io.emit() to send event(s) + data to all connected clients
  io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  // 3. Detect when someone goes offline
  // - With socket.ion, we listen for events from clients
  socket.on('disconnect', () => {
    log.info(`${firstName} ${lastName} disconnected`);
    const sockets = userSocketMap.get(userId);

    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
    }

    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
});

export { io, app, server };
