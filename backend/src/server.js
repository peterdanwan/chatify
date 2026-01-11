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

/* DIAGNOSTIC BLOCK - REPLACE THE OLD ONE */
console.log('=== DIAGNOSTIC START ===');
console.log('1. Console.log works');
console.error('2. Console.error works');

console.log('LOG_LEVEL from env:', process.env.LOG_LEVEL);
console.log('NODE_ENV from env:', process.env.NODE_ENV);

// Test if parentLogger exists and has correct level
console.log('parentLogger level:', parentLogger.level);
console.log('parentLogger levelVal:', parentLogger.levelVal);

// Try manual JSON log (what Pino would output)
console.log(
  JSON.stringify({
    level: 30,
    time: Date.now(),
    msg: '3. Manual JSON log test',
  })
);

try {
  parentLogger.info('4. Pino parentLogger.info test');
  console.log('5. After pino call - no error thrown');
} catch (error) {
  console.error('ERROR calling parentLogger:', error);
}

// Try forcing a flush
process.stdout.write('6. Direct stdout.write test\n');

console.log('=== DIAGNOSTIC END ===');
/* END DIAGNOSTIC BLOCK */

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
