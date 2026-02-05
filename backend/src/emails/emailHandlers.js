// backend/src/emails/emailHandlers.js

import { createLogger } from '#config/logger.js';
import { resendClient, sender } from '#lib/resend.js';
import { createWelcomeEmailTemplate } from '#emails/emailTemplates.js';

const log = createLogger(import.meta.url);

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Ref: https://resend.com/docs/send-with-nodejs#2-send-email-using-html

  // Error handling
  if (!sender?.email || !sender?.name) {
    throw new Error(
      'Email sender configuration missing (EMAIL_FROM, EMAIL_FROM_FIRST_NAME, EMAIL_FROM_LAST_NAME)'
    );
  }

  if (!email) {
    throw new Error('Recipient email is required');
  }

  if (!clientURL) {
    throw new Error('clientURL is required');
  }

  // Use resend client to send the email
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Welcome to Chatify!',
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    // One error might be:
    // You can only send testing emails to your own email address (YOUR_EMAIL@mail.com).
    // To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.
    log.error(error, 'Error sending welcome email:');
    throw new Error('Failed to send welcome email');
  }

  // data = { id: "c8asdf-123sdr-3r0fgdf-sdgf-sdfg" }
  log.info(data, 'Welcome Email sent successfully');
};
