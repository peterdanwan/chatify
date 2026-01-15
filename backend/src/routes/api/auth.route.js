// backend/src/routes/api/auth.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';
import { signup, login, logout, deleteUser, updateProfile } from '#controllers/auth.controller.js';

import { protectRoute } from '#middleware/auth.middleware.js';
import { arcjetProtection } from '#middleware/arcjet.middleware.js';

const log = parentLogger.child({ module: 'auth.route.js' });

const router = express.Router();

// Instead of doing:
// router.post('/signup', arcjetProtection, signup);
// router.post('/login', arcjetProtection, login);
// router.post('/logout', arcjetProtection, logout);
// router.put('/update-profile', arcjetProtection, protectRoute, updateProfile);
// router.delete('/delete-user', arcjetProtection, protectRoute, deleteUser);
// router.get('/check', arcjetProtection, protectRoute, (req, res) => res.status(200).json(req.user));
// We can ensure that our arcjetProtection middleware runs before any of our other middleware and route handlers by:
//  1. placing it in using app.use()
//  2. calling the next() function within our arcjetProtection function to pass the req, res, and next arguments to the next middleware / route handlers
// By doing this, we've ensured all our routes are rate limit protected.
router.use(arcjetProtection);

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

// PROTECTED ROUTES:
// Ref: https://expressjs.com/en/api.html#middleware-callback-function-examples
router.put('/update-profile', protectRoute, updateProfile);
router.delete('/delete-user', protectRoute, deleteUser);
router.get('/check', protectRoute, (req, res) => res.status(200).json(req.user));

log.info('Initialized "auth" routes');

export default router;
