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
import { fileURLToPath } from 'url';
import path from 'path';

const { LOG_LEVEL, USE_PRETTY } = process.env;
const baseOptions = { level: LOG_LEVEL };

function createPinoLogger(): pino.Logger<never, boolean> {
  if (USE_PRETTY === 'true') {
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
      const fallbackLogger = pino(baseOptions, process.stdout);
      fallbackLogger
        .child({ module: 'logger.js' })
        .warn(error, 'pino-pretty not available, using standard JSON logging');
      return fallbackLogger;
    }
  }

  // FOR PRODUCTION: Use synchronous logging to ensure logs aren't buffered
  // This is critical for containerized environments like Sevalla
  return pino(baseOptions, process.stdout);
}

// DEPRECATED:
// In development, while we are debugging by ourselves, we will use
// the 'pino-pretty' devDependency to format our logs.
// Otherwise, we want the raw JSON from pino to be sent to other services to be processed.
// const shouldUsePretty = NODE_ENV === 'development' && LOG_LEVEL === 'debug';
// CURRENT: (just use pino-pretty depending on the PaaS)

// Export our configured pino logger
// Note: if pino-pretty isn't installed (e.g., in Production and the env file is not set up correctly) it can throw an error.
//       This issue is caught by "createPinoLogger()".
export const parentLogger: pino.Logger<never, boolean> = createPinoLogger();

// Create a synchronous logger specifically for shutdown scenarios
export const shutDownLogger: pino.Logger<never, boolean> = pino(baseOptions, process.stdout);

/**
 * Creates a child logger with the module name automatically derived from import.meta.url
 * @param {string} importMetaUrl - Pass import.meta.url from the calling module
 * @param {boolean} [showFullPath=true] - If true, shows relative path from project root; if false, shows only filename
 * @returns {pino.Logger} A child logger with the module attribute set
 */
export function createLogger(
  importMetaUrl: string,
  showFullPath: boolean = true
): pino.Logger<never, boolean> {
  const filepath: string = fileURLToPath(importMetaUrl);

  const moduleName: string = showFullPath
    ? path.relative(process.cwd(), filepath)
    : path.basename(filepath);

  // Normalize path separators to forward slashes ('/') for consistency across platforms
  const normalizedModuleName: string = moduleName.split(path.sep).join('/');

  const childLogger: pino.Logger<never, boolean> = parentLogger.child({
    module: normalizedModuleName,
  });
  return childLogger;
}

// backend/src/config/logger.j