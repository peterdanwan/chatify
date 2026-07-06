// backend/src/middleware/arcjet.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import aj from '#lib/arcjet.js';
import { isSpoofedBot } from '@arcjet/inspect';
import { createLogger } from '#config/logger.js';

const log = createLogger(import.meta.url);

export const arcjetProtection = async (req: Request, res: Response, next: NextFunction) => {
  log.debug('Running Arcjet middleware');

  try {
    // Whether we want to deny or accept the request
    const decision = await aj.protect(req);

    // Only check denials from rules that are actually running (not DRY_RUN)
    // DRY_RUN rules log but don't block, so we ignore them here
    const actualDenial = decision.results.find(
      (result) => result.state === 'RUN' && result.conclusion === 'DENY'
    );

    if (actualDenial) {
      if (actualDenial.reason.type === 'RATE_LIMIT') {
        log.warn('Arcjet denied request: Rate limit exceeded');

        // Status Code 429: Too Many Requests
        return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
      } else if (actualDenial.reason.type === 'BOT') {
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
    // Only check spoofed bots if the bot detection rule is actually running
    const botRuleRunning = decision.results.some(
      (result) => result.reason.type === 'BOT' && result.state === 'RUN'
    );

    if (botRuleRunning && decision.results.some(isSpoofedBot)) {
      log.warn('Arcjet denied request: Spoofed bot detected');

      // Status Code 403 = Forbidden
      return res.status(403).json({
        error: 'Spoofed bot detected.',
        message: 'Malicious bot activity detected.',
      });
    }

    log.info('Arcjet middleware accepted the request');
    next();
  } catch (error) {
    log.error(error, 'Arcjet Protection Error');

    if (process.env.ARCJET_FAIL_OPEN === 'true') {
      log.error('Arcjet failed, but allowing request to pass');
      return next();
    }

    return res
      .status(503)
      .json({ code: 'PROTECTION_UNAVAILABLE', message: 'Service temporarily unavailable.' });
  }
};
