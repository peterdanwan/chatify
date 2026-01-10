// backend/src/lib/utils.js

import jwt from 'jsonwebtoken';

const { NODE_ENV, JWT_SECRET } = process.env;

// Generate a JWT and send it back as a cookie within the response sent to the client
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development',
  });

  return token;
};

// Clear the "jwt" token created from generateToken (stored in the client's browser), effectively logging out the user
export const clearToken = (res) => {
  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development',
  });
};

export const normalizeString = (value) => {
  return typeof value === 'string' ? value.trim() : '';
};

export const normalizeEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

export const normalizePassword = (password) => {
  return typeof password === 'string' ? password : '';
};

export const normalizeInputs = (inputs) => {
  return {
    firstName: normalizeString(inputs.firstName),
    lastName: normalizeString(inputs.lastName),
    email: normalizeEmail(inputs.email),
    password: normalizePassword(inputs.password),
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const validateSafePassword = (password) => {
  return password.length >= 6;
};

export const allStringsAreNotEmpty = (...values) => {
  return values.every((value) => typeof value === 'string' && value.length > 0);
};
