// backend/config/logger.js

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

const options = { level: process.env.LOG_LEVEL || 'info' };

// In development, while we are debugging by ourselves, we will use
// the 'pino-pretty' devDependency to format our logs.
// Otherwise, we want the raw JSON to be going to other services to be processed.
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// Export our configured pino logger
export const logger = pino(options);

// Create a synchronous logger specifically for shutdown scenarios
export const shutDownLogger = pino({
  ...pino.destination({
    sync: true,
  }),
});
