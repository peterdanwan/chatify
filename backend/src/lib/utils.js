// backend/src/lib/utils.js

import jwt from 'jsonwebtoken';

const { NODE_ENV, JWT_SECRET } = process.env;

/**
 * Generate a JWT string and send it back as a cookie within the response sent to the client
 *
 * JWT Structure:
 * The token is a string with three base64url-encoded parts separated by dots:
 * xxxxx.yyyyy.zzzzz
 *
 * 1. Header (xxxxx): Contains metadata like algorithm type (HS256) and token type (JWT)
 * 2. Payload (yyyyy): Contains the data - { userId, iat (issued at), exp (expiration) }
 * 3. Signature (zzzzz): Cryptographic signature created using JWT_SECRET to verify integrity
 *
 * Example token:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWExYjJjM2Q0ZTVmNiIsImlhdCI6MTcwNTQzMjEwMCwiZXhwIjoxNzA2MDM2OTAwfQ.4K8h7Xu_N9vZ2mY5qT6rL3pW8jF1kS0nX9cD2aE4bH8
 *
 * Key characteristics:
 * - String format (typically 150-300 characters)
 * - URL-safe (uses base64url encoding)
 * - Payload is readable by anyone (not encrypted, just encoded)
 * - Signature ensures the token hasn't been tampered with
 */
export const generateToken = (userId, res) => {
  // Create JWT token containing the userId, signed with secret, expires in 7 days
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  // Send token as an HTTP-only cookie for security
  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development', // use HTTPS in production
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
