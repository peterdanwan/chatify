// backend/src/controllers/health.controller.ts

import type { Request, Response } from 'express';
import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';

const log = createLogger(import.meta.url);
const HEALTH = ENDPOINTS.HEALTH.BASE;

export const healthCheck = (_req: Request, res: Response) => {
  log.info(`'${HEALTH}' (GET) endpoint reached.`);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};
