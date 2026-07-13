// backend/src/lib/socket.ts

import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';
import stoppable from 'stoppable';
import { createLogger } from '#config/logger.js';
import { socketAuthMiddleware } from '#middleware/socket.auth.middleware.js';

const log = createLogger(import.meta.url);
const app = express();

const server = stoppable(http.createServer(app));

// io = socket server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL as string],
    credentials: true,
  },
});

// Apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// Use this function to check if the user is online or not
export function getReceiverSocketId(userId: string): Set<string> | undefined {
  return userSocketMap.get(userId);
}

// This is for storing online users:
// In-memory presence: Map<userId, Set<socketId>>
const userSocketMap = new Map<string, Set<string>>();

// 1. Detect when someone goes online
io.on('connection', (socket: Socket) => {
  const displayName: string = socket.user.displayName;
  log.info(`${displayName} connected`);

  const userId: string = socket.userId;
  const sockets: Set<string> = userSocketMap.get(userId) ?? new Set<string>();
  sockets.add(socket.id);
  userSocketMap.set(userId, sockets);

  // 2. Use io.emit() to send event(s) + data to all connected clients
  io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  // 3. Detect when someone goes offline
  // - With socket.ion, we listen for events from clients
  socket.on('disconnect', () => {
    log.info(`${displayName} disconnected`);
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
