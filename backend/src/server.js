// backend/server.js

import express from 'express';
import stoppable from 'stoppable';
import path from 'path';
import { fileURLToPath } from 'url';

import '#config/dotEnv.js'; // Important this is run first here before all other imports.

import { logger, shutDownLogger } from '#config/logger.js';
import { connectDB } from './lib/db.js';
import authRoutes from '#routes/api/auth.route.js';
import messageRoutes from '#routes/api/message.route.js';

const serverLog = logger.child({ module: 'server.js' });
const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// In production, serve frontend from within our backend server
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

// Setting up our server
let server;

connectDB().then(() => {
  server = stoppable(
    app.listen(PORT, () => {
      serverLog.info(`Server listening on port: ${PORT}`);
    })
  );
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
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

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
