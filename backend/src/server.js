// backend/server.js

import express from 'express';
import stoppable from 'stoppable';

import '#config/dotEnv.js';
import { logger, shutDownLogger } from '#config/logger.js';
import authRoutes from '#routes/api/auth.route.js';
import messageRoutes from '#routes/api/message.route.js';

const serverLog = logger.child({ module: 'server.js' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const server = stoppable(
  app.listen(PORT, () => {
    serverLog.info(`Server listening on port: ${PORT}`);
  })
);

// // Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  // Create a synchronous logger to flush out stdout

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

// // Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
