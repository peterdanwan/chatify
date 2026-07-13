// backend/src/controllers/auth.controller.js

import { createLogger } from '#config/logger.js';
import { ENDPOINTS } from '#config/endpoints.js';
import { User } from '#models/User.js';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '#emails/emailHandlers.js';
import {
  generateToken,
  clearToken,
  normalizeInputs,
  validateEmail,
  validateSafePassword,
  validateUsername,
  allStringsAreNotEmpty,
  toPublicUser,
} from '#lib/utils.js';
import cloudinary from '#lib/cloudinary.js';

const log = createLogger(import.meta.url);
const { BASE, SIGNUP, LOGIN, LOGOUT, DELETE_USER, UPDATE_PROFILE, PREFERENCES, ACCOUNT } =
  ENDPOINTS.AUTH;

import type { Request, Response } from 'express';

// Ref: https://mongoosejs.com/docs/api/model.html
// PW: Reference the link above to find different CRUD operations methods and more for your Mongoose Models

export const signup = async (req: Request, res: Response) => {
  log.info(`'${BASE}${SIGNUP}' (POST) endpoint reached`);

  const { displayName, username, email, password } = normalizeInputs(req.body);

  try {
    if (!allStringsAreNotEmpty(displayName, username, email, password)) {
      log.warn('Sign up attempt with missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      log.warn({ email }, 'Sign up attempt with invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validateUsername(username)) {
      log.warn({ username }, 'Sign up attempt with invalid username format');
      return res.status(400).json({
        message: 'Username must be 3-20 characters: lowercase letters, numbers, underscore only',
      });
    }

    if (!validateSafePassword(password)) {
      log.warn('Sign up attempt with password that is too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    log.debug({ email }, 'Checking if user already exists in database');

    // Check if the user exists by checking for the same email in our database.
    // Ref: https://mongoosejs.com/docs/models.html
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findOne()
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      log.warn({ email }, 'Sign up attempt with email that already exists');
      return res.status(400).json({ message: 'Account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username }).exec();

    if (existingUsername) {
      log.warn({ username }, 'Sign up attempt with username that already exists');
      return res.status(409).json({ message: 'Username is already taken' });
    }

    log.debug('Hashing password for new user');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Proceed with creating a user
    const newUser = new User({
      displayName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Save our new user before generating a token so we don't make a token for a non-persisted user.
      // The code below can throw an error (e.g., if there's a signup duplicate).
      log.debug({ email }, 'Saving new user to database');
      const savedUser = await newUser.save();
      log.debug({ userId: savedUser._id }, 'New user saved to database');

      generateToken(savedUser._id.toString(), res);
      log.debug({ userId: savedUser._id }, 'JWT token generated');

      log.info(
        { userId: savedUser._id, email: savedUser.email },
        `New user "${displayName}" successfully created`
      );

      res.status(201).json(toPublicUser(savedUser));

      // Fire-and-forget; do not delay response based on email latency (i.e., don't use try-catch on this async function)
      log.debug({ email: savedUser.email }, 'Sending welcome email (fire-and-forget)');
      sendWelcomeEmail(savedUser.email, displayName, process.env.CLIENT_URL as string).catch(
        (error) => {
          // PW: err has a special meaning to pino. if we didn't put the key of "err" for error, the error wouldn't show up
          // Ref: https://getpino.io/#/docs/api?id=error
          // Ref: https://getpino.io/#/docs/api?id=mergingobject
          log.error({ err: error, email: savedUser.email }, 'Error sending welcome email');
        }
      );
    } else {
      log.warn('Failed to create new user instance.');
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    log.error(error, 'Error in signup controller');

    // Handle race-condition: unique email constraint violation
    const e = error as {
      code?: number;
      keyPattern?: Record<string, unknown>;
      keyValue?: Record<string, unknown>;
    };
    if (e?.code === 11000 && (e.keyPattern?.['email'] || e.keyValue?.['email'])) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    if (e?.code === 11000 && (e.keyPattern?.['username'] || e.keyValue?.['username'])) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  log.info(`'${BASE}${LOGIN}' (POST) endpoint reached`);

  const { email, password } = normalizeInputs(req.body);

  try {
    if (!allStringsAreNotEmpty(email, password)) {
      log.warn('Login attempt with missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      log.warn({ email }, 'Login attempt with invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    log.debug({ email }, 'Looking up user for login');
    const loggedInUser = await User.findOne({ email });

    if (!loggedInUser) {
      // NOTE: never tell the client what didn't pass (email or password)
      log.warn({ email }, 'Login attempt for non-existent user');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    // OAuth-only accounts have no password; reject silently to avoid revealing auth method
    if (!loggedInUser.password) {
      log.warn({ email }, 'Login attempt on OAuth-only account');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    log.debug({ userId: loggedInUser._id }, 'Comparing password hash');
    const passwordMatches = await bcrypt.compare(password, loggedInUser.password);

    if (!passwordMatches) {
      log.warn({ userId: loggedInUser._id, email }, 'Login attempt with incorrect password');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    generateToken(loggedInUser._id.toString(), res);
    log.debug({ userId: loggedInUser._id }, 'JWT token generated');

    log.info(
      { userId: loggedInUser._id, email: loggedInUser.email },
      `User ${loggedInUser.displayName} successfully signed in`
    );

    res.status(200).json(toPublicUser(loggedInUser));
  } catch (error) {
    // Ref: https://getpino.io/#/docs/api?id=mergingobject
    // Ref: https://getpino.io/#/docs/api?id=error
    log.error({ err: error }, 'Error in login controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (_req: Request, res: Response) => {
  log.info(`'${BASE}${LOGOUT}' (POST) endpoint reached`);

  clearToken(res);
  log.debug('JWT token cleared from response');

  res.status(200).json({ message: 'Logged out successfully' });
};

export const deleteUser = async (req: Request, res: Response) => {
  log.info(`'${BASE}${DELETE_USER}' (DELETE) endpoint reached`);

  // protectRoute already proved identity via a valid JWT, so we act on req.user's id
  // rather than re-deriving the target from the request body.
  const userId = req.user!._id;
  const { password } = normalizeInputs(req.body);

  try {
    // protectRoute's query excludes the password field, so re-fetch it here.
    // This document is never sent in a response, so there's no leak risk.
    const existingUser = await User.findById(userId).exec();

    if (!existingUser) {
      log.warn({ userId }, 'Delete attempt for non-existent user');
      return res.status(404).json({ message: 'User not found' });
    }

    // Only local accounts have a password to re-verify. OAuth-only accounts
    // are already authenticated via the JWT, so there's nothing further to check.
    if (existingUser.password) {
      if (!password) {
        log.warn({ userId }, 'Delete user attempt with missing password');
        return res.status(400).json({ message: 'Password is required' });
      }

      log.debug({ userId }, 'Verifying password for user deletion');
      const passwordMatches = await bcrypt.compare(password, existingUser.password);

      if (!passwordMatches) {
        log.warn({ userId }, 'Delete attempt with incorrect password');
        return res.status(401).json({ message: 'Invalid credentials. Cannot delete' });
      }
    }

    log.debug({ userId }, 'Deleting user from database');
    await User.findByIdAndDelete(userId);
    log.info(
      { userId, email: existingUser.email },
      `User ${existingUser.email} successfully deleted`
    );

    clearToken(res);
    log.debug('JWT token cleared from response');

    return res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    // Ref: https://getpino.io/#/docs/api?id=error
    // Ref: https://getpino.io/#/docs/api?id=mergingobject
    log.error({ err: error }, 'Error in deleteUser controller');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  log.info(`'${BASE}${UPDATE_PROFILE}' (PUT) endpoint reached`);

  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      log.warn('Profile picture is missing');
      return res.status(400).json({ message: 'Profile pic is required' });
    }

    // The "protectRoute" middleware lets us access the user directly from the "req" object.
    // Without the setup in our middleware, req.user would be undefined and we would have broken code.
    const userId = req.user!._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(201).json(toPublicUser(updatedUser!));
  } catch (error) {
    log.error(error, 'Error in updateProfile controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handles both the one-time username claim (new OAuth users) and later edits to
// displayName/username from settings. Either field is optional; only what's provided is validated + saved.
export const updateAccount = async (req: Request, res: Response) => {
  log.info(`'${BASE}${ACCOUNT}' (PUT) endpoint reached`);

  try {
    const displayName = normalizeInputs({ displayName: req.body.displayName }).displayName;
    const username = normalizeInputs({ username: req.body.username }).username;
    const userId = req.user!._id;

    const updates: { displayName?: string; username?: string } = {};

    if (req.body.displayName !== undefined) {
      if (!displayName) {
        log.warn({ userId }, 'Update account attempt with empty displayName');
        return res.status(400).json({ message: 'Display name cannot be empty' });
      }
      updates.displayName = displayName;
    }

    if (req.body.username !== undefined) {
      if (!validateUsername(username)) {
        log.warn({ userId }, 'Update account attempt with invalid username format');
        return res.status(400).json({
          message: 'Username must be 3-20 characters: lowercase letters, numbers, underscore only',
        });
      }

      const existingUsername = await User.findOne({ username, _id: { $ne: userId } }).exec();
      if (existingUsername) {
        log.warn({ userId, username }, 'Update account attempt with username already taken');
        return res.status(409).json({ message: 'Username is already taken' });
      }

      updates.username = username;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    log.info({ userId, updates: Object.keys(updates) }, 'Account updated');
    res.status(200).json(toPublicUser(updatedUser!));
  } catch (error) {
    const e = error as { code?: number; keyPattern?: Record<string, unknown> };
    if (e?.code === 11000 && e.keyPattern?.['username']) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    log.error(error, 'Error in updateAccount controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  log.info(`'${BASE}${PREFERENCES}' (PUT) endpoint reached`);

  try {
    const { enableSound } = req.body;
    const userId = req.user!._id;

    if (typeof enableSound !== 'boolean') {
      log.warn('Invalid preference value');
      return res.status(400).json({ message: 'enableSound must be a boolean' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { enableSound }, { new: true });

    log.info({ userId, enableSound }, 'User preferences updated');
    res.status(200).json(toPublicUser(updatedUser!));
  } catch (error) {
    log.error(error, 'Error in updatePreferences controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};
