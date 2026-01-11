// backend/src/server.js

/* Import External Libraries */
import express from 'express';
import stoppable from 'stoppable';
import path from 'path';
import { fileURLToPath } from 'url';

/* Run dotEnv config before all other files that require env variables */
import '#config/dotEnv.js';

/* Import our custom modules */
import { parentLogger, shutDownLogger } from '#config/logger.js';
import { connectDB } from '#lib/db.js';
import healthCheckRoute from '#routes/api/health.route.js';
import authRoutes from '#routes/api/auth.route.js';
import messageRoutes from '#routes/api/message.route.js';

/* Create a child instance of our structured logger */
const log = parentLogger.child({ module: 'server.js' });

/* ES6 way of extracting the __dirname of this file */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Create our express app */
const app = express();
const PORT = process.env.PORT || 5001;

/* Middleware */
app.use(express.json()); // Lets each route parse the body a request and access it through req.body

/* Health check endpoint - BEFORE other routes so it's always accessible */
app.use('/health', healthCheckRoute);

/* API Routes */
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

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
        console.log(`Server listening on port: ${3000}`);
        // log.info(`Server listening on port: ${PORT}`);
      })
    );
  })
  // Better to "catch" the error at the top-most level where we call connectDB(), rather than within connectDB() itself.
  .catch((error) => {
    console.error('Error connecting to MongoDB', { error });
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
        console.error('Error during shutdown:', { err });
        shutDownLogger.error('Error during shutdown:', err);
        process.exit(1);
      }
      console.error('Server stopped gracefully');
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
