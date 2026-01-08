// backend/src/routes/api/auth.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';
import { signup, login, logout, deleteUser } from '#controllers/auth.controller.js';

const log = parentLogger.child({ module: 'auth.route.js' });

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.delete('/delete', deleteUser);

log.info('Initialized "auth" routes');

export default router;
