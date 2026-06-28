// backend/src/lib/db.ts

import mongoose from 'mongoose';
import { createLogger } from '#config/logger.js';

const log = createLogger(import.meta.url);
const { USE_LOCAL_DB, MONGO_DB_LOCAL_URI, MONGO_DB_URI } = process.env;

export const connectDB = async () => {
  const isLocal = USE_LOCAL_DB === 'true';
  const mongoURI = isLocal ? MONGO_DB_LOCAL_URI : MONGO_DB_URI;
  log.info(`Connecting to MongoDB ${isLocal ? 'locally' : 'on the cloud'}`);

  const conn = await mongoose.connect(mongoURI);
  // Must use string interpolation for dbLogger.info() i.e., not dbLogger.info("text: ", string);
  log.info(`Connected to MongoDB successfully: ${conn.connection.host}`);
};
