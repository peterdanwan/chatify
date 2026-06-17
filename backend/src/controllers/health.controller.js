// backend/src/controllers/health.controller.js

import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';

const log = createLogger(import.meta.url);
const HEALTH = ENDPOINTS.HEALTH.BASE;

export const healthCheck = (req, res) => {
  log.info(`'${HEALTH}' (GET) endpoint reached.`);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};
