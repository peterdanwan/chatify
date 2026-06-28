// backend/src/lib/arcjet.ts

import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const { ARCJET_ENV, NODE_ENV } = process.env;
// Use ARCJET_ENV to determine mode, falling back to NODE_ENV if not set
const mode = (ARCJET_ENV ?? NODE_ENV) === 'production' ? 'LIVE' : 'DRY_RUN';
// const mode = 'LIVE';

// Ref: https://docs.arcjet.com/get-started?f=node-js-express
export const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g., a SQL injection
    shield({ mode }),
    // Create a bot detection rule
    detectBot({
      mode, // Blocks requests. Use "DRY_RUN" to just log the requests
      // Block all bots except the following
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g.: Slack, Discord
      ],
    }),

    // Ref: https://docs.arcjet.com/rate-limiting/algorithms/#sliding-window
    slidingWindow({
      mode, // will block requests. Use "DRY_RUN" to log only
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      interval: 60, // 60 second sliding window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});

export default aj;
