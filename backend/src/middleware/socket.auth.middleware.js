// backend/src/middleware/socket.auth.middleware.js

import jwt from 'jsonwebtoken';
import { createLogger } from '#config/logger.js';
import { User } from '#models/User.js';

const log = createLogger(import.meta.url);

// The socket here is the user connect from the frontend
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('jwt='))
      ?.split('=')[1];

    if (!token) {
      log.warn('Socket connection rejected: No token provided');
      return next(new Error('Unauthorized - No Token Provided'));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      log.warn('Socket connection rejected: Invalid token');
      return new new Error('Unauthorized - Invalid Token')();
    }

    // Find the user from the database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      log.warn('Socket connection rejected: User not found');
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    log.info(`Socket authenticated for user: ${user.firstName} ${user.lastName} (${user._id})`);
    next();
  } catch (error) {
    log.error({ err: error.message }, 'Error in socket authentication');
    next(new Error('Unauthorized - Authentication failed'));
  }
};
