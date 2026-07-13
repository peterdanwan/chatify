// backend/src/lib/utils.js

import jwt from 'jsonwebtoken';
import { fileTypeFromBuffer } from 'file-type';
import type { Response } from 'express';
import type { UserDocument } from '#models/User.js';

// import mongoose from 'mongoose';

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
export const generateToken = (userId: string, res: Response): string => {
  // Create JWT token containing the userId, signed with secret, expires in 7 days
  const token: string = jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: '7d' });

  // res.cookie(name, value, optionsObject) is a built-in express method made for SENDING/SETTING cookies to the browser/client
  // res.cookies is for READING cookies from the browser/client, and requires the cookie-parser middleware
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
export const clearToken = (res: Response): void => {
  // res.cookie(name, value, optionsObject) is a built-in express method made for SENDING/SETTING cookies to the browser/client
  // res.cookies is for READING cookies from the browser/client, and requires the cookie-parser middleware
  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true, // prevent XSS attacks (can't access this token via JS): cross-site scripting
    sameSite: 'strict', // prevent CSRF attacks
    secure: NODE_ENV !== 'development',
  });
};

export const normalizeString = (value: string): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const normalizeEmail = (email: string): string => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

export const normalizePassword = (password: string | undefined): string => {
  return typeof password === 'string' ? password : '';
};

type NormalizedInputs = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

export const normalizeInputs = (inputs: Partial<NormalizedInputs>): NormalizedInputs => {
  return {
    displayName: normalizeString(inputs.displayName ?? ''),
    username: normalizeString(inputs.username ?? '').toLowerCase(),
    email: normalizeEmail(inputs.email ?? ''),
    password: normalizePassword(inputs.password),
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const validateSafePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Lowercase letters, digits, underscore; 3-20 chars. Matches the lowercase: true on the schema field.
export const validateUsername = (username: string): boolean => {
  return /^[a-z0-9_]{3,20}$/.test(username);
};

export const allStringsAreNotEmpty = (...values: string[]) => {
  return values.every((value) => typeof value === 'string' && value.length > 0);
};

// The one place that decides what a user document is allowed to look like once it leaves
// the server. Every route that returns a user must go through this — never res.json(userDoc)
// directly — so the password hash can never leak, and the frontend gets hasPassword instead
// (needed to know whether to show a password field, e.g. on account deletion).
export const toPublicUser = (user: UserDocument) => ({
  _id: user._id,
  displayName: user.displayName,
  username: user.username,
  email: user.email,
  profilePic: user.profilePic,
  enableSound: user.enableSound,
  hasPassword: Boolean(user.password),
});

// export const validateObjectId = (paramName) => {
//   return (req, res, next) => {
//     const val = req.params[paramName];
//     if (!mongoose.Types.ObjectId.isValid(val)) {
//       return res.status(400).json({ message: 'Invalid user id' });
//     }
//     next();
//   };
// };

// Ref: https://www.npmjs.com/package/file-type

type IValidatedBase64Image = {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  declaredMimeType?: string;
  mismatch?: boolean;
};

export const validateBase64Image = async (
  base64String: string,
  maxSizeInMB = 5
): Promise<IValidatedBase64Image> => {
  if (!base64String || typeof base64String !== 'string') {
    return { isValid: false, error: 'Invalid image data' };
  }

  // Extract the base64 data
  const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);

  if (!matches) {
    return { isValid: false, error: 'Invalid base64 format' };
  }

  const declaredMimeType = matches[1];
  const base64Data = matches[2];

  // Convert to buffer to check actual file type
  const buffer = Buffer.from(base64Data, 'base64');

  // Detect ACTUAL file type from magic bytes
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType) {
    return { isValid: false, error: 'Could not determine file type' };
  }

  // Validate it's actually an image
  const allowedMimeTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
  ];

  if (!allowedMimeTypes.includes(detectedType.mime)) {
    return {
      isValid: false,
      error: 'Invalid image type. Allowed: JPG, JPEG, PNG, GIF, WebP, SVG+XML, TIFF, BMP',
    };
  }

  // Validate file size
  const sizeInBytes = buffer.length;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeInMB) {
    return { isValid: false, error: `Image size exceeds ${maxSizeInMB}MB limit` };
  }

  return {
    isValid: true,
    mimeType: detectedType.mime,
    declaredMimeType,
    mismatch: declaredMimeType !== detectedType.mime, // Flag for caller to handle
  };
};
