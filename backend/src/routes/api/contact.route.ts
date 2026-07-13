// backend/src/routes/api/contact.route.ts

import express from 'express';
import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';
import {
  getContacts,
  getIncomingRequests,
  sendContactRequest,
  acceptContactRequest,
  removeContact,
} from '#controllers/contact.controller.js';
import { protectRoute, requireUsername } from '#middleware/auth.middleware.js';
import { arcjetProtection } from '#middleware/arcjet.middleware.js';

const log = createLogger(import.meta.url);
const { LIST, REQUESTS, ACCEPT, REMOVE } = ENDPOINTS.CONTACTS;

const router = express.Router();

// requireUsername: you can't be found or add anyone by username until you've claimed one yourself
router.use(arcjetProtection, protectRoute, requireUsername);

router.get(LIST, getContacts);
router.get(REQUESTS, getIncomingRequests);
router.post(REQUESTS, sendContactRequest);
router.post(ACCEPT, acceptContactRequest);
router.delete(REMOVE, removeContact);

log.info('Initialized "contact" routes');

export default router;
