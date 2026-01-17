// backend/src/routes/api/message.route.js

import express from 'express';
import { parentLogger } from '#config/logger.js';
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from '#controllers/message.controller.js';
import { protectRoute } from '#middleware/auth.middleware.js';
import { arcjetProtection } from '#middleware/arcjet.middleware.js';

const log = parentLogger.child({ module: 'message.route.js' });

const router = express.Router();

// Since all of our message routes should be:
// 1. Rate limited
// 2. Protected (via authentication)
//
// We can set up our middleware to run prior to any specific route-handling logic via router.use()
router.use(arcjetProtection, protectRoute);

router.get('/contacts', getAllContacts);
router.get('/chats', getChatPartners);

// Gets all the messages between the logged in user and another individual who's id we have
// This is an example of a "dynamic route" (i.e., has a ':' followed by a named value (e.g., 'id'))
// We can access the value of the id via req.params.id - since id is what we put for this endpoint.
router.get('/:id', getMessagesByUserId);

// Sends a message to another user by using that other user's id in the request
router.post('/send/:id', sendMessage);

log.info('Initialized "message" routes');

export default router;
