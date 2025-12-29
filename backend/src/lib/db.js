// backend/src/lib/db.js

import mongoose from 'mongoose';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'db.js' });
const { USE_LOCAL_DB, MONGO_DB_LOCAL_URI, MONGO_DB_URI } = process.env;

// This function can throw 2 errors.
// 1. When mongoURI isn't defined.
// 2. When mongoose.connect() cannot connect to the MongoDB database.
export const connectDB = async () => {
  const isLocal = USE_LOCAL_DB === 'true';
  const mongoURI = isLocal ? MONGO_DB_LOCAL_URI : MONGO_DB_URI;
  log.info(`Connecting to MongoDB ${isLocal ? 'locally' : 'on the cloud'}`);

  if (!mongoURI) {
    throw new Error('"mongoURI" is not defined. Check your MONGO_DB_LOCAL_URI or MONGO_DB_URI');
  }

  const conn = await mongoose.connect(mongoURI);
  // Must use string interpolation for dbLogger.info() i.e., not dbLogger.info("text: ", string);
  log.info(`Connected to MongoDB successfully: ${conn.connection.host}`);
};
