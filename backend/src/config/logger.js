// backend/src/config/logger.js

// Refs:
// 0a. https://betterstack.com/community/guides/logging/logging-framework/
// 0b. https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/
// 0c. https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/#1-using-jq
//   - npm run dev | jq '{msg,hostname}'
// 1. https://github.com/pinojs/pino
// 2. https://github.com/pinojs/pino/blob/main/docs/api.md#options
// 3. https://github.com/pinojs/pino-pretty
// 4. https://github.com/pinojs/pino/blob/main/docs/asynchronous.md

import pino from 'pino';

const { NODE_ENV, LOG_LEVEL } = process.env;

function createPinoLogger(usePretty = false) {
  const baseOptions = { level: LOG_LEVEL };

  if (usePretty) {
    try {
      return pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      });
    } catch (error) {
      // Fallback to standard logger if pino-pretty isn't available
      const fallbackLogger = pino({
        ...baseOptions,
        ...pino.destination({ sync: true }),
      });
      fallbackLogger
        .child({ module: 'logger.js' })
        .warn(error, 'pino-pretty not available, using standard JSON logging');
      return fallbackLogger;
    }
  }

  // FOR PRODUCTION: Use synchronous logging to ensure logs aren't buffered
  // This is critical for containerized environments like Sevalla
  return pino({
    ...baseOptions,
    ...pino.destination({ sync: true }),
  });
}

// In development, while we are debugging by ourselves, we will use
// the 'pino-pretty' devDependency to format our logs.
// Otherwise, we want the raw JSON from pino to be sent to other services to be processed.
const shouldUsePretty = NODE_ENV === 'development' && LOG_LEVEL === 'debug';

// Export our configured pino logger
// Note: if pino-pretty isn't installed (e.g., in Production and the env file is not set up correctly) it can throw an error.
//       This issue is caught by "createPinoLogger()".
export const parentLogger = createPinoLogger(shouldUsePretty);

// Create a synchronous logger specifically for shutdown scenarios
export const shutDownLogger = pino({ level: LOG_LEVEL }, pino.destination({ sync: true }));
