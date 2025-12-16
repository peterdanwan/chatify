// backend/server.js

import express from 'express';
import stoppable from 'stoppable';
import path from 'path';
import { fileURLToPath } from 'url';

import '#config/dotEnv.js';
import { logger, shutDownLogger } from '#config/logger.js';
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Express v4: app.get('*', (req, res) => ...)
  // Express v5 ref: https://github.com/expressjs/express/issues/5936#issuecomment-2340677058
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend', '/dist', 'index.html'));
  });
}

// Setting up our server
const server = stoppable(
  app.listen(PORT, () => {
    serverLog.info(`Server listening on port: ${PORT}`);
  })
);

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
