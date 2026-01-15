// backend/src/middleware/arcjet.middleware.js

import aj from '#lib/arcjet.js';
import { isSpoofedBot } from '@arcjet/inspect';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'arcjet.middleware.js' });

export const arcjetProtection = async (req, res, next) => {
  try {
    // Whether we want to deny or accept the request
    const decision = await aj.protect(req);

    if (decision.isDenied) {
      if (decision.reason.isRateLimit()) {
        log.warn('Arcjet denied request: Rate limit exceeded');

        // Status Code 429: Too Many Requests
        return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
      } else if (decision.reason.isBot()) {
        log.warn('Arcjet denied request: Bot access detected');

        // Status Code 403 = Forbidden
        return res.status(403).json({ message: 'Bot access denied.' });
      } else {
        log.warn('Arcjet denied request: Breach of security policy');

        // Status Code 403 = Forbidden
        return res.status(403).json({ message: 'Access denied by security policy.' });
      }
    }

    // Check for spoofed bots (bots that act like a human and pretend that they are not a bot, making it harder to detect them)
    // Ref: https://docs.arcjet.com/bot-protection/reference/#check-for-spoofed-bots
    if (decision.results.some(isSpoofedBot)) {
      log.warn('Arcjet denied request: Spoofed bot detected');

      // Status Code 403 = Forbidden
      return res.status(403).json({
        error: 'Spoofed bot detected.',
        message: 'Malicious bot activity detected.',
      });
    }

    log.info('Arcjet accepted the request');
    next();
  } catch (error) {
    log.error(error, 'Arcjet Protection Error');

    if (process.env.ARCJET_FAIL_OPEN === 'true') {
      return next();
    }

    return res
      .status(503)
      .json({ code: 'PROTECTION_UNAVAILABLE', message: 'Service temporarily unavailable.' });
  }
};
