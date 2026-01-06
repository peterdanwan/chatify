// backend/src/routes/api/message.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'health.route.js' });

const router = express.Router();

router.get('/send', (req, res) => {
  res.send;
});

log.info('Initialized "message" routes');

export default router;
