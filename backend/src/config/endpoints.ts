// backend/src/config/endpoints.ts

type EndpointValue = string | ((...args: unknown[]) => string);

type EndpointGroup = {
  BASE: string;
  [key: string]: EndpointValue;
};

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
} satisfies Record<string, EndpointGroup>;
