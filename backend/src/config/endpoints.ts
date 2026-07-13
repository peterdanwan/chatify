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
    ACCOUNT: '/account',
    PREFERENCES: '/preferences',
    // OAuth2 — initiation routes redirect the browser to the provider's login page
    GOOGLE: '/google',
    GOOGLE_CALLBACK: '/google/callback',
    GITHUB: '/github',
    GITHUB_CALLBACK: '/github/callback',
    FACEBOOK: '/facebook',
    FACEBOOK_CALLBACK: '/facebook/callback',
  },

  // Message endpoints
  MESSAGES: {
    BASE: '/api/messages',
    CHATS: '/chats',
    BY_USER_ID: '/:id',
    SEND_TO_ID: '/send/:id',
  },

  // Contact request endpoints — mutual accept required before two users can message each other
  CONTACTS: {
    BASE: '/api/contacts',
    LIST: '/',
    REQUESTS: '/requests',
    ACCEPT: '/requests/:id/accept',
    REMOVE: '/requests/:id',
  },
} satisfies Record<string, EndpointGroup>;
