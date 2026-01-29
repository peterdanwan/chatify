// backend/src/server.js

/* Import External Libraries */
import express from 'express';
import stoppable from 'stoppable';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';

/* Run dotEnv config before all other files that require env variables */
import '#config/dotEnv.js';

/* Import our custom modules */
import { createLogger, shutDownLogger } from '#config/logger.js';
import { ENDPOINT_PREFIXES } from '#config/endpoints.js';
import { connectDB } from '#lib/db.js';
import healthCheckRoute from '#routes/api/health.route.js';
import authRoutes from '#routes/api/auth.route.js';
import messageRoutes from '#routes/api/message.route.js';

/* Create a child instance of our structured logger */
const log = createLogger(import.meta.url, true);

/* ES6 way of extracting the __dirname of this file */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Create our express app */
const app = express();
const PORT = process.env.PORT || 5001;

/* Middleware */

// Lets each route parse the body of a request and access it through req.body
// By default limit is 50kb
app.use(express.json({ limit: '5MB' }));

// Allows the frontend to send cookies to our backend
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// The cookie-parser middleware lets each route read/parse the cookies
// from the 'Cookie' header of a request and makes the cookies accessible through "req.cookies".
// In contrast, "res.cookies(name, value, optionsObject)" lets us SET the value of a cookie per function call.
app.use(cookieParser());

/* Health check endpoint - BEFORE other routes so it's always accessible */
app.use(ENDPOINT_PREFIXES.HEALTH, healthCheckRoute);

/* API Routes */
app.use(ENDPOINT_PREFIXES.AUTH, authRoutes);
app.use(ENDPOINT_PREFIXES.MESSAGES, messageRoutes);

/* In production, serve frontend from within our backend server */
if (process.env.NODE_ENV === 'production') {
  // Express uses the dist folder for static assets
  // - no server-side processing => faster loading
  // - faster loading achieved through => browser caching and CDNs, which lowers server load
  // - served directly from the server to the browser
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Handling Requests with the "wildcard route handler"
  // - Express v4: app.get('*', (req, res) => ...)
  // - Express v5 ref: https://github.com/expressjs/express/issues/5936#issuecomment-2340677058
  // All other requests not handled by our middleware routes above go to this route.
  // We direct users to the index.html page when they try to visit other routes.
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend', '/dist', 'index.html'));
  });
}

/* Setting up our server */
let server;

connectDB()
  .then(() => {
    server = stoppable(
      app.listen(PORT, () => {
        log.info(`Server listening on port: ${PORT}`);
      })
    );
  })
  // Better to "catch" the error at the top-most level where we call connectDB(), rather than within connectDB() itself.
  .catch((error) => {
    log.error(error, 'Error connecting to MongoDB');
    process.exit(1); // 1 status code means fail, 0 means success
  });

/* Graceful shutdown handlers */
const gracefulShutdown = (signal) => {
  console.error(`${signal} received. Starting graceful shutdown...`);
  shutDownLogger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.stop((err) => {
      if (err) {
        shutDownLogger.error('Error during shutdown:', err);
        process.exit(1);
      }
      shutDownLogger.info('Server stopped gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

/* Listen for termination signals */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
