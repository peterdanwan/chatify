// backend/src/lib/resend.js

import { Resend } from 'resend';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'resend.js' });
const { EMAIL_FROM, EMAIL_FROM_FIRST_NAME, EMAIL_FROM_LAST_NAME, RESEND_API_KEY } = process.env;

// Ref: https://resend.com/docs/send-with-nodejs#2-send-email-using-html

// We send emails with the resendClient
export const resendClient = new Resend(RESEND_API_KEY);

// The information our users see when they receive emails from us
export const sender = {
  email: EMAIL_FROM,
  name: `${EMAIL_FROM_FIRST_NAME} ${EMAIL_FROM_LAST_NAME}`,
};

log.info('Configured resend client');
