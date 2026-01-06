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

function createPinoLogger(options, usePretty = false) {
  if (usePretty) {
    const prettyOptions = {
      ...options,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    };

    try {
      const logger = pino(prettyOptions);
      logger
        .child({ module: 'logger.js' })
        .info(`Logging using pino-pretty with log level set to "${LOG_LEVEL}"`);

      return logger;
    } catch (error) {
      const fallbackLogger = pino({ level: options.level });
      const child = fallbackLogger.child({ module: 'logger.js' });
      child.warn(
        error,
        `'pino-pretty' was not installed properly. Logging using the default pino logger with log level set to "${LOG_LEVEL}"`
      );

      return fallbackLogger;
    }
  }
  const logger = pino(options);
  const child = logger.child({ module: 'logger.js' });
  child.info(`Logging using the default pino logger with log level set to "${LOG_LEVEL}"`);

  return logger;
}

const options = { level: LOG_LEVEL || 'info' };

// In development, while we are debugging by ourselves, we will use
// the 'pino-pretty' devDependency to format our logs.
// Otherwise, we want the raw JSON from pino to be sent to other services to be processed.
const shouldUsePretty = NODE_ENV === 'development' && options.level === 'debug';

// Export our configured pino logger
// Note: if pino-pretty isn't installed (e.g., in Production and the env file is not set up correctly) it can throw an error.
//       This issue is caught by "createPinoLogger()".
export const parentLogger = createPinoLogger(options, shouldUsePretty);

// Create a synchronous logger specifically for shutdown scenarios
export const shutDownLogger = pino({ level: options.level }, pino.destination({ sync: true }));
