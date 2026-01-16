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
import cloudinary from '#lib/cloudinary.js';

const log = parentLogger.child({ module: 'auth.controller.js' });

// Ref: https://mongoosejs.com/docs/api/model.html
// PW: Reference the link above to find different CRUD operations methods and more for your Mongoose Models

export const signup = async (req, res) => {
  log.info('/signup (POST) endpoint reached');

  const { firstName, lastName, email, password } = normalizeInputs(req.body);

  try {
    if (!allStringsAreNotEmpty(firstName, lastName, email, password)) {
      log.warn('Sign up attempt with missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      log.warn({ email }, 'Sign up attempt with invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
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

    log.debug('Hashing password for new user');
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
      log.debug({ email }, 'Saving new user to database');
      const savedUser = await newUser.save();
      log.debug({ userId: savedUser._id }, 'New user saved to database');

      generateToken(savedUser._id, res);
      log.debug({ userId: savedUser._id }, 'JWT token generated');

      const fullName = `${savedUser.firstName} ${savedUser.lastName}`;
      log.info(
        { userId: savedUser._id, email: savedUser.email },
        `New user "${fullName}" successfully created`
      );

      res.status(201).json({
        _id: savedUser._id,
        fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
      });

      // Fire-and-forget; do not delay response based on email latency (i.e., don't use try-catch on this async function)
      log.debug({ email: savedUser.email }, 'Sending welcome email (fire-and-forget)');
      sendWelcomeEmail(savedUser.email, fullName, process.env.CLIENT_URL).catch((error) => {
        // PW: err has a special meaning to pino. if we didn't put the key of "err" for error, the error wouldn't show up
        // Ref: https://getpino.io/#/docs/api?id=error
        // Ref: https://getpino.io/#/docs/api?id=mergingobject
        log.error({ err: error, email: savedUser.email }, 'Error sending welcome email');
      });
    } else {
      log.warn('Failed to create new user instance.');
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    log.error(error, 'Error in signup controller');

    // Handle race-condition: unique email constraint violation
    if (error?.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  log.info('/login (POST) endpoint reached');

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

    log.debug({ userId: loggedInUser._id }, 'Comparing password hash');
    const passwordMatches = await bcrypt.compare(password, loggedInUser.password);

    if (!passwordMatches) {
      log.warn({ userId: loggedInUser._id, email }, 'Login attempt with incorrect password');
      return res.status(401).json({ message: 'Invalid credentials. Cannot log in' });
    }

    generateToken(loggedInUser._id, res);
    log.debug({ userId: loggedInUser._id }, 'JWT token generated');

    log.info(
      { userId: loggedInUser._id, email: loggedInUser.email },
      `User "${loggedInUser.firstName} ${loggedInUser.lastName}" successfully signed in`
    );

    res.status(200).json({
      _id: loggedInUser._id,
      fullName: loggedInUser.fullName,
      email: loggedInUser.email,
      profilePic: loggedInUser.profilePic,
    });
  } catch (error) {
    // Ref: https://getpino.io/#/docs/api?id=mergingobject
    // Ref: https://getpino.io/#/docs/api?id=error
    log.error({ err: error }, 'Error in login controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (_, res) => {
  log.info("'/logout' (POST) endpoint reached");

  clearToken(res);
  log.debug('JWT token cleared from response');

  res.status(200).json({ message: 'Logged out successfully' });
};

export const deleteUser = async (req, res) => {
  log.info("'/delete-user' (DELETE) endpoint reached");

  const { email, password } = normalizeInputs(req.body);

  // Validate required fields
  if (!allStringsAreNotEmpty(email, password)) {
    log.warn('Delete user attempt with missing required fields');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    log.debug({ email }, 'Looking up user for deletion');
    const existingUser = await User.findOne({ email }).exec();

    if (!existingUser) {
      log.warn({ email }, 'Delete attempt for non-existent user');
      return res.status(401).json({ message: 'Invalid credentials. Cannot delete' });
    }

    log.debug({ userId: existingUser._id }, 'Verifying password for user deletion');
    const passwordMatches = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatches) {
      log.warn({ userId: existingUser._id, email }, 'Delete attempt with incorrect password');
      return res.status(401).json({ message: 'Invalid credentials. Cannot delete' });
    }

    log.debug({ userId: existingUser._id, email }, 'Deleting user from database');
    await User.findByIdAndDelete(existingUser._id);
    log.info(
      { userId: existingUser._id, email },
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

export const updateProfile = async (req, res) => {
  log.info("'/update-profile' (PUT) endpoint reached");

  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      log.warn('Profile picture is missing');
      return res.status(400).json({ message: 'Profile pic is required' });
    }

    // The "protectRoute" middleware lets us access the user directly from the "req" object.
    // Without the setup in our middleware, req.user would be undefined and we would have broken code.
    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    res.status(201).json(updatedUser);
  } catch (error) {
    log.error(error, 'Error in updateProfile controller');
    res.status(500).json({ message: 'Internal server error' });
  }
};
