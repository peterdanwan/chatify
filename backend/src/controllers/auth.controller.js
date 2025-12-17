// backend/src/controllers/auth.controller.js

import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'auth.controller.js' });

export const getSignup = (req, res) => {
  log.info('Sign up endpoint');
  res.send('Signup endpoint');
};

export const getLogin = (req, res) => {
  res.send('Login endpoint');
};

export const getLogout = (req, res) => {
  res.send('Logout endpoint');
};
