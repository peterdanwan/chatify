// backend/src/controllers/auth.controller.js

import { parentLogger } from '#config/logger.js';
import { User } from '#models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '#lib/utils.js';

const log = parentLogger.child({ module: 'auth.controller.js' });

// Ref: https://mongoosejs.com/docs/api/model.html
// PW: Reference the link above to find different CRUD operations methods and more for your Mongoose Models

export const signup = async (req, res) => {
  log.info('Sign up endpoint reached.');

  const { firstName, lastName, email, password } = req.body;

  const normalizedFirstName = typeof firstName === 'string' ? firstName.trim() : '';
  const normalizedLastName = typeof lastName === 'string' ? lastName.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPassword = typeof password === 'string' ? password : '';

  try {
    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !normalizedPassword) {
      log.debug('Some signup info is missing.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (normalizedPassword.length < 6) {
      log.debug('User password is too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      log.debug('User sent in an invalid email.');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if the user exists by checking for the same email in our database.
    // Ref: https://mongoosejs.com/docs/models.html
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findOne()
    const existingUser = await User.findOne({ normalizedEmail }).exec();

    if (existingUser) {
      log.info('Cannot sign up: user with email already exists.');
      return res.status(400).json({ message: 'Account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPassword, salt);

    // Proceed with creating a user
    const newUser = new User({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (newUser) {
      // Save our new user before generating a token so we don't make a token for a non-persisted user.
      await newUser.save();
      generateToken(newUser._id, res);

      log.info(`New user: "${normalizedFirstName} ${normalizedLastName}" sucessfully created.`);

      return res.status(201).json({
        _id: newUser._id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        profilePic: newUser.profilePic,
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

  res.send('Signup endpoint');
};

export const login = async (req, res) => {
  log.info('Login endpoint reached');

  const { email, password } = req.body;

  try {
    // TODO: Ensure email and password aren't blank

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ message: 'Cannot find user' });
    }
  } catch (error) {
    log.error(error, 'Error with login:');
  }

  res.send('Login endpoint');
};

export const logout = (req, res) => {
  log.info('Logout endpoint reached');

  res.send('Logout endpoint');
};
