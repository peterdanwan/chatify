// backend/src/routes/api/message.route.js

import express from 'express';
import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from '#controllers/message.controller.js';
import { protectRoute } from '#middleware/auth.middleware.js';
import { arcjetProtection } from '#middleware/arcjet.middleware.js';

const log = createLogger(import.meta.url);
const { CONTACTS, CHATS, BY_USER_ID, SEND_TO_ID } = ENDPOINTS;

const router = express.Router();

// Since all our message routes should have:
// 1. Rate limiting, AND
// 2. Authentication protection...
//
// We have our router run both of these middlewares in this sequence (via router.use()) prior to any route-handling logic
router.use(arcjetProtection, protectRoute);

// Gets all contacts in our database (PW: why?)
router.get(CONTACTS, getAllContacts);

// Gets the chats you have with other individuals
router.get(CHATS, getChatPartners);

// Gets all the messages between the logged in user and another individual who's id we have
// This is an example of a "dynamic route" (i.e., has a ':' followed by a named value (e.g., 'id'))
// We can access the value of the id via req.params.id - since id is what we put for this endpoint.
// From the frontend, we'd click on one of the chatPartners returned from getChatPartners, to get his id
router.get(BY_USER_ID, getMessagesByUserId);

// Sends a message to another user by using that other user's id in the request
router.post(SEND_TO_ID, sendMessage);

log.info('Initialized "message" routes');

export default router;
