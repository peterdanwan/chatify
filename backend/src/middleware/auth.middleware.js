// src/middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import { User } from '#models/User.js';
import { createLogger } from '#config/logger.js';

const log = createLogger(import.meta.url);

export const protectRoute = async (req, res, next) => {
  try {
    log.debug("Checking for the existence of the 'jwt' token");

    // 1. This 'jwt' cookie is from the utils.js generateToken() function.
    // 2. To access this 'jwt' token from req.cookies, we configured the "cookie-parser" middleware in server.js.
    // 2. cookie-parser middleware (configured in server.js) parses the Cookie header and makes cookies accessible via req.cookies
    const token = req.cookies.jwt;
    if (!token) {
      log.warn('Unauthorized request: No token provided');
      // 401 = unauthorized
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    log.debug("Checking if the 'jwt' token is valid");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      log.warn('Unauthorized request: Invalid token');
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    log.debug({ userId: decoded.userId }, 'Checking if the user exists in the database');

    // Ref: https://mongoosejs.com/docs/api/query.html#Query.prototype.select()
    // - syntax: select('-<field_1> -<field_2>') to exclude
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      log.warn({ userId: decoded.userId }, 'User from token not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    log.debug("Adding 'user' to the 'req', so the next() function has access to it");
    req.user = user;

    // next() passes control to the next middleware/route handler in the Express chain.
    // E.g.:
    //  - for router.put("/update-profile", protectRoute, updateProfile); ...
    //  - calling next() within protectRoute tells express to call updateProfile with the same req, res, and next objects.
    log.info('User provided a valid JWT');
    next();
  } catch (error) {
    log.error(error, 'Error in protectRoute middleware');
    return res.status(500).json({ message: 'Internal server error' });
  }
};
