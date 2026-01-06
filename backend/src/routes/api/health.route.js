// backend/src/routes/api/health.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';
import { healthCheck } from '#controllers/health.controller.js';

const log = parentLogger.child({ module: 'health.route.js' });

const router = express.Router();
router.get('/', healthCheck);

log.info('Initialized "health" route');

export default router;
