// backend/src/routes/api/health.route.ts

import express from 'express';
import { createLogger } from '#config/logger.js';
import { healthCheck } from '#controllers/health.controller.js';

const log = createLogger(import.meta.url);

const router = express.Router();
router.get('/', healthCheck);

log.info('Initialized "health" route');

export default router;
