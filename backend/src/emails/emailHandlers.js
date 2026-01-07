// backend/src/emails/emailHandlers.js

import { parentLogger } from '#config/logger.js';
import { resendClient, sender } from '#lib/resend.js';
import { createWelcomeEmailTemplate } from '#emails/emailTemplates.js';

const log = parentLogger.child({ module: 'emailHandler.js' });

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Ref: https://resend.com/docs/send-with-nodejs#2-send-email-using-html
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Welcome to Chatify!',
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    log.error(error, 'Error sending welcome email:');
    throw new Error('Failed to send welcome email');
  }

  // data = { id: "c8asdf-123sdr-3r0fgdf-sdgf-sdfg" }
  log.info(data, 'Welcome Email sent successfully');
};
