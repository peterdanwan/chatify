// backend/src/controllers/health.controller.js

import { createLogger } from '#config/logger.js';

const log = createLogger(import.meta.url);

export const healthCheck = (req, res) => {
  log.info("'/health' (GET) endpoint reached.");

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};
