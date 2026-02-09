// backend/src/controllers/message.controller.js

import { createLogger } from '#config/logger.js';
import { ENDPOINTS, ENDPOINT_PREFIXES } from '#config/endpoints.js';
import cloudinary from '#lib/cloudinary.js';
import { Message } from '#models/Message.js';
import { User } from '#models/User.js';

const log = createLogger(import.meta.url);
const ENDPOINT_PREFIX = ENDPOINT_PREFIXES.MESSAGES;
const { CONTACTS, CHATS, BY_USER_ID, SEND_TO_ID } = ENDPOINTS.MESSAGES;

export const getAllContacts = async (req, res) => {
  log.info(`'${ENDPOINT_PREFIX}${CONTACTS}' (GET) endpoint reached`);
  try {
    // .id return a string representation of _id (i.e., _id.toString())
    //   e.g.: '507f1f77bcf86cd799439011'
    // ._id return an ObjectId instance / whatever type specified for _id (this is the thing stored in MongoDB)
    //   e.g.: ObjectId('507f1f77bcf86cd799439011')
    const loggedInUserId = req.user._id;
    log.debug({ loggedInUserId }, 'loggedInUserId');

    log.debug("Retrieving the logged-in user's contacts (without getting their passwords)");
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

    log.info({ filteredUsers }, 'Returning list of contacts');
    res.status(200).json(filteredUsers);
  } catch (error) {
    log.error(error, 'Error in getAllContacts controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChatPartners = async (req, res) => {
  log.info(`'${ENDPOINT_PREFIX}${CHATS}' (GET) endpoint reached`);

  try {
    const loggedInUserId = req.user._id;
    const loggedInUserName = `${req.user.firstName} ${req.user.lastName}`;

    log.debug(`Getting chat partners for ${loggedInUserName} (User ID: ${loggedInUserId})`);

    // Find all the messages where the logged-in user is either the sender or the receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    // Using the retrieved messages, build an array of ids that are NOT the loggedInUserId (i.e., the chatPartnerIds)
    // This array might not necessarily consist of unique chatPartnerIds if you have a lot of messages.
    // Create a new Set using the array of potentiatlly duplicated ids.
    // Then, using the results of the Set, spread them into a new array that will have an array of unique Ids
    const uniqueChatPartnerIds = [
      ...new Set(
        messages.map((message) =>
          message.senderId.toString() === loggedInUserId.toString()
            ? message.receiverId.toString()
            : message.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: uniqueChatPartnerIds } }).select(
      '-password'
    );

    log.debug({ chatPartners }, `Retrieved chatPartners for ${loggedInUserName}`);
    log.info(`Found chatPartners for ${loggedInUserName}`);

    res.status(200).json(chatPartners);
  } catch (error) {
    log.error(error, 'Error in getChatPartners controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessagesByUserId = async (req, res) => {
  log.info(`'${ENDPOINT_PREFIX}${BY_USER_ID}' (GET) endpoint reached`);

  // Obtain req.user from our "protectRoute" middleware
  const myId = req.user._id;
  const { id: userToChatId } = req.params;

  try {
    log.debug('Finding messages between sender and recipient');
    // Getting messages:
    // With regards to messages between people
    const messages = await Message.find({
      $or: [
        // The messages I send you
        { senderId: myId, receiverId: userToChatId },
        // The messages you send me
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    log.debug({ messages }, 'Retrieved messages between sender and recipient');
    log.info('Found Message');

    res.status(200).json(messages);
  } catch (error) {
    log.error(error, 'Error in getMessagesByUserId controller');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  log.info(`'${ENDPOINT_PREFIX}${SEND_TO_ID}' (POST) endpoint reached`);

  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Text and Image validation
    if (!text && !image) {
      log.warn('Missing text and image');
      return res.status(400).json({ message: 'Text or image is required.' });
    }

    // Prevent users from sending messages to themselves
    if (senderId.equals(receiverId)) {
      log.warn('User attempted to send a message to themselves (Invalid Request)');
      return res.status(400).json({ message: 'Cannot send messages to yourself.' });
    }

    // Validate that the recipient of the message exists
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      log.warn(`No receiver with id: ${receiverId} exists`);
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    let imageUrl = '';

    if (image) {
      // Upload the base64 image to cloudinary
      log.debug('Uploading image to Cloudinary');
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      log.debug(
        'Uploaded image to Cloudinary. Getting the secure_url from Cloudinary for the image'
      );
    }

    // NOTE: a Message can contain both an image and text
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    log.debug({ newMessage }, 'Saving a new Message to the database');
    await newMessage.save();

    log.info('New message successfully saved');

    // TODO: send message in real-time if user is online via socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    log.error(error, 'Error with sendMessage controller');
    res.status(500).json({ error: 'Internal server error' });
  }
};
