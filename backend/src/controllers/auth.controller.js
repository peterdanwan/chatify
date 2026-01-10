// backend/src/controllers/auth.controller.js

import { parentLogger } from '#config/logger.js';
import { User } from '#models/User.js';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '#emails/emailHandlers.js';
import {
  generateToken,
  clearToken,
  normalizeInputs,
  validateEmail,
  validateSafePassword,
  allStringsAreNotEmpty,
} from '#lib/utils.js';

const log = parentLogger.child({ module: 'auth.controller.js' });

// Ref: https://mongoosejs.com/docs/api/model.html
// PW: Reference the link above to find different CRUD operations methods and more for your Mongoose Models

export const signup = async (req, res) => {
  log.info('Sign up endpoint reached.');

  const { firstName, lastName, email, password } = normalizeInputs(req.body);

  try {
    if (!allStringsAreNotEmpty(firstName, lastName, email, password)) {
      log.debug('Some signup info is missing.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      log.debug('User sent in an invalid email.');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validateSafePassword(password)) {
      log.debug('User password is too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if the user exists by checking for the same email in our database.
    // Ref: https://mongoosejs.com/docs/models.html
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findOne()
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      log.info('Cannot sign up: user with email already exists.');
      return res.status(400).json({ message: 'Account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Proceed with creating a user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Save our new user before generating a token so we don't make a token for a non-persisted user.
      // The code below can throw an error (e.g., if there's a signup duplicate).
      const savedUser = await newUser.save();
      log.info('Saved the new user to the database');

      generateToken(savedUser._id, res);
      log.info('Generated token.');

      const fullName = `${savedUser.firstName} ${savedUser.lastName}`;
      log.info(`New user: "${fullName}" sucessfully created.`);

      res.status(201).json({
        _id: savedUser._id,
        fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
      });

      // Fire-and-forget; do not delay response based on email latency (i.e., don't use try-catch on this async function)
      sendWelcomeEmail(savedUser.email, fullName, process.env.CLIENT_URL).catch((error) => {
        log.error(error, 'Error with sending welcome email:');
      });
    } else {
      log.info('Could not create a new user.');
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    log.error(error, 'Error with signup controller:');

    // Handle race-condition: unique email constraint violation
    if (error?.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  log.info('Login endpoint reached');

  const { email, password } = normalizeInputs(req.body);

  try {
    if (!allStringsAreNotEmpty(email, password)) {
      log.debug('Some login info is missing.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      log.debug('User sent in an invalid email.');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const loggedInUser = await User.findOne({ email });
    if (!loggedInUser) {
      // NOTE: never tell the client what didn't pass (email or password)
      log.info('Login attempt: Could not find user with this email and password combination');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    const passwordMatches = await bcrypt.compare(password, loggedInUser.password);
    if (!passwordMatches) {
      log.info('Login attempt: Password does not match');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    generateToken(loggedInUser._id, res);

    log.info(`"${loggedInUser.firstName} ${loggedInUser.lastName}" sucessfully signed in.`);

    res.status(200).json({
      _id: loggedInUser._id,
      fullName: loggedInUser.fullName,
      email: loggedInUser.email,
      profilePic: loggedInUser.profilePic,
    });
  } catch (error) {
    log.error(error, 'Error with login controller:');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (_, res) => {
  log.info('Logout endpoint reached');

  clearToken(res);
  log.info('Cleared "jwt" token, logging out the user');

  res.status(200).json({ message: 'Logged out successfully' });
};

export const deleteUser = async (req, res) => {
  log.info('Delete user endpoint reached');

  const { email, password } = normalizeInputs(req.body);

  // Validate required fields
  if (!allStringsAreNotEmpty(email, password)) {
    log.info('Email or password missing for user deletion');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email }).exec();
    if (!existingUser) {
      log.info('Delete attempt: User with email could not be found');
      return res.status(401).json({ message: 'Invalid credentials. Cannot delete' });
    }

    const passwordMatches = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatches) {
      log.info('Delete attempt: Password does not match');
      return res.status(401).json({ message: 'Invalid credentials. Cannot delete' });
    }

    await User.findByIdAndDelete(existingUser._id);
    log.info(`User ${existingUser.email} successfully deleted`);

    clearToken(res);
    log.info('Cleared "jwt" token, logging out the user');

    return res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    log.error(error, 'Error with deleteUser controller');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
