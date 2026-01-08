// backend/src/lib/utils.js

import jwt from 'jsonwebtoken';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'utils.js' });
const { NODE_ENV, JWT_SECRET } = process.env;

// Generate a JWT and send it back as a cookie within the response sent to the client
export const generateToken = (userId, res) => {
  log.debug('Generating a token...');
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  if (!NODE_ENV) {
    throw new Error('NODE_ENV is not configured');
  }

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development',
  });

  log.debug('Generated token.');
  return token;
};

export const clearToken = (res) => {
  log.debug('Clearing token (logging out user)');

  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development',
  });

  log.debug('Cleared token (logged out user)');
};
