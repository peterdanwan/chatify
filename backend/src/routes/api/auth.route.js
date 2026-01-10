// backend/src/routes/api/auth.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';
import { signup, login, logout, deleteUser } from '#controllers/auth.controller.js';

const log = parentLogger.child({ module: 'auth.route.js' });

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Logout must use POST instead of GET because:
// 1. GET requests should be "safe" - they should only retrieve data, not modify
//    server state. Logging out modifies state (destroys the session).
// 2. GET requests can be triggered unintentionally by:
//    - Browser prefetching or caching
//    - Link crawlers and bots
//    - Browser history when user presses back or refresh
//    - Malicious sites using <img src="/logout"> or <a href="/logout">
// 3. This prevents CSRF attacks where a malicious site could log users out
//    by simply embedding a link to the logout endpoint.
router.post('/logout', logout);
router.delete('/delete-user', deleteUser);

log.info('Initialized "auth" routes');

export default router;
