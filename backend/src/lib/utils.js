// backend/src/lib/utils.js

import jwt from 'jsonwebtoken';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'utils.js' });

// This response will be sent back as a response in the cookies to the client
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: process.env.NODE_ENV === 'development' ? false : true,
  });

  log.debug('Generated token.');
  return token;
};
