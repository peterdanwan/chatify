// backend/src/controllers/contact.controller.ts

import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';
import { ContactRequest } from '#models/ContactRequest.js';
import { User } from '#models/User.js';
import { normalizeInputs } from '#lib/utils.js';
import { getReceiverSocketId, io } from '#lib/socket.js';

const log = createLogger(import.meta.url);
const { BASE, LIST, REQUESTS, ACCEPT, REMOVE } = ENDPOINTS.CONTACTS;

const PUBLIC_CONTACT_FIELDS = 'displayName username profilePic';

// Pushes a live update to the other party so their contacts/requests lists refresh without
// needing to navigate away and back. Payload-free by design — the client just refetches,
// so there's one source of truth (the REST response) instead of two shapes to keep in sync.
function notifyUser(userId: Types.ObjectId | string, event: string) {
  const socketIds = getReceiverSocketId(String(userId));
  if (socketIds && socketIds.size > 0) {
    socketIds.forEach((socketId) => io.to(socketId).emit(event));
  }
}

export const getContacts = async (req: Request, res: Response) => {
  log.info(`'${BASE}${LIST}' (GET) endpoint reached`);
  try {
    const myId = req.user!._id;

    const accepted = await ContactRequest.find({
      status: 'accepted',
      $or: [{ requester: myId }, { recipient: myId }],
    });

    // The frontend needs the relationship's own id to let a user remove/unfriend a contact.
    const requestIdByOtherUserId = new Map(
      accepted.map((c) => [
        (c.requester.equals(myId) ? c.recipient : c.requester).toString(),
        c._id,
      ])
    );

    const contacts = await User.find({
      _id: { $in: [...requestIdByOtherUserId.keys()] },
    }).select(PUBLIC_CONTACT_FIELDS);

    res.status(200).json(
      contacts.map((u) => ({
        _id: u._id,
        displayName: u.displayName,
        username: u.username,
        profilePic: u.profilePic,
        contactRequestId: requestIdByOtherUserId.get(u._id.toString()),
      }))
    );
  } catch (error) {
    log.error(error, 'Error in getContacts controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getIncomingRequests = async (req: Request, res: Response) => {
  log.info(`'${BASE}${REQUESTS}' (GET) endpoint reached`);
  try {
    const myId = req.user!._id;

    const pending = await ContactRequest.find({ recipient: myId, status: 'pending' });
    const requesters = await User.find({
      _id: { $in: pending.map((r) => r.requester) },
    }).select(PUBLIC_CONTACT_FIELDS);
    const requesterById = new Map(requesters.map((u) => [u._id.toString(), u]));

    res.status(200).json(
      pending.map((r) => ({
        _id: r._id,
        requester: requesterById.get(r.requester.toString()),
      }))
    );
  } catch (error) {
    log.error(error, 'Error in getIncomingRequests controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendContactRequest = async (req: Request, res: Response) => {
  log.info(`'${BASE}${REQUESTS}' (POST) endpoint reached`);
  try {
    const myId = req.user!._id;
    const { username } = normalizeInputs({ username: req.body.username });

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const recipient = await User.findOne({ username });
    if (!recipient) {
      return res.status(404).json({ message: 'No user found with that username' });
    }

    if (recipient._id.equals(myId)) {
      return res.status(400).json({ message: "You can't add yourself" });
    }

    // Look for an existing relationship in either direction
    const existing = await ContactRequest.findOne({
      $or: [
        { requester: myId, recipient: recipient._id },
        { requester: recipient._id, recipient: myId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(409).json({ message: 'You are already contacts' });
      }

      // They already requested you — a mutual add collapses straight into acceptance
      // instead of leaving two dangling pending requests.
      if (existing.requester.equals(recipient._id)) {
        existing.status = 'accepted';
        await existing.save();
        notifyUser(recipient._id, 'contactRequestAccepted');
        return res.status(200).json({ message: 'Contact request accepted', status: 'accepted' });
      }

      return res.status(409).json({ message: 'Contact request already sent' });
    }

    await ContactRequest.create({ requester: myId, recipient: recipient._id, status: 'pending' });
    log.info({ requester: myId, recipient: recipient._id }, 'Contact request sent');
    notifyUser(recipient._id, 'newContactRequest');
    res.status(201).json({ message: 'Contact request sent', status: 'pending' });
  } catch (error) {
    log.error(error, 'Error in sendContactRequest controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const acceptContactRequest = async (req: Request, res: Response) => {
  log.info(`'${BASE}${ACCEPT}' (POST) endpoint reached`);
  try {
    const myId = req.user!._id;
    const { id } = req.params;

    const request = await ContactRequest.findOne({ _id: id, recipient: myId, status: 'pending' });
    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    request.status = 'accepted';
    await request.save();

    log.info({ requestId: id, userId: myId }, 'Contact request accepted');
    notifyUser(request.requester, 'contactRequestAccepted');
    res.status(200).json({ message: 'Contact request accepted' });
  } catch (error) {
    log.error(error, 'Error in acceptContactRequest controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handles reject (incoming pending), cancel (outgoing pending), and unfriend (accepted) —
// all three are the same operation: delete the relationship, gated by being a party to it.
export const removeContact = async (req: Request, res: Response) => {
  log.info(`'${BASE}${REMOVE}' (DELETE) endpoint reached`);
  try {
    const myId = req.user!._id;
    const { id } = req.params;

    const request = await ContactRequest.findOneAndDelete({
      _id: id,
      $or: [{ requester: myId }, { recipient: myId }],
    });

    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    const otherPartyId = request.requester.equals(myId) ? request.recipient : request.requester;
    log.info({ requestId: id, userId: myId }, 'Contact relationship removed');
    notifyUser(otherPartyId, 'contactRemoved');
    res.status(200).json({ message: 'Removed' });
  } catch (error) {
    log.error(error, 'Error in removeContact controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Used by message.controller.ts to gate messaging to accepted contacts only.
export const areContacts = async (
  userAId: Types.ObjectId | string,
  userBId: Types.ObjectId | string
): Promise<boolean> => {
  const relationship = await ContactRequest.findOne({
    status: 'accepted',
    $or: [
      { requester: userAId, recipient: userBId },
      { requester: userBId, recipient: userAId },
    ],
  });
  return Boolean(relationship);
};
