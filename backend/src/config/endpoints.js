// backend/src/config/endpoints.js

export const ENDPOINTS = {
  // Health check
  HEALTH: {
    BASE: '/health',
  },

  // Authentication endpoints
  AUTH: {
    BASE: '/api/auth',
    CHECK: '/check',
    DELETE_USER: '/delete-user',
    SIGNUP: '/signup',
    LOGIN: '/login',
    LOGOUT: '/logout',
    UPDATE_PROFILE: '/update-profile',
    PREFERENCES: '/preferences',
  },

  // Message endpoints
  MESSAGES: {
    BASE: '/api/messages',
    CONTACTS: '/contacts',
    CHATS: '/chats',
    BY_USER_ID: '/:id',
    SEND_TO_ID: '/send/:id',
  },
};

/**
 * Route prefixes for use in route registration
 */
export const ENDPOINT_PREFIXES = {
  HEALTH: ENDPOINTS.HEALTH.BASE,
  AUTH: ENDPOINTS.AUTH.BASE,
  MESSAGES: ENDPOINTS.MESSAGES.BASE,
};
